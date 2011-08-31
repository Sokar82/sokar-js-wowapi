String.prototype.slugify = function() {
    str = this.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();
        
    // remove accents, swap ñ for n, etc
    var from = 'àáäâèéëêìïîòóöôùúüûñç?·/_:;';
    var to = 'aaaaeeeeiiioooouuuunc?-----';
    for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp('\\' + from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/['-]/g, '') // remove some invalid chars
             .replace(/\s+/g, '-') // collapse whitespace and replace by -
             .replace(/-+/g, '-'); // collapse dashes

    return str;
};

function WoWAPI(options){
  this.options = {region: 'us', path: '.battle.net/api/wow'};
  for(var opt in options){
    this.options[opt] = options[opt];
  }  
  this.callback = 'WoWAPI' + Math.floor((100000)*Math.random());
  this.uid = new Date().getTime();
  window['WoWAPICache'] = {};
}

WoWAPI.prototype = {
  _createApiCall: function(url, callback, cacheKey){
		var func = this.callback + (this.uid++);
		window[func] = function(data){
      window['WoWAPICache'][cacheKey] = data;
			callback(data);
			window[func] = undefined;
		}

		url += (url.indexOf('?') == -1 ? '?' : '&') + 'jsonp=' + func;

		var script = document.createElement('script');
    var head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
    script.type = 'text/javascript';
    script.async = "async";
    script.src = url

    script.onload = script.onreadystatechange = function() {
			if(!script.readyState || /loaded|complete/.test(script.readyState)) {
				script.onload = script.onreadystatechange = null;
				script.parentNode.removeChild(script);
				script = undefined;
				if (window[func]) callback(null);
				window[func] = undefined;
			}
    };
    head.insertBefore(script, head.firstChild);
	},

	_validateArg: function(arg, msg, type){
		if(type){
			if(typeof(arg) != type){
				throw msg;
			}
		}
		else{
			if(!arg){
				throw msg;
			}
		}
	},

	getAuctionData: function(realm, callback){
		throw 'The auction data API currently doesn\'t support JSONP!';
		return;

		var url = 'http://' + this.options.region + this.options.path + '/auction/data';

		this._validateArg(realm, 'Missing or invalid realm for WoWAPI.getAuctionData()');
		url += '/' + realm.slugify();
		
		this._validateArg(callback, 'Invalid callback specified for WoWAPI.getAuctionData()', 'function');

		var inst = this;
		this._createApiCall(url, function(data){
			inst._createApiCall(data.files[0].url, callback);
		});
	},

	getCharacter: function(realm, charName, callback){
		var url = 'http://' + this.options.region + this.options.path + '/character';

		this._validateArg(realm, 'No realm specified for WoWAPI.getCharacter()');
		url += '/' + realm.slugify();
    
		this._validateArg(charName, 'No character name specified for WoWAPI.getCharacter()');
		url += '/' + charName.slugify();
    
		this._validateArg(callback, 'Invalid callback specified for WoWAPI.getCharacter()', 'function');

		var fields = Array.prototype.slice.call(arguments, 3);
    var key = 'Char:' +  realm + ':' + charName;
		if(fields.length > 0){
      key += ':' + fields.join(':');
			url += '?fields=' + fields.join(',').slugify();
		}

		this._createApiCall(url, callback, key);
	},
   
  getCachedCharacter: function(realm, charName, callback){
    var fields = Array.prototype.slice.call(arguments, 3);
    var key = 'Char:' + realm + ':' + charName;
    if(fields.length > 0){
      key += ':' + fields.join(':');
		}

    if(window['WoWAPICache'][key]){
      callback(window['WoWAPICache'][key]);
    }
    else{
      this.getCharacter(realm, charName, callback, fields);
    }
  },

	getCharacterClasses: function(callback){
		var url = 'http://' + this.options.region + this.options.path + '/data/character/classes';
		
		this._validateArg(callback, 'Invalid callback specified for WoWAPI.getCharacterClasses()', 'function');

		this._createApiCall(url, callback);
	},

	getCharacterRaces: function(callback){
		var url = 'http://' + this.options.region + this.options.path + '/data/character/races';
		
		this._validateArg(callback, 'Invalid callback specified for WoWAPI.getCharacterRaces()', 'function');

		this._createApiCall(url, callback);
	},

	getGuild: function(realm, guildName, callback){
		var url = 'http://' + this.options.region + this.options.path + '/guild';

		this._validateArg(realm, 'No realm specified for WoWAPI.getGuild()');
		url += '/' + realm.slugify();
    
		this._validateArg(guildName, 'No guild name specified for WoWAPI.getGuild()');
		url += '/' + encodeURIComponent(guildName).slugify();
    
		this._validateArg(callback, 'Invalid callback specified for WoWAPI.getGuild()', 'function');

		var fields = Array.prototype.slice.call(arguments, 3);
		if(fields.length > 0){
			url += '?fields=' + fields.join(',').slugify();
		}

		this._createApiCall(url, callback);
	},	

	getGuildPerks: function(callback){
		var url = 'http://' + this.options.region + this.options.path + '/data/guild/perks';
		
		this._validateArg(callback, 'Invalid callback specified for WoWAPI.getGuildPerks()', 'function');

		this._createApiCall(url, callback);
	},

	getGuildRewards: function(callback){
		var url = 'http://' + this.options.region + this.options.path + '/data/guild/rewards';
		
		this._validateArg(callback, 'Invalid callback specified for WoWAPI.getGuildRewards()', 'function');

		this._createApiCall(url, callback);
	},

	getItem: function(itemid, callback){
		throw 'The item data API is currently not public available!';
		return;

		var url = 'http://' + this.options.region + this.options.path + '/data/item';

		this._validateArg(itemid, 'Missing or invalid itemid for WoWAPI.getItem()', 'number');
		url += '/' + itemid;
		
		this._validateArg(callback, 'Invalid callback specified for WoWAPI.getItem()', 'function');

		this._createApiCall(url, callback);
	},
	
	getRealm: function(){
		var url = 'http://' + this.options.region + this.options.path + '/realm/status';

		var args = Array.prototype.slice.call(arguments);
		var callback = args.pop();
    
		this._validateArg(callback, 'Invalid callback specified for WoWAPI.getRealm()', 'function');

		if(args.length > 0){
			url += '?realms=' + args.join(',').slugify();
		}

		this._createApiCall(url, callback);
	}
};