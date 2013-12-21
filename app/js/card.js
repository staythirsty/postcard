//Card
Card.counter = 0;

Card.HEADER = {};
Card.HEADER.GLOBAL = {};
Card.HEADER.GLOBAL.TYPE= 0;
Card.HEADER.GLOBAL.INIT= {'key': 'KEY', 'value': 'VALUE', 'fromDeck': true, 'linked' : true, 'include' : true};
Card.HEADER.GLOBAL.FIND= {'fromDeck': true};


Card.HEADER.LOCAL = {};
Card.HEADER.LOCAL.TYPE= 1;
Card.HEADER.LOCAL.INIT= {'key': 'KEY', 'value': 'VALUE', 'fromDeck': false, 'linked' : false, 'include' : true};
Card.HEADER.LOCAL.FIND= {'fromDeck': false};

Card.WIRING = {};
Card.WIRING.INIT = {'property' : '', 'map' : '', 'value' : ''};

Card.URLPARAMETER = {};
Card.URLPARAMETER.INIT = {'property' : '', 'value' : ''};

Card.INPUT = {};
Card.INPUT.INIT = {'property' :'', 'value' : ''};


function Card(name, deck){

	this.id = Card.counter++;
	this.name = name;
	this.deck = deck;
	this.description = "Description of " + name;
	this.url = "";
	this.httpMethod = "GET";
	this.requestData = "";
	this.responseData = "";
	this.response = "";
	this.responseHeaders = [];
	this.responseStatusCode = "";
	this.responseStatusDescription = "";
	this.urlParameters = [];
	this.wirings = [];

	this.inputs = [];

	this.headers = [];

	deckHeaders = this.headers;

	_.each(deck.headers, function(header){
		deckHeaders.push(_.extend({}, Card.HEADER.GLOBAL.INIT,header));
	});

}

Card.prototype.refreshInputs = function(){

	var thatInputs = this.inputs;
	//URL
	extractInput(this.url, this.inputs);

	//PARAMETERS
	_.each(this.urlParameters, function(urlParameter){
		extractInput(urlParameter.value, thatInputs);
	});

	//HEADERS
	_.each(this.headers, function(header){
		extractInput(header.value, thatInputs);
	});

	//REQUEST
	if(this.httpMethod == "POST" || this.httpMethod == "PUT"){
		extractInput(this.requestData, this.inputs);
	}

}

function extractInput(source, collection){

	var regEx = new RegExp('{{[a-zA-Z0-9\.\-]+}}','g');

	_.each(source.match(regEx),function(binding){
		binding = binding.substring(2, binding.length -2);

		var tempInput = _.findWhere(collection, {'property':binding});
		console.log('binding' + binding);
		console.log('extractInput' + tempInput);
		console.log('collection');
		_.each(collection,function(item){console.log(item);});
		
		if( tempInput == undefined){
			collection.push(_.extend({},Card.INPUT.INIT,{'property':binding}));
		}
	});

}


Card.prototype.restore = function(jsonObj){

	this.id = jsonObj.id;
	this.name = jsonObj.name;
	this.description = jsonObj.description;
	this.url = jsonObj.url;
	this.httpMethod = jsonObj.httpMethod;
	this.requestData = jsonObj.requestData;
	this.responseData = jsonObj.responseData;
	this.response = "";

	if(jsonObj.urlParameters == undefined){
		this.urlParameters = [];
	}else{
		this.urlParameters = jsonObj.urlParameters;
	}

	if(jsonObj.wirings == undefined){
		this.wirings = [];
	}else{
		this.wirings = jsonObj.wirings;
	}

	this.headers = jsonObj.headers;
	this.inputs = jsonObj.inputs;


}

