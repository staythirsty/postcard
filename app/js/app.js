var postCardApp = angular.module('postCardApp', ['ngSanitize']);

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

postCardApp.directive('navdeck', function() {
    return {
      restrict: 'E',
      templateUrl: 'partials/deckDirective.html'
    }
});


postCardApp.factory('PostCardSvc', function() {

	var decks = [];

	//var state = {};

	var jsonDeckArray = JSON.parse(localStorage.getItem("decks"));

	if(jsonDeckArray == undefined || jsonDeckArray == null){
		decks.push(new Deck("My Deck"));
	}else{
		_.each(jsonDeckArray,function(jsonDeck){
			var deckObj = new Deck();
			deckObj.restore(jsonDeck);
			decks.push(deckObj);		
		});
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
		getDeckById: function (deckId){
			return _.find(this.getDecks(),function(deck){return deck.id == deckId});
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

