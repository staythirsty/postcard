var postCardApp = angular.module('postCardApp', ['ngSanitize']);

postCardApp.config(['$routeProvider', function($routeProvider) {
	    
	    $routeProvider.when('/cards/:cardId', {
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


postCardApp.factory('Decks', function() {

	var decks = [];

	var deck = localStorage.getItem("deck");
	var deckObj = new Deck();

	deckObj.restore(JSON.parse(deck));
	decks.push(deckObj);

	Card.counter = _.max(deckObj.cards, function(card){return card.id;}).id + 1;

	/*
	for (var j = 0; j < 1; j++){
		decks.push(new Deck("Deck #" + j));
		for (var i = 0; i < 5 ; i++) {
			decks[j].add("Card #" + i);
		}
	}
	//*/

  return {

	  	getDecks: function () {
	    	return decks;                   
		},

		saveDecks: function() {

			localStorage.setItem("deck", decks[0].json());
			console.log(localStorage.getItem("deck"));
		},
		addCard: function() {

			var newCard = new Card("New Card", decks[0]);
			decks[0].cards.push(newCard);
		
		},
		removeCard: function(cardId) {

			for (var i = 0; i < decks[0].cards.length; i++) {
				if(decks[0].cards[i].id == cardId){
					decks[0].cards.splice(i, 1);
					break;
				}
			}
		
		}


    }
});

