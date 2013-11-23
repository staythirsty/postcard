
function DecksCtrl($scope, Decks){

	$scope.decks = Decks.getDecks();

	$scope.save = function(){
		Decks.saveDecks();
	}

	$scope.addCard =  function(){
		Decks.addCard();
	}

	$scope.removeCard =  function(cardId) {
		Decks.removeCard(cardId);
	}

}


function CardCtrl($scope, $http, $compile, $routeParams, Decks){

	$scope.card = _.find(Decks.getDecks()[0].cards, function(card){ return card.id == $routeParams.cardId});

	console.log(Decks.getDecks()[0].cards);
	console.log($scope.card);

	$scope.submit = function() {
	    var httpPromise = $scope.card.submit($http);
	}

	$scope.reset = function(){
		$scope.card.responseData = null;
	}

	$scope.removeHeader = function(key){
		$scope.card.removeHeader(key);
	}
	$scope.addHeader = function(){
		$scope.card.addHeader();
	}
	$scope.refreshView = function(){

		var template = Handlebars.compile($scope.card.view);
		console.log($scope.card.responseData);
		$scope.card.display = template($scope.card.responseData);

	}

}