Card.prototype.removeHeader = function (key, type){

	var searchCriteria = {'key' : key};

	//GLOBAL called only from Deck Object
	if(type == Card.HEADER.GLOBAL.TYPE){
		_.extend(searchCriteria, Card.HEADER.GLOBAL.FIND);
	}else{
		_.extend(searchCriteria, Card.HEADER.LOCAL.FIND);
	}
	
	console.log('removeHeader - search Criteria ' + JSON.stringify(searchCriteria));
	var currItem = _.findWhere(this.headers, searchCriteria);
	
	console.log('removeHeader - search result ' + JSON.stringify(currItem));
	this.headers = _.without(this.headers, currItem);
}

Card.prototype.updateHeader = function (type, prevKey, key, value){

	var searchCriteria = {'key' : prevKey};

	//GLOBAL called only from Deck Object
	if(type == Card.HEADER.GLOBAL.TYPE){
		_.extend(searchCriteria, Card.HEADER.GLOBAL.FIND);
	}else{
		_.extend(searchCriteria, Card.HEADER.LOCAL.FIND);
	}
	
	console.log('removeHeader - search Criteria ' + JSON.stringify(searchCriteria));
	console.log(this.headers);
	var currItem = _.findWhere(this.headers, searchCriteria);

	console.log('removeHeader - search result ' + JSON.stringify(currItem));

	if(type == Card.HEADER.GLOBAL.TYPE){

		currItem.key = key;
		if(currItem.linked == true){
			currItem.value = value;
		}
	}else{
		currItem.key = key;
		currItem.value = value;
	}
	
}

Card.prototype.addHeader = function (type, key, value){
	
	console.log('addHeader ' + type + key + value);

	console.log(Card.HEADER.GLOBAL.INIT);
	console.log(_.extend({'key':key, 'value':value}, Card.HEADER.GLOBAL.INIT));

	//GLOBAL called only from Deck Object
	if(type == Card.HEADER.GLOBAL.TYPE){
		this.headers.push(_.extend({},Card.HEADER.GLOBAL.INIT,{'key':key, 'value':value}));
	}else{
		this.headers.push(_.extend({},Card.HEADER.LOCAL.INIT,{'key':key, 'value':value}));
	}

}

Card.prototype.addUrlParameter = function (property, value){

	if(property != null && value != null){
		this.urlParameters.push(_.extend({}, Card.URLPARAMETER.INIT,{'property' : property, 'value' : value}));
	}
}


Card.prototype.removeUrlParameter = function (property, value){

	var currItem = _.findWhere(this.urlParameters, {'property' : property});
	console.log('removeUrlParameter - search result ' + JSON.stringify(currItem));
	this.urlParameters = _.without(this.urlParameters, currItem);

}

Card.prototype.addWiring = function (property, map){

	console.log('addWiring - property  ' + property + ' map ' + map);
	this.wirings.push(_.extend({}, Card.WIRING.INIT,{'property' : property, 'map' : map}));
}


Card.prototype.removeWiring = function (property, map){

	var currItem = _.findWhere(this.wirings, {'property' : property});
	console.log('removeWiring - search result ' + JSON.stringify(currItem));
	this.wirings = _.without(this.wirings, currItem);

}

Card.prototype.reset = function(){

	this.responseData = null;
	this.response = null;

	_.each(this.wirings, function(wiring){
		wiring.value = "";
	});
}

Card.prototype.substituteInputs = function(value){


	var regEx = new RegExp('{{[a-zA-Z0-9\.\-]+}}','g');

	if(value.match(regEx) == null){
		console.log('No Substitution required - value ' + value);
		return value;
	}


	//local input value
	_.each(this.inputs, function(input){
		if(input.value != null && input.value != undefined && input.value != ''){
			console.log('input ' + input.property + ' ' + input.value);
			var regEx = new RegExp('{{' + input.property + '}}','g');
			value = value.replace(regEx, input.value);
		}
	});

	if(value.match(regEx) == null){
		console.log('Complete Local Input Substitution. No further substitutions required - value ' + value);
		return value;
	}


	//all card's output value
	_.each(this.deck.cards, function(card){

		_.each(card.wirings, function(wiring){

			if(wiring.value != null && wiring.value != undefined){
				var regEx = new RegExp('{{' + wiring.property + '}}','g');
				value = value.replace(regEx, wiring.value);
			}
		});

	});

	if(value.match(regEx) == null){
		console.log('Complete Wiring substitutions. No further substitutions required - value ' + value);
		return value;
	}

	//deck properties
	_.each(this.deck.properties, function (property){
		var regEx = new RegExp('{{' + property.key + '}}','g');
		value = value.replace(regEx, property.value);
	});


	console.log('Complete All  Substitution - value ' + value);
	return value;
}


