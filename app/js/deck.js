//Decks
"use strict";

function Deck(name){
	
	this.id = Deck.counter++;
	this.name = name;
	this.properties = [];
	this.headers = [];
	this.cards = [];
}


Deck.counter = 0;

Deck.HEADER = {};
Deck.HEADER.INIT = {'key' : '' , 'value' : ''};

Deck.PROPERTY = {};
Deck.PROPERTY.INIT = {'key' : 'KEY' , 'value' : 'VALUE'};

 Deck.prototype.add = function(name){
	var card = new Card(name, this);
	this.cards.push(card);
	return card;
};

Deck.prototype.remove = function(cardId){

	var currItem = _.findWhere(this.cards, {"id" : cardId});
	this.cards = _.without(this.cards, currItem);

};


Deck.prototype.clone = function(cardId){

	var currItem = _.findWhere(this.cards, {"id" : cardId});
	var clonedCard = currItem.clone();
	this.cards.push(clonedCard);

	return clonedCard;
};


Deck.prototype.sort = function(cardOrder){

	var thisDeck = this;

	var newCardArray = [];
	
	_.each(cardOrder,function(cardId){

		newCardArray.push(_.findWhere(thisDeck.cards, {"id" : parseInt(cardId)}));

	});

	this.cards = newCardArray;

}


Deck.prototype.removeHeader = function (key){

	var currItem = _.findWhere(this.headers, {"key" : key});
	this.headers = _.without(this.headers, currItem);

	//remove from each card
	_.each(this.cards, function(card){
			console.log("card id " + card.id + " " + key);
			card.removeHeader(key);
	});

};

Deck.prototype.validateHeader = function (key, value,prevkey){
	
	if(Utils.Val.isEmpty(key) || Utils.Val.isEmpty(value)){
		throwError("DECK.001");
	}
	
	if(key != prevkey){
		var existingHeader = _.findWhere(this.headers,{'key' : key});
		if(existingHeader != undefined || existingHeader != null){
			throwError("DECK.002");
		}
	}

}

Deck.prototype.addHeader = function (key, value){

	this.validateHeader(key,value);

	var newHeader = _.extend({}, Deck.HEADER.INIT, {"key":key,"value":value});
	this.headers.push(newHeader);

	//Add it to each card
	_.each(this.cards, function(card){
		card.addHeader(Card.HEADER.GLOBAL.TYPE, newHeader.key, newHeader.value);
	});

};

Deck.prototype.updateHeader = function(prevkey, key, value){
	
	this.validateHeader(key,value, prevkey);

	var obj = _.findWhere(this.headers,{'key' : prevkey});
	obj.key = key;
	obj.value = value;

	//Add it to each card
	_.each(this.cards, function(card){
		card.updateHeader(Card.HEADER.GLOBAL.TYPE, prevkey, key, value);
	});

};


Deck.prototype.validateProperty= function (key, value, prevkey){
	
	if(Utils.Val.isEmpty(key) || Utils.Val.isEmpty(value)){
		throwError("DECK.003");
	}
	
	if(key != prevkey){
		var existingHeader = _.findWhere(this.properties,{'key' : key});
		if(existingHeader != undefined || existingHeader != null){
			throwError("DECK.004");
		}
	}

}

Deck.prototype.removeProperty = function (key){

	var currItem = _.findWhere(this.properties, {"key" : key});
	this.properties = _.without(this.properties, currItem);

};

Deck.prototype.addProperty = function (key, value){

	this.validateProperty(key,value);

	var newProperty = _.extend({}, Deck.PROPERTY.INIT, {"key":key,"value":value});
	this.properties.push(newProperty);
};

Deck.prototype.updateProperty = function(prevkey, key, value){
	
	this.validateProperty(key,value, prevkey);

	var obj = _.findWhere(this.properties,{'key' : prevkey});
	obj.key = key;
	obj.value = value;
};

Deck.prototype.getCardById = function(cardId){

	return _.find(this.cards, function(card){ return card.id == cardId});
};

Deck.prototype.restore = function(jsonObj){

	this.id = jsonObj.id;
	this.name = jsonObj.name;
	this.description = jsonObj.description;
	this.baseURL = jsonObj.baseURL;
	this.properties = jsonObj.properties;
	this.headers = jsonObj.headers;

	for (var i = 0; i < jsonObj.cards.length; i++) {
		var cardJsonObj = jsonObj.cards[i];
		var card = new Card("",this);
		card.restore(cardJsonObj);
		this.cards.push(card);
	}

};

Deck.prototype.json = function (){

	//var tempCards = this.cards;
	//this.cards = null;
	var ignoreAttributes = ["deck", "responseData","response","responseHeaders", "stagingValue", "resolvedValue"];

	var replacer = function(key,value){ 

		if(_.contains(ignoreAttributes, key))
				return undefined;
			else 
				return value;
	}
	var json = JSON.stringify(this, replacer);
	//this.cards = tempCards;
	return json;

};

