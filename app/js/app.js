var postCardApp = angular.module('postCardApp', ['ngSanitize']);

postCardApp.config(function($compileProvider){ $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome-extension):/); });

postCardApp.config(['$routeProvider', function($routeProvider) {
	    
	    $routeProvider.when('/decks/:deckId/cards/:cardId', {
	        templateUrl: 'partials/cards.html'
	      }).when('/decks/:deckId/cards/:cardId/:opId', {
	        templateUrl: 'partials/cards.html'
	      }).when('/decks/:deckId', {
	        templateUrl: 'partials/decks.html',
	      }).otherwise({
	        redirectTo: '/decks/_/cards/_'
	      });

}]);

postCardApp.directive('navdeck', function($timeout) {
    return {
      restrict: 'E',
      templateUrl: 'partials/deckDirective.html',
      link: function(scope, element, attrs){

      		$timeout(function() {

      			$('.sortable').sortable().bind('sortupdate', function() {
      				var cardIds = [];
      				$('.sortable li').each(function(i){
      					cardIds.push($(this).attr('id'));
      				});
					//alert(cardIds.join("--"));
					scope.selectedDeck.sort(cardIds);
        		});

      		}, 1000);
      }
    }
});

postCardApp.directive('alert', function(){
	return {
      restrict: 'E',
      templateUrl: 'partials/alert.html',
      controller: function($scope){
      	
      	$scope.close = function(){
      		$scope.alert.flag = false;
      	}

      }
	}

});


postCardApp.factory('PostCardSvc2', function() {

	var decks = [];

	//var state = {};
	var lsDecks = localStorage.getItem("decks");

	if(lsDecks != undefined || lsDecks != null){

		var jsonDeckArray = JSON.parse(lsDecks);

		if(jsonDeckArray == undefined || jsonDeckArray == null){
			decks.push(new Deck("My Deck"));
			localStorage.setItem("selectedDeck", "My Deck");
		}else{
			_.each(jsonDeckArray,function(jsonDeck){
				var deckObj = new Deck();
				deckObj.restore(jsonDeck);
				decks.push(deckObj);		
			});
		}	
	}else{
		decks.push(new Deck("My Deck"));
		localStorage.setItem("selectedDeck", "My Deck");
	}

	Deck.counter = _.max(decks, function(deck){return deck.id;}).id + 1;

	var tempArray  = [];

	_.each(decks,function(deck){
			var cardCounter = 0;
			if(_.isArray(deck.cards) && deck.cards.length > 0){
				cardCounter = _.max(deck.cards, function(card){return card.id;}).id;
				console.log("cardCounter" + cardCounter);
			}
			tempArray.push(cardCounter);
	});

	Card.counter = _.max(tempArray) + 1;

	/*
	if(_.isArray(deckObj.cards) && deckObj.cards > 0)
		Card.counter = _.max(deckObj.cards, function(card){return card.id;}).id + 1;
	else
		Card.counter = 0;
	*/

	console.log("Deck.counter" + Deck.counter);
	console.log("Card.counter" + Card.counter);


  return {

	  	getDecks: function () {
	    	return decks;                   
		},
		saveDecks: function() {
			var saveObj = "[";
			_.each(decks,function(deck){ saveObj += deck.json() + "," ; });
			saveObj = saveObj.substring(0, saveObj.length - 1);
			saveObj += "]";
			console.log(saveObj);
			localStorage.setItem("decks", saveObj);
			console.log(localStorage.getItem("decks"));
		},
		getDeckById: function (deckId, callback){

			//return _.find(this.getDecks(),function(deck){return deck.id == deckId});
			

		},
		getSelectedDeck: function(){

			//load the saved Deck from 'state' 
			var tempSelectedDeckName = this.getState('selectedDeck');
			var tempSelectedDeck = _.find(this.getDecks(), function(deck){return deck.name == tempSelectedDeckName});

			console.log("selectedDeck (state) - " + tempSelectedDeck);

			if(tempSelectedDeck == null || tempSelectedDeck == undefined){
				tempSelectedDeck = this.getDecks()[0];
				PostCardSvc.putState('selectedDeck', tempSelectedDeck.name);

				console.log("selectedDeck (defaulted) - " + tempSelectedDeck.name);
			}
			return tempSelectedDeck;

		},
		setSelectedDeck: function(deckName){
			this.putState('selectedDeck', deckName);
		},
		getState: function(attr){
			return localStorage.getItem(attr);
			//return state[attr];
		},
		putState : function(attr, value){
			localStorage.setItem(attr, value);			
			//state[attr] = value;
		}


    }
});


