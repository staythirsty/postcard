var ErrorMsg = {};

ErrorMsg.code = [
	{"code": "DECK.001", "description" : "Empty parameters"},
	{"code": "DECK.002", "description" : "Duplicate Header"}

]

function ErrorMsg(){

}

getErrorMsg = function(errorCode){

	return _.findWhere(ErrorMsg.code, {"code" : errorCode});

}

throwError = function(errorCode){

	var errorMsg = getErrorMsg(errorCode);
	var error = new Error(errorMsg.description);
	error.code = errorMsg.code;

	throw error;

}