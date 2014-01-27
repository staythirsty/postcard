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
Card.INPUT.INIT = {'property' :'', 'value' : '', 'resolvedValue' : ''};


function Card(name, deck){

	this.id = Card.counter++;
	this.name = name;
	this.deck = deck;
	this.description = "Description of " + name;
	this.url = "";
	this.httpMethod = "GET";
	this.requestData = "";
	this.rawRequest = "";
	this.responseData = "";
	this.response = "";
	this.responseHeaders = [];
	this.responseHeadersLength = 0;
	this.responseStatusCode = "";
	this.responseStatusDescription = "";
	this.urlParameters = [];
	this.wirings = [];

	this.inputs = [];

	this.headers = [];

	this.isBindingsResolved = false;

	thisHeader = this.headers;

	_.each(deck.headers, function(header){
		thisHeader.push(_.extend({}, Card.HEADER.GLOBAL.INIT,header));
	});
}

Card.prototype.refreshInputs = function(){

	var newInputs = [];
	var thisInput = this.inputs;

	//URL
	extractInput(this.url, thisInput, newInputs);

	//PARAMETERS
	_.each(this.urlParameters, function(urlParameter){
		extractInput(urlParameter.value, thisInput, newInputs);
	});

	//HEADERS
	_.each(this.headers, function(header){
		extractInput(header.value, thisInput, newInputs);
	});

	//REQUEST
	if(this.httpMethod == "POST" || this.httpMethod == "PUT"){
		extractInput(this.requestData, thisInput, newInputs);
	}

	//check if any of the new inputs good added or removed

	newInputs = _.uniq(newInputs);

	console.log('newInputs' + newInputs);
	_.each(newInputs, function(ip) {
		console.log(ip);
	});

	this.inputs = _.intersection(newInputs, thisInput);


}

