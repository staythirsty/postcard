var ErrorMsg = {};

ErrorMsg.code = [
	{"code": "PC.001", "description" : "System Error"},
	{"code": "DECK.001", "description" : "Header - Empty parameters"},
	{"code": "DECK.002", "description" : "Duplicate Header"},
	{"code": "DECK.003", "description" : "Property - Empty parameters"},
	{"code": "DECK.004", "description" : "Duplicate Property"},
	{"code": "CARD.001", "description" : "Header - Empty parameters"},
	{"code": "CARD.002", "description" : "Duplicate Header"},
	{"code": "CARD.003", "description" : "Property - URL parameters"},
	{"code": "CARD.004", "description" : "Duplicate URL parameters"},
	{"code": "CARD.005", "description" : "Property - Wiring parameters"},
	{"code": "CARD.006", "description" : "Duplicate Wiring"}

]

function ErrorMsg(){

}

getErrorMsg = function(errorCode){

	return _.findWhere(ErrorMsg.code, {"code" : errorCode});

}

throwError = function(errorCode){

	var errorMsg = getErrorMsg(errorCode);

	if(errorMsg == null){
		errorMsg = getErrorMsg("PC.001");
	}

	var error = new Error("(" + errorMsg.code + ") : " + errorMsg.description);
	throw error;

}