Card.prototype.submit = function($http){


	this.reset();

	var thisCard = this;
	var httpConfig = {};

	httpConfig.method = this.httpMethod;

	httpConfig.url = this.substituteInputs(this.url);
	console.log('httpConfig.url ' + httpConfig.url);

	if(httpConfig.method == 'POST' || httpConfig.method == "PUT"){
		
		httpConfig.data = this.substituteInputs(this.requestData);		

	}


	httpConfig.params = {};

	_.each(this.urlParameters,function(urlParameter){
		
		httpConfig.params[urlParameter.property] = thisCard.substituteInputs(urlParameter.value);
		
	});


	httpConfig.headers = {};
	_.each(this.headers,function(header){
		if(header.include){
			httpConfig.headers[header.key] = thisCard.substituteInputs(header.value);
		}
	});


	console.log(httpConfig);

	var httpPromise =  $http(httpConfig);

	httpPromise.success(function(data, status){
	
		thisCard.responseStatusCode = status;
		thisCard.responseStatusDescription = getHTTPStatus(status).description;

		thisCard.responseData = data;
		thisCard.response = JSON.stringify(data,null,'\t');

		_.each(thisCard.wirings, function(wiring){
			wiring.value = retriveValue(thisCard.responseData, wiring.map);
			var currItem = _.findWhere(thisCard.deck.properties,{'key' : wiring.property});
			if(currItem != undefined){
				currItem.value = wiring.value
			}
		});

	});
		
	httpPromise.error(function(data, status){
		
		thisCard.responseStatusCode = status;
		thisCard.responseStatusDescription = getHTTPStatus(status).description;
		
		thisCard.responseData = data;
		thisCard.response = JSON.stringify(data,null,'\t');
	});
}


function retriveValue(object, path){

	var segments = path.split('.');

	if(segments.length > 1){

		var firstItem = _.first(segments);
		var restofTheItems = _.rest(segments).join('.');

		console.log( "retriveValue first " + firstItem + " rest" + restofTheItems);

		if(firstItem.indexOf('[') != -1 ){
			var itemName = firstItem.substring(0,firstItem.indexOf('['));
			var itemIndex = firstItem.substring(firstItem.indexOf('[') + 1, firstItem.indexOf(']'));
			console.log('itemName :' + itemName + ' itemIndex :' + itemIndex);

			var newObject  = null;

			for(var i=0;i<object[itemName].length;i++){

				if(i == itemIndex){
					newObject = object[itemName][i];
					break;
				}

			}
			console.log(newObject);

			return retriveValue(newObject, restofTheItems);
		}else{

			var newObject  = object[firstItem];
			console.log(newObject);
			return retriveValue(newObject,restofTheItems);
		}

	}else{
		console.log("retriveValue final " + path);
		console.log(object);
		console.log(object[path]);
		return object[path];
	}

}

Card.prototype.toggleLink = function (key){
	
	var currHeader = _.find(this.headers, function(header){ return header.key == key});

	currHeader.linked = !currHeader.linked;

	if(currHeader.linked){
		var currDeckHeader = _.find(this.deck.headers, function(header){ return header.key == key});
		currHeader.value = currDeckHeader.value;
	}
}