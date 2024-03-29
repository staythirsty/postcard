var HTTPStatus = {};

HTTPStatus.code = [
	{"status": 100, "description" : "Continue"},
	{"status": 101, "description" : "Switching Protocols"},
	{"status": 103, "description" : "Checkpoint"},
	{"status": 200, "description" : "OK"},
	{"status": 201, "description" : "Created"},
	{"status": 202, "description" : "Accepted"},
	{"status": 203, "description" : "Non-Authoritative Information"},
	{"status": 204, "description" : "No Content"},
	{"status": 205, "description" : "Reset Content"},
	{"status": 206, "description" : "Partial Content"},
	{"status": 300, "description" : "Multiple Choices"},
	{"status": 301, "description" : "Moved Permanently"},
	{"status": 302, "description" : "Found"},
	{"status": 303, "description" : "See Other"},
	{"status": 304, "description" : "Not Modified"},
	{"status": 306, "description" : "Switch Proxy"},
	{"status": 307, "description" : "Temporary Redirect"},
	{"status": 308, "description" : "Resume Incomplete"},
	{"status": 400, "description" : "Bad Request"},
	{"status": 401, "description" : "Unauthorized"},
	{"status": 402, "description" : "Payment Required"},
	{"status": 403, "description" : "Forbidden"},
	{"status": 404, "description" : "Not Found"},
	{"status": 405, "description" : "Method Not Allowed"},
	{"status": 406, "description" : "Not Acceptable"},
	{"status": 407, "description" : "Proxy Authentication Required"},
	{"status": 408, "description" : "Request Timeout"},
	{"status": 409, "description" : "Conflict"},
	{"status": 410, "description" : "Gone"},
	{"status": 411, "description" : "Length Required"},
	{"status": 412, "description" : "Precondition Failed"},
	{"status": 413, "description" : "Request Entity Too Large"},
	{"status": 414, "description" : "Request-URI Too Long"},
	{"status": 415, "description" : "Unsupported Media Type"},
	{"status": 416, "description" : "Requested Range Not Satisfiable"},
	{"status": 417, "description" : "Expectation Failed"},
	{"status": 500, "description" : "Internal Server Error"},
	{"status": 501, "description" : "Not Implemented"},
	{"status": 502, "description" : "Bad Gateway"},
	{"status": 503, "description" : "Service Unavailable"},
	{"status": 504, "description" : "Gateway Timeout"},
	{"status": 505, "description" : "HTTP Version Not Supported"},
	{"status": 511, "description" : "Network Authentication Required"}
];

function HTTPStatus(){

}

getHTTPStatus = function(statusCode){

	return _.findWhere(HTTPStatus.code, {status: statusCode});

}