var Utils = Utils || {};

Utils.Val = {};

Utils.Val.isEmpty = function (value){
	
	if(_.isNull(value) || _.isUndefined(value)){
		return true;
	}

	if(_.isString(value)){
		return _.isEmpty(value);
	}

	return false;
};