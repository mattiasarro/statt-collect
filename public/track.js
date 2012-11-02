var _statt = _statt || [];
(function () {
    _statt = {
        image: new Image(),
        track: function () {
          if (!this.visitor_id()) {
            this.set_visitor_id();
          } else {
            var a = this.url();
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
        url: function () {
            var ret;
            if (this.script_tag()) {
                ret = this.base() + 'track.png';
                ret += "?visitor_id=" + this.visitor_id();
                ret += "&resource=" + this.resource();
                ret += "&http_referer=" + this.referer();
                ret += "&title=" + this.title();
                ret += "&user_agent=" + this.agent();
                ret += "&screenx=" + this.screen_width();
                ret += "&browserx=" + this.browser_width();
                ret += "&browsery=" + this.browser_height();
            }
            return ret;
        },
        get_new_id: function () {
          var timestamp = Math.floor(new Date().valueOf()).toString(16);
          var one = Math.floor(Math.random()*1000000000000000).toString(16);
          var two = Math.floor(Math.random()*1000000000000000).toString(16);
          var ret = (timestamp+one+two).substring(0,24);
          return ret;
        },
        set_visitor_id: function() {
          var visitor_id = this.get_new_id();          
          var get_url = this.base() + "new_visitor.png";
          var img = new Image();
          img.src = get_url + "?visitor_id=" + visitor_id;
          img.onload = function () {
            _statt.set_cookie('statt-visitor_id', visitor_id, 100);
            
            var a = _statt.url();// Do the actual tracking
            if (a) {
              _statt.image.src = a;
            }
          };
        },
        visitor_id: function () {
          return this.get_cookie("statt-visitor_id");
        },
        base: function () {
          var rep = "sites/" + this.site_id() + "/";
          return this.$('statt-tracker').src.replace("track.js", rep);
        },
        site_id: function () {
          return this.script_tag().getAttribute('data-site-id');
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
        resource: function () {
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
    _statt.track();
})();
