


var _statt = _statt || [];
(function () {
    _statt = {
        image: new Image(),
        track: function () {
          if (!this.visitor_id()) {
            this.set_visitor_id();
          } else {
            var a = this.track_url();
            if (a) {
              this.image.src = a;
            }
          }
        },
        push: function (a) {
            var b = a.shift();
            if (b == 'track') {
                _statt.track()
            } // else if b == 'event', etc.
        },
        track_url: function () {
            var ret;
            if (this.script_tag()) {
                ret = this.base() + 'track.png';
                ret += "?visitor_id=" + this.visitor_id();
                ret += "&cl_user_id=" + this.cl_user_id();
                ret += "&site_id=" + this.site_id();
                ret += "&uri_string=" + this.uri_string();
                ret += "&http_referer=" + this.referer();
                ret += "&title=" + this.title();
                ret += "&user_agent=" + this.agent();
                ret += "&screenx=" + this.screen_width();
                ret += "&browserx=" + this.browser_width();
                ret += "&browsery=" + this.browser_height();
            }
            return ret;
        },
        get_new_id: function() {
          var rand1 = Math.floor(Math.random() * 100000);
          var rand2 = Math.floor(Math.random() * 100000);
          var rand3 = Math.floor(Math.random() * 100000);
          
        	var unixTime = parseInt(Date.now()/1000,10);
          var time4Bytes = BinaryParser.encodeInt(unixTime, 32, true, true);
          var machine3Bytes = BinaryParser.encodeInt(rand1, 24, false);
          var pid2Bytes = BinaryParser.fromShort(rand2);
          var index3Bytes = BinaryParser.encodeInt(rand3, 24, false, true);
          
          var s = (time4Bytes + machine3Bytes + pid2Bytes + index3Bytes).toString();
          var r = this.toHexString(s);
          return r;
        },
        toHexString: function(id) {

          var hexString = ''
            , number
            , value;

          for (var index = 0, len = id.length; index < len; index++) {
            value = BinaryParser.toByte(id[index]);
            number = value <= 15
              ? '0' + value.toString(16)
              : value.toString(16);
            hexString = hexString + number;
          }

          return hexString;
        },
        set_visitor_id: function() {
          var visitor_id = this.get_new_id();          
          
          var visitor_img = new Image();
          var src = this.base() + "new_visitor.png";
              src += "?visitor_id=" + visitor_id;
              src += "&site_id=" + this.site_id();
              
          visitor_img.src = src;
          visitor_img.onload = function () {
            var expires = 60*60*24*360; // year
            _statt.set_cookie('statt-visitor_id', visitor_id, expires);
            _statt.image.src = _statt.track_url();
          };
        },
        visitor_id: function () {
          return this.get_cookie("statt-visitor_id");
        },
        base: function () {
          return this.$('statt-tracker').src.replace("track.js", "");
        },
        site_id: function () {
          return this.script_tag().getAttribute('data-site-id');
        },
        cl_user_id: function () {
          return this.script_tag().getAttribute('data-user_id');
        },
        script_tag: function () {
          return this.$('statt-tracker');
        },
        referer: function () {
            try {
                a = top.document.referrer
            } catch (e1) {
                try {
                    a = parent.document.referrer
                } catch (e2) {
                    a = ''
                }
            }
            if (a == '') {
                a = document.referrer
            }
            return this.escape(a)
        },
        agent: function () {
            return this.escape(navigator.userAgent)
        },
        escape: function (a) {
            return (typeof (encodeURIComponent) == 'function') ? encodeURIComponent(a) : escape(a)
        },
        uri_string: function () {
            return this.escape(document.location.href)
        },
        title: function () {
            return (document.title && document.title != "") ? this.escape(document.title) : ''
        },
        screen_width: function () {
            try {
                return screen.width
            } catch (e) {
                return 0
            }
        },
        browser_dimensions: function () {
            var a = 0,
                b = 0;
            try {
                if (typeof (window.innerWidth) == 'number') {
                    a = window.innerWidth;
                    b = window.innerHeight
                } else if (document.documentElement && document.documentElement.clientWidth) {
                    a = document.documentElement.clientWidth;
                    b = document.documentElement.clientHeight
                } else if (document.body && document.body.clientWidth) {
                    a = document.body.clientWidth;
                    b = document.body.clientHeight
                }
            } catch (e) {}
            return {
                width: a,
                height: b
            }
        },
        browser_width: function () {
            return this.browser_dimensions().width
        },
        browser_height: function () {
            return this.browser_dimensions().height
        },
        $: function (a) {
            if (document.getElementById) {
                return document.getElementById(a)
            }
            return null
        },
        set_cookie: function (a, b, d) {
            var f, c;
            b = escape(b);
            if (d) {
                f = new Date();
                f.setTime(f.getTime() + (d * 1000));
                c = '; expires=' + f.toGMTString();
            } else {
                c = ''
            }
            document.cookie = a + "=" + b + c + "; path=/"
        },
        get_cookie: function (a) {
            var b = a + "=",
                d = document.cookie.split(';');
            for (var f = 0; f < d.length; f++) {
                var c = d[f];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1, c.length)
                }
                if (c.indexOf(b) == 0) {
                    return unescape(c.substring(b.length, c.length))
                }
            }
            return null
        },
        http_object: function () {
          try {return new XMLHttpRequest();}
          catch (error) {}
          try {return new ActiveXObject("Msxml2.XMLHTTP");}
          catch (error) {}
          try {return new ActiveXObject("Microsoft.XMLHTTP");}
          catch (error) {}
          throw new Error("Could not create HTTP request object.");
        }
    };

    
    // BEGIN BinaryParser
    /**
     * Binary Parser.
     * Jonas Raoni Soares Silva
     * http://jsfromhell.com/classes/binary-parser [v1.0]
     */
    var chr = String.fromCharCode;

    var maxBits = [];
    for (var i = 0; i < 64; i++) {
    	maxBits[i] = Math.pow(2, i);
    }

    function BinaryParser (bigEndian, allowExceptions) {
      if(!(this instanceof BinaryParser)) return new BinaryParser(bigEndian, allowExceptions);

    	this.bigEndian = bigEndian;
    	this.allowExceptions = allowExceptions;
    };

    BinaryParser.warn = function warn (msg) {
    	if (this.allowExceptions) {
    		throw new Error(msg);
      }

    	return 1;
    };

    BinaryParser.decodeInt = function decodeInt (data, bits, signed, forceBigEndian) {
      var b = new this.Buffer(this.bigEndian || forceBigEndian, data)
          , x = b.readBits(0, bits)
          , max = maxBits[bits]; //max = Math.pow( 2, bits );

      return signed && x >= max / 2
          ? x - max
          : x;
    };

    BinaryParser.encodeInt = function encodeInt (data, bits, signed, forceBigEndian) {
    	var max = maxBits[bits];

      if (data >= max || data < -(max / 2)) {
        this.warn("encodeInt::overflow");
        data = 0;
      }

    	if (data < 0) {
        data += max;
      }

    	for (var r = []; data; r[r.length] = String.fromCharCode(data % 256), data = Math.floor(data / 256));

    	for (bits = -(-bits >> 3) - r.length; bits--; r[r.length] = "\0");

      return ((this.bigEndian || forceBigEndian) ? r.reverse() : r).join("");
    };

    BinaryParser.toSmall    = function( data ){ return this.decodeInt( data,  8, true  ); };
    BinaryParser.fromSmall  = function( data ){ return this.encodeInt( data,  8, true  ); };
    BinaryParser.toByte     = function( data ){ return this.decodeInt( data,  8, false ); };
    BinaryParser.fromByte   = function( data ){ return this.encodeInt( data,  8, false ); };
    BinaryParser.toShort    = function( data ){ return this.decodeInt( data, 16, true  ); };
    BinaryParser.fromShort  = function( data ){ return this.encodeInt( data, 16, true  ); };


    /**
     * BinaryParser buffer constructor.
     */
    function BinaryParserBuffer (bigEndian, buffer) {
      this.bigEndian = bigEndian || 0;
      this.buffer = [];
      this.setBuffer(buffer);
    };

    BinaryParserBuffer.prototype.setBuffer = function setBuffer (data) {
      var l, i, b;

    	if (data) {
        i = l = data.length;
        b = this.buffer = new Array(l);
    		for (; i; b[l - i] = data.charCodeAt(--i));
    		this.bigEndian && b.reverse();
    	}
    };

    BinaryParserBuffer.prototype.hasNeededBits = function hasNeededBits (neededBits) {
    	return this.buffer.length >= -(-neededBits >> 3);
    };

    BinaryParserBuffer.prototype.checkBuffer = function checkBuffer (neededBits) {
    	if (!this.hasNeededBits(neededBits)) {
    		throw new Error("checkBuffer::missing bytes");
      }
    };

    BinaryParserBuffer.prototype.readBits = function readBits (start, length) {
    	//shl fix: Henri Torgemane ~1996 (compressed by Jonas Raoni)

    	function shl (a, b) {
    		for (; b--; a = ((a %= 0x7fffffff + 1) & 0x40000000) == 0x40000000 ? a * 2 : (a - 0x40000000) * 2 + 0x7fffffff + 1);
    		return a;
    	}

    	if (start < 0 || length <= 0) {
    		return 0;
      }

    	this.checkBuffer(start + length);

      var offsetLeft
        , offsetRight = start % 8
        , curByte = this.buffer.length - ( start >> 3 ) - 1
        , lastByte = this.buffer.length + ( -( start + length ) >> 3 )
        , diff = curByte - lastByte
        , sum = ((this.buffer[ curByte ] >> offsetRight) & ((1 << (diff ? 8 - offsetRight : length)) - 1)) + (diff && (offsetLeft = (start + length) % 8) ? (this.buffer[lastByte++] & ((1 << offsetLeft) - 1)) << (diff-- << 3) - offsetRight : 0);

    	for(; diff; sum += shl(this.buffer[lastByte++], (diff-- << 3) - offsetRight));

    	return sum;
    };

    BinaryParser.Buffer = BinaryParserBuffer;
    // END BinaryParser

    _statt.track();
})();

