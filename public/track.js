var _statt = _statt || [];
(function () {
    _statt = {
        image: new Image(),
        track: function () {
            this.setCookie('statt-visitor_id', "new value");
            var a = this.url();
            if (a) {
              this.image.src = a;
            }
        },
        push: function (a) {
            var b = a.shift();
            if (b == 'track') {
                _statt.track()
            }
        },
        url: function () {
            var ret, script_tag = this.$('statt-tracker');
            if (script_tag) {
                ret = d.src.replace('/track.js', '/track.png');
                ret += "?site_id=" + d.getAttribute('data-site-id');
                ret += "&resource=" + this.resource();
                ret += "&referrer=" + this.referrer();
                ret += "&title=" + this.title();
                ret += "&user_agent=" + this.agent();
                ret += "&screenx=" + this.screenWidth();
                ret += "&browserx=" + this.browserWidth();
                ret += "&browsery=" + this.browserHeight();
                ret += "&timestamp=" + this.timestamp()
            }
            return ret;
        },
        referrer: function () {
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
        timestamp: function () {
            return new Date().getTime()
        },
        title: function () {
            return (document.title && document.title != "") ? this.escape(document.title) : ''
        },
        screenWidth: function () {
            try {
                return screen.width
            } catch (e) {
                return 0
            }
        },
        browserDimensions: function () {
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
        browserWidth: function () {
            return this.browserDimensions().width
        },
        browserHeight: function () {
            return this.browserDimensions().height
        },
        $: function (a) {
            if (document.getElementById) {
                return document.getElementById(a)
            }
            return null
        },
        setCookie: function (a, b, d) {
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
        getCookie: function (a) {
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
        }
    };
    _statt.track();
})();