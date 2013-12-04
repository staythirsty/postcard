
function DecksCtrl($scope, PostCardSvc){

	$scope.decks = PostCardSvc.getDecks();
	
	$scope.selectedDeck = PostCardSvc.getState('selectedDeck');
	console.log("selectedDeck " + $scope.selectedDeck);

	if($scope.selectedDeck == null || $scope.selectedDeck == undefined){
		$scope.selectedDeck = PostCardSvc.getDecks()[0];
		PostCardSvc.putState('selectedDeck',$scope.selectedDeck);
	}
	console.log("selectedDeck name" + $scope.selectedDeck.name);


	$scope.addDeck = function(){
		$scope.decks.push(new Deck("My Deck"));
	}

	$scope.save = function(){
		PostCardSvc.saveDecks();
	}

	$scope.addCard =  function(deckId){

		var deck = _.find($scope.decks, function(deck){ return deck.id == deckId});
		deck.add('New Card');
	}

	$scope.removeCard =  function(deckId, cardId) {
		var deck = _.find($scope.decks, function(deck){ return deck.id == deckId});
		deck.remove(cardId);
	}

	$scope.selectDeck = function(deck){
		$scope.selectedDeck = deck;
		PostCardSvc.putState('selectedDeck',$scope.selectedDeck);
	}

}

function DeckCtrl($scope,  $routeParams, PostCardSvc){

	$scope.deck = _.find(PostCardSvc.getDecks(), function(deck){ return deck.id == $routeParams.deckId});

	//variables that drived the hidden edit inputs
	$scope.editmode = {"key" : "" , "value" :"", "prevkey":"", "mode" : ""};
	$scope.headeraddmode = {"key" : "" , "value" :""};
	$scope.propertyaddmode = {"key" : "" , "value" :""};

	$scope.editItem = function(key, mode){

		var objectList =  $scope.deck.properties;
		if(mode == "HEADER")
			objectList =  $scope.deck.headers;

		$scope.editmode.key = key;
		$scope.editmode.prevkey = key;
		$scope.editmode.value = _.findWhere(objectList,{'key' : key}).value;
		$scope.editmode.mode = mode;
		$scope.editmode.isNew = false;

	}
	
	$scope.cancelEditItem = function(){

		$scope.editmode.key = "";
		$scope.editmode.prevkey = "";
		$scope.editmode.value  = "";
		$scope.editmode.mode = "";

	}

	$scope.saveItem = function(mode){

		if(mode == "HEADER"){
				$scope.deck.updateHeader($scope.editmode.prevkey, $scope.editmode.key, $scope.editmode.value);
		}else{
			$scope.deck.updateProperty($scope.editmode.prevkey, $scope.editmode.key, $scope.editmode.value);
		}

		$scope.editmode.key = "";
		$scope.editmode.prevkey = "";
		$scope.editmode.value  = "";
		$scope.editmode.mode = "";
		$scope.editmode.isNew = false;

	}
	
	$scope.addItem = function(mode){

		if(mode == "HEADER")
			$scope.deck.addHeader($scope.headeraddmode.key,$scope.headeraddmode.value);
		else
			$scope.deck.addProperty($scope.propertyaddmode.key,$scope.propertyaddmode.value);


		$scope.headeraddmode.key = "";
		$scope.headeraddmode.value = "";
		$scope.propertyaddmode.key = "";
		$scope.propertyaddmode.value = "";
	}

	$scope.removeItem = function(key, mode){

		if(mode == "HEADER")
			$scope.deck.removeHeader(key);
		else
			$scope.deck.removeProperty(key);

	}

	$scope.save = function(){
		PostCardSvc.saveDecks();
	}
}


function CardCtrl($scope, $http, $compile, $routeParams, PostCardSvc){
	
	console.log($routeParams.deckId);
	$scope.deck = _.find(PostCardSvc.getDecks(),function(deck){return deck.id == $routeParams.deckId});

	console.log($scope.deck);
	$scope.card = _.find($scope.deck.cards, function(card){ return card.id == $routeParams.cardId});
	
	if($routeParams.opId != undefined || $routeParams.opId != null ){
		$scope.card.submit($http);
	}


	$scope.addmode = {"key":"","value":"","property":"","map":""};

	console.log($scope.card);

	$scope.submit = function() {
	    var httpPromise = $scope.card.submit($http);
	}

	$scope.reset = function(){
		$scope.card.reset();
	}

	$scope.removeHeader = function(key){
		$scope.card.removeHeader(key, Card.HEADER.LOCAL.TYPE);
	}
	$scope.addHeader = function(){
		$scope.card.addHeader(Card.HEADER.LOCAL.TYPE, $scope.addmode.key, $scope.addmode.value);
		$scope.addmode.key = "";
		$scope.addmode.value = "";
	}

	$scope.removeWiring = function(property){
		$scope.card.removeWiring(property);
	}
	$scope.addWiring = function(){

		$scope.card.addWiring($scope.addmode.property, $scope.addmode.map);
		$scope.addmode.property = "";
		$scope.addmode.map = "";
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