function extractInput(source, collection, newcollection){

	var regEx = new RegExp('{{[a-zA-Z0-9\.\-]+}}','g');

	_.each(source.match(regEx),function(binding){

		binding = binding.substring(2, binding.length -2);

		var tempInput = _.findWhere(collection, {'property':binding});
		
		if( tempInput == undefined){
			tempInput = _.extend({},Card.INPUT.INIT,{'property':binding});
			collection.push(tempInput);
		}
		newcollection.push(tempInput);
		
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

	if(jsonObj.headers == undefined){
		this.headers = [];
	}else{
		this.headers = jsonObj.headers;
	}

	if(jsonObj.inputs == undefined){
		this.inputs = [];
	}else{
		this.inputs = jsonObj.inputs;
	}
}

Card.prototype.clone = function(){

	var clone = _.extend({}, this);
	clone.id = Card.counter++;
	clone.name = clone.name + ' - Clone';
	return clone;
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

	if(type != Card.HEADER.GLOBAL.TYPE){
		this.validateHeader(key, value);
	}

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

Card.prototype.validateHeader = function (key, value, prevkey){
	
	if(Utils.Val.isEmpty(key) || Utils.Val.isEmpty(value)){
		throwError("CARD.001");
	}
	
	if(key != prevkey){

		var existingHeader = _.findWhere(this.headers, {'key' : key});
		if(existingHeader != undefined || existingHeader != null){
			throwError("CARD.002");
		}
	}

}

Card.prototype.addHeader = function (type, key, value){
	
	//GLOBAL called only from Deck Object
	if(type == Card.HEADER.GLOBAL.TYPE){
		this.headers.push(_.extend({},Card.HEADER.GLOBAL.INIT,{'key':key, 'value':value}));
	}else{
		this.validateHeader(key, value);
		this.headers.push(_.extend({},Card.HEADER.LOCAL.INIT,{'key':key, 'value':value}));
	}

}

Card.prototype.validateUrlParameter = function (property, value){
	
	if(Utils.Val.isEmpty(property) || Utils.Val.isEmpty(value)){
		throwError("CARD.003");
	}
	
	var existingProperty = _.findWhere(this.urlParameters, {'property' : property});
	if(existingProperty != undefined || existingProperty != null){
		throwError("CARD.004");
	}
	
}

Card.prototype.addUrlParameter = function (property, value){

	this.validateUrlParameter(property,value);

	if(property != null && value != null){
		this.urlParameters.push(_.extend({}, Card.URLPARAMETER.INIT,{'property' : property, 'value' : value}));
	}
}


Card.prototype.removeUrlParameter = function (property, value){

	var currItem = _.findWhere(this.urlParameters, {'property' : property});
	console.log('removeUrlParameter - search result ' + JSON.stringify(currItem));
	this.urlParameters = _.without(this.urlParameters, currItem);
}


Card.prototype.validateWiring = function (property, map){
	
	if(Utils.Val.isEmpty(property) || Utils.Val.isEmpty(map)){
		throwError("CARD.005");
	}
	
	var existingWiring = _.findWhere(this.wirings, {'property' : property});
	if(existingWiring != undefined || existingWiring != null){
		throwError("CARD.006");
	}
	
}

Card.prototype.addWiring = function (property, map){

	this.validateWiring(property,map);
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
	this.responseHeaders = null;

	_.each(this.wirings, function(wiring){
		wiring.value = "";
	});
}


Card.prototype.resolveBinding = function(input){


	input.resolvedValue = null;
	input.stagingValue = null;


	console.log("Resolve Binding for Input " + input.property);

	var binding = input.property;
	var isStaging = false;

	if(input.value !=null && input.value != undefined && input.value != ""){

		if( input.value.indexOf('{{') != 0 && input.value.indexOf('$') != 0){
			input.resolvedValue = input.value;
			console.log("Resolved Value - Self " + input.resolvedValue);
			return true;
		}

		if( input.value.indexOf('{{') == 0 ){
			console.log("Change Binding variable -  " + input.value);
			binding = input.value;
		}

		if(input.value.indexOf('$') == 0 ){
			console.log("Staging variable");

			var regEx = new RegExp('{{[a-zA-Z0-9\.\-]+}}','g');
			var matches = input.value.match(regEx)

			if(matches != null){
				binding = matches[0].substring(2,matches[0].length -2);
				console.log("Change Binding variable -  " + binding);
				isStaging = true;

				var segments = input.value.split(',');

				input.label = segments[1].substring(1,segments[1].length -1);
				input.select = segments[2].substring(1,segments[2].length -2);

			}else{

				console.log('wrong format ' + input.value);
				return false;
			}
		}
	}


	_.each(this.deck.cards, function(card){

		var tempWiring = _.findWhere(card.wirings, {'property' : binding});

		if(tempWiring !=null && tempWiring != undefined){
			if(isStaging){
				input.stagingValue = tempWiring.value;
				console.log("Staging Value - Card Wiring Card ID = " + card.id + ' Value = ' + input.stagingValue);
			}else{
				input.resolvedValue = tempWiring.value;
				console.log("Resolved Value - Card Wiring Card ID = " + card.id + ' Value = ' + input.resolvedValue);
			}
		}

	});

	if(input.resolvedValue != null){
		return true;
	}else if (input.stagingValue != null){
		return false;
	}


	//deck properties
	var tempProperty = _.findWhere(this.deck.properties, {'key' : binding});
	
	if(tempProperty !=null && tempProperty != undefined){
		if(isStaging){
			input.stagingValue = tempProperty.value;
			console.log("Staging Value - Deck Property " + input.stagingValue);
			return false;
		}else{
			input.resolvedValue = tempProperty.value;
			console.log("Resolved Value - Deck Property " + input.resolvedValue);
			return true;

		}
	}

	console.log('Unable to resolve value for input ' + input.property);
	return false;

}

Card.prototype.resolveBindings = function(){
	

	thisCard = this;
	this.refreshInputs();

	thisCard.isBindingsResolved = true;
	
	var unboundInputs = [];
	
	_.each(this.inputs, function(input){
		if(thisCard.resolveBinding(input) == false){
			unboundInputs.push(input);
			thisCard.isBindingsResolved = false;
		}
	});

	return unboundInputs;
}

Card.prototype.substituteInputs = function(value){

	var regEx = new RegExp('{{[a-zA-Z0-9\.\-]+}}','g');

	if(value.match(regEx) == null){
		console.log('No Substitution required - value ' + value);
		return value;
	}


	//local input value
	_.each(this.inputs, function(input){
		if(input.resolvedValue != null && input.resolvedValue != undefined && input.resolvedValue != ''){
			console.log('input ' + input.property + ' ' + input.resolvedValue);
			var regEx = new RegExp('{{' + input.property + '}}','g');
			value = value.replace(regEx, input.resolvedValue);
		}
	});

	if(value.match(regEx) == null){
		console.log('Complete Local Input Substitution. No further substitutions required - value ' + value);
		return value;
	}else{
		console.log('Complete All  Substitution - but unbound variable still exist ' + value);
		return value;
	}
}

Card.prototype.validate = function(){

	if(Utils.Val.isEmpty(this.url)){
		throwError("CARD.007");
	}

}

Card.prototype.submit = function($http, override){


	this.reset();

	this.validate();


	var thisCard = this;
	var httpConfig = {};

	httpConfig.method = this.httpMethod;

	if(override != true){
		this.resolveBindings();
		if(this.isBindingsResolved == false){
			var error = new Error("Unresolved Bindings");
			error.name = "PC.100";
			throw error;
		}
	}

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

	httpPromise.success(function(data, status, headers){
	
		thisCard.responseStatusCode = status;
		thisCard.responseStatusDescription = getHTTPStatus(status).description;

		thisCard.responseData = data;
		thisCard.response = jsonPrettyPrint(data);
		//JSON.stringify(data,null,'\t');
		thisCard.responseHeaders = headers();
		if(thisCard.responseHeaders != null && thisCard.responseHeaders != undefined){
			thisCard.responseHeadersLength = _.keys(thisCard.responseHeaders).length;
		}

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