postCardApp.factory('PostCardSvc', function() {


	var selectedDeckID = localStorage.getItem("selectedDeckID");
	var selectedDeck = null;
	var decks = [];
	var database;
	var initCompletedFlag = 0;
	var scopeContainer = [];

  return {

  		init: function(scope){

  			switch(initCompletedFlag){
				case 1:
					scopeContainer.push(scope);
					return;
				case 2:
					scope.init();
					return;
				default:
			  		initCompletedFlag = 1;
					scopeContainer.push(scope);
			}

			var request = indexedDB.open("postcarddb",3);

			request.onerror = function(event) {
				console.error("Unable to Open Indexed Database")
			};

			request.onupgradeneeded = function(event) {

				console.log("Database Upgrade Event");
				
				database = event.target.result;

				var objectStore = database.createObjectStore("decks", { autoIncrement : true });

				objectStore.transaction.oncomplete = function(event) {
		    		// Store values in the newly created objectStore.
		    		var tempDeck = new Deck("My Deck");
		    		tempDeck.add("My Card");
		    		var decksObjectStore = database.transaction("decks", "readwrite").objectStore("decks");
				    var idxRequest = decksObjectStore.add(tempDeck);
				    idxRequest.onsuccess = function(event){
				   	 	selectedDeckID = event.target.result.key;
						localStorage.setItem("selectedDeckID", selectedDeckID);

				    }
		  		}
			}

			request.onsuccess = function(event){

				database = event.target.result; // db.version will be 3.

				var decksObjectStore = database.transaction("decks", "readwrite").objectStore("decks");

				decksObjectStore.openCursor().onsuccess = function(evt) {
					
					var cursor = evt.target.result;

					if(selectedDeck == null){
						selectedDeckID = cursor.key;
						localStorage.setItem("selectedDeckID",selectedDeckID);
					}

					if (cursor) {

						var tempDeck = new Deck();
						tempDeck.restore(cursor.value);
						decks.push(tempDeck);

						if(selectedDeckID == cursor.key){
							selectedDeck = tempDeck;
						}
		            	cursor.continue();
		         	}

					var tempMaxCardId = 0;
					_.each(selectedDeck.cards, function(card){
						if(tempMaxCardId < card.id){
							tempMaxCardId = card.id;
						}
					});
					Card.counter = tempMaxCardId + 1;


					console.log("# of decks" + decks.length);
					console.log("selectedDeckID" + selectedDeckID);
					console.log("selectedDeck" + selectedDeck.name);
					console.log("Card.counter" + Card.counter);

					initCompletedFlag = 2;
					for (var i = scopeContainer.length - 1; i >= 0; i--) {
						scopeContainer[i].init();
					}
					scopeContainer = [];
				};

			}
  		},
	  	getDecks: function () {
	    	return decks;                   
		},
		saveDecks: function() {
			console.log("Saved Deck");
			_.each(decks,function(deck){
				var decksObjectStore = database.transaction("decks", "readwrite").objectStore("decks");
				decksObjectStore.put(deck,deck.id);
				console.log("Saved Deck ID " + deck.id);
			});			
		},
		getDeckById: function (deckId){
			return _.find(this.getDecks(),function(deck){return deck.id == deckId});
		},
		getSelectedDeck: function(){
			return selectedDeck;
		},
		setSelectedDeck: function(deck){
			selectedDeck = deck;
			localStorage.setItem('selectedDeckID', deck.id);	
		},
		deleteSelectedDeck: function(deckId){

			decks = _.reject(this.getDecks(),function(deck){return deck.id == deckId});

			if(decks.length == 0){
				decks.push(new Deck("My Deck"));
			}

			var decksObjectStore = database.transaction("decks", "readwrite").objectStore("decks");
			decksObjectStore.delete(deckId);
			
			this.setSelectedDeck(decks[0]);

		}
    }
});


