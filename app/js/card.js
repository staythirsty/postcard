//Card
function Card(name, deck){

	this.id = Card.counter++;
	this.name = name;
	this.deck = deck;
	this.description = "Description of " + name;
	this.url = "https://leap.haygroup.com:7150/v1/users/10";
	this.httpMethod = "GET";
	this.requestData = "{'name' : 'Naveen', 'Age' : '33', 'Address' : '131 KB Road'}";
	this.responseData = "";
	this.response = "";
	this.view = "<div><p>{{data.id}} - {{data.username}}</p></div><div><img src='{{data.pictureUrl}}'/></div>";
	this.display = "";
	this.headers = [{"key": "Content-Type","value" : "application/json"},{"key":"authToken","value":"b24cc8a6-4c5e-4039-99bb-d456be456a8b"}];
}

Card.counter = 0;

Card.prototype.restore = function(jsonObj){

	this.id = jsonObj.id;
	this.name = jsonObj.name;
	this.description = jsonObj.description;
	this.url = jsonObj.url;
	this.httpMethod = jsonObj.httpMethod;
	this.requestData = jsonObj.requestData;
	this.responseData = jsonObj.responseData;
	this.response = "";
	this.view = jsonObj.view;
	this.display = ""
	this.headers = jsonObj.headers;

}


Card.prototype.removeHeader = function (key){
	for (var i = this.headers.length - 1; i >= 0; i--) {
		if(this.headers[i].key == key){
			this.headers.splice(i,1);
			break;
		}
	}
}

Card.prototype.addHeader = function (){
	this.headers.push({"key":"","value":""});
}

Card.prototype.submit = function($http){

	var thisCard = this;
	var httpConfig = {};

	httpConfig.method = this.httpMethod;
	httpConfig.url = this.url;
	httpConfig.headers = {};
	if(httpConfig.method == 'POST' || httpConfig.method == "PUT"){
		httpConfig.data = this.requestData;
	}

	for (var i = this.headers.length - 1; i >= 0; i--) {
		httpConfig.headers[this.headers[i].key] = this.headers[i].value;
	}


	console.log(httpConfig);

	var httpPromise =  $http(httpConfig);

	httpPromise.success(function(data, status){
		thisCard.responseData = data;
		thisCard.response = JSON.stringify(data,null,'\t');
	});
		
	httpPromise.error(function(data, status){
		thisCard.responseData = data;
		thisCard.response = JSON.stringify(data,null,'\t');
	});
}




//Decks

function Deck(name){
	
	this.id = Deck.counter++;
	this.name = name;
	this.description = "Description of " + name;
	this.baseURL = "https://leap.haygroup.com:7150/v1/users/10";
	this.headers = [{"key": "Content-Type","value" : "application/json"},{"key":"authToken","value":"b24cc8a6-4c5e-4039-99bb-d456be456a8b"}];
	this.cards = [];
}

Deck.counter = 0;

Deck.prototype.add = function(name){
	var card = new Card(name, this);
	this.cards.push(card);
	return card;
}

Deck.prototype.restore = function(jsonObj){

	this.id = jsonObj.id;
	this.name = jsonObj.name;
	this.description = jsonObj.description;
	this.baseURL = jsonObj.baseURL;
	this.headers = jsonObj.headers;

	for (var i = 0; i < jsonObj.cards.length; i++) {
		var cardJsonObj = jsonObj.cards[i];
		var card = new Card("",this);
		card.restore(cardJsonObj);
		this.cards.push(card);
	}

}

Deck.prototype.json = function (){

	//var tempCards = this.cards;
	//this.cards = null;

	var replacer = function(key,value){ 
			if (key == 'deck') 
				return undefined;
			else 
				return value;
	}
	var json = JSON.stringify(this, replacer);
	//this.cards = tempCards;
	return json;

}



