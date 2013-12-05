var postCardApp = angular.module('postCardApp', ['ngSanitize']);

postCardApp.config(['$routeProvider', function($routeProvider) {
	    
	    $routeProvider.when('/decks/:deckId/cards/:cardId', {
	        templateUrl: 'partials/cards.html'
	      }).when('/decks/:deckId/cards/:cardId/:opId', {
	        templateUrl: 'partials/cards.html'
	      }).when('/cards', {
	        templateUrl: 'partials/cards.html',
	      }).when('/decks/:deckId', {
	        templateUrl: 'partials/decks.html',
	      }).otherwise({
	        redirectTo: '/cards'
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

	var state = {};

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
		getState: function(attr){
			return state[attr];
		},
		putState : function(attr, value){
			state[attr] = value;
		}


    }
});

