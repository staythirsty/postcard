
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

function DeckCtrl($scope,  $routeParams, Decks){

	$scope.deck = _.find(Decks.getDecks(), function(deck){ return deck.id == $routeParams.deckId});

	//variables that drived the hidden edit inputs
	$scope.editmode = {"key" : "" , "value" :"", "prevkey":"", "mode" : ""};

	$scope.editItem = function(key, mode){

		var objectList =  $scope.deck.properties;
		if(mode == "HEADER")
			objectList =  $scope.deck.headers;

		$scope.editmode.key = key;
		$scope.editmode.prevkey = key;
		$scope.editmode.value = _.findWhere(objectList,{'key' : key}).value;
		$scope.editmode.mode = mode;

	}
	
	$scope.cancelEditItem = function(){

		$scope.editmode.key = "";
		$scope.editmode.prevkey = "";
		$scope.editmode.value  = "";
		$scope.editmode.mode = "";

	}

	$scope.saveItem = function(mode){

		var objectList =  $scope.deck.properties;
		if(mode == "HEADER")
			objectList =  $scope.deck.headers;

		var currItem = _.findWhere(objectList,{'key' : $scope.editmode.prevkey});

		currItem.key = $scope.editmode.key;
		currItem.value = $scope.editmode.value;

		$scope.editmode.key = "";
		$scope.editmode.value  = "";
		$scope.editmode.current = "";
		$scope.editmode.mode = "";

	}
	
	$scope.addItem = function(mode){

		if(mode == "HEADER")
			$scope.deck.addHeader();
		else
			$scope.deck.addProperty();

		$scope.editItem('KEY', mode);

	}

	$scope.removeItem = function(key, mode){

		if(mode == "HEADER")
			$scope.deck.removeHeader(key);
		else
			$scope.deck.removeProperty(key);

	}

	$scope.save = function(){
		Decks.saveDecks();
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

	$scope.toggleLink = function(key){
		$scope.card.toggleLink(key);
	}

	$scope.refreshView = function(){

		var template = Handlebars.compile($scope.card.view);
		console.log($scope.card.responseData);
		$scope.card.display = template($scope.card.responseData);

	}

}

