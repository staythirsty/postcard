
function DecksCtrl($scope, $log, $route, $routeParams, $location, PostCardSvc){

	$scope.decks = PostCardSvc.getDecks();
	$scope.selectedDeck = PostCardSvc.getSelectedDeck();
	$scope.selectedCardId = $routeParams.cardId;


	$scope.addDeck = function(){
		$scope.decks.push(new Deck("My Deck"));
	}

	$scope.save = function(){
		$log.log("Saving Decks. Selected Deck" + $scope.selectedDeck.name);	
		PostCardSvc.putState('selectedDeck',$scope.selectedDeck.name);
		PostCardSvc.saveDecks();
	}

	$scope.addCard =  function(deckId){
		var deck = PostCardSvc.getDeckById(deckId);
		var card = deck.add('New Card');
		$location.path('/decks/' + deck.id + '/cards/' + card.id);
	}

	$scope.removeCard =  function(deckId, cardId) {
		var deck = PostCardSvc.getDeckById(deckId);
		deck.remove(cardId);
		$location.path('/decks/' + deck.id + '/cards/_');
	}
	$scope.cloneCard =  function(deckId, cardId) {
		var deck = PostCardSvc.getDeckById(deckId);
		var clonedCard = deck.clone(cardId);
		$location.path('/decks/' + deck.id + '/cards/' + clonedCard.id);
	}

	$scope.selectDeck = function(deck){
		$scope.selectedDeck = deck;
		PostCardSvc.putState('selectedDeck',$scope.selectedDeck.name);
		$location.path('/decks/' + deck.id + '/cards/_');
	}

	$scope.reload = function(){
		$route.reload();
	}

}

function DeckCtrl($scope,  $routeParams, PostCardSvc){

	$scope.deck = PostCardSvc.getDeckById($routeParams.deckId);

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

		$scope.errorFlag = false;
		$scope.errorMessage = null;

		try{

			if(mode == "HEADER")
				$scope.deck.addHeader($scope.headeraddmode.key,$scope.headeraddmode.value);
			else
				$scope.deck.addProperty($scope.propertyaddmode.key,$scope.propertyaddmode.value);


			$scope.headeraddmode.key = "";
			$scope.headeraddmode.value = "";
			$scope.propertyaddmode.key = "";
			$scope.propertyaddmode.value = "";

		}catch(err){
			console.log("error" + err);
			$scope.errorFlag = true;
			$scope.errorMessage = err.message;
		}


	}

	$scope.removeItem = function(key, mode){

		$scope.errorFlag = false;
		$scope.errorMessage = null;

		try{
			
			if(mode == "HEADER")
				$scope.deck.removeHeader(key);
			else
				$scope.deck.removeProperty(key);

		}catch(err){
			console.log("error" + err);
			$scope.errorFlag = true;
			$scope.errorMessage = err.message;
		}
	}
}


function CardCtrl($scope, $http, $compile, $routeParams, PostCardSvc){
	
	console.log("CardCtrl - Current Deck Id " + $routeParams.deckId);
	if($routeParams.deckId == "_"){
		$scope.deck = PostCardSvc.getSelectedDeck();
	}else{
		$scope.deck = PostCardSvc.getDeckById($routeParams.deckId);
	}

	console.log("CardCtrl - Current Deck Name " + $scope.deck.name);

	if($routeParams.cardId == "_"){
		$scope.card = $scope.deck.cards[0];
	}else{
		$scope.card = $scope.deck.getCardById($routeParams.cardId);
	}


	if($routeParams.opId != undefined || $routeParams.opId != null ){
		$scope.submit();
	}


	$scope.addmode = {"key":"","value":"","property":"","map":""};
	$scope.upaddmode = {"value":"","property":""};

	console.log($scope.card);

	$scope.refreshInputs = function() {

		$scope.card.refreshInputs();
	}
	
	$scope.proceedSubmit = function(){
		$('#resolve-modal').modal('hide');
		$scope.submit(true);
	}

	$scope.submit = function(override) {

		if(override != true){
			
			$scope.unresolvedBindings = $scope.card.resolveBindings();
		
			if($scope.unresolvedBindings.length > 0){
				$('#resolve-modal').modal('show');
			}else{
				var httpPromise = $scope.card.submit($http);
			}
		}else{
			var httpPromise = $scope.card.submit($http,override);
		}
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


	$scope.removeUrlParameter = function(property){
		$scope.card.removeUrlParameter(property);
	}
	$scope.addUrlParameter = function(){

		$scope.card.addUrlParameter ($scope.upaddmode.property, $scope.upaddmode.value);
		$scope.upaddmode.property = "";
		$scope.upaddmode.value = "";
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

