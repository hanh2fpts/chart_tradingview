"use strict";
// thong tin client can lay
/*
{
  "country"   : "Vietnam",
  "city"      : "Hanoi",
  "timezone"  : "Asia/Ho_Chi_Minh",
  "ip_public" : "27.72.104.120",
  "ip_private": "10.26.2.33",
  "ip_v6"     : "fe80::d0fd:8d47:e936:c004%16",
  "os"        : "Windows 10",
  "browser"   : "Chrome 64 (64.0.3282.140)",
  "screen"    : "2560 x 1440",
  "is_mobile" : "false",
  "user_agent": "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) coc_coc_browser/56.3.162 Chrome/50.3.2661.162 Safari/537.36"
}
*/
function AppChartBase() {
	// pointer to this class
    var self = this;
    function $$(id) { return document.getElementById(id); }
    // Opera 8.0+
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';
    // At least Safari 3+: "[object HTMLElementConstructor]"
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;
    // Chrome 1+
    var isChrome = !!window.chrome && !!window.chrome.webstore;
    // Blink engine detection
    var isBlink = (isChrome || isOpera) && !!window.CSS;

    var nAgt = navigator.userAgent;

    var nVer = navigator.appVersion;

    navigator.sayswho = (function () {
        var ua = navigator.userAgent, tem,
            M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE ' + (tem[1] || '');
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
            if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
        return M.join(' ');
    })();

	// private
	//var client = new ClientJS();
	var clientInfo = {
		country   : "?",
		city      : "?",
		timezone  : "?",
		ip_public : "?",
		ip_private: "?",
		ip_v6     : "?",
		os        : "?",
		browser   : "?",
		screen    : "?",
		is_mobile : "?",
		user_agent: "?"
	};

	// ============= private methods =============	
	//get the IP addresses associated with an account
	const getIPs = function (callback) {
		var ip_dups = {};

		//compatibility for firefox and chrome
		var RTCPeerConnection = window.RTCPeerConnection
			|| window.mozRTCPeerConnection
			|| window.webkitRTCPeerConnection;
		var useWebKit = !!window.webkitRTCPeerConnection;

		//bypass naive webrtc blocking using an iframe
		if (!RTCPeerConnection) {
			//NOTE: you need to have an iframe in the page right above the script tag
			//
			//<iframe id="iframe" sandbox="allow-same-origin" style="display: none"></iframe>
			//<script>...getIPs called in here...
			//
			var win = iframe.contentWindow;
			RTCPeerConnection = win.RTCPeerConnection
				|| win.mozRTCPeerConnection
				|| win.webkitRTCPeerConnection;
			useWebKit = !!win.webkitRTCPeerConnection;
		}

		//minimal requirements for data connection
		var mediaConstraints = {
			optional: [{ RtpDataChannels: true }]
		};

		var servers = { iceServers: [{ urls: "stun:stun.services.mozilla.com" }] };

		//construct a new RTCPeerConnection
		var pc = new RTCPeerConnection(servers, mediaConstraints);

		function handleCandidate(candidate) {
			//match just the IP address
			var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
			var ip_addr = ip_regex.exec(candidate)[1];

			//remove duplicates
			if (ip_dups[ip_addr] === undefined)
				callback(ip_addr);

			ip_dups[ip_addr] = true;
		}

		//listen for candidate events
		pc.onicecandidate = function (ice) {

			//skip non-candidate events
			if (ice.candidate)
				handleCandidate(ice.candidate.candidate);
		};

		//create a bogus data channel
		pc.createDataChannel("");

		//create an offer sdp
		pc.createOffer(function (result) {

			//trigger the stun server request
			pc.setLocalDescription(result, function () { }, function () { });

		}, function () { });

		//wait for a while to let everything done
		var timerProcId = setInterval(function () {
			if (pc.localDescription) {
				clearInterval(timerProcId);

				//read candidate info from local description
				var lines = pc.localDescription.sdp.split('\n');

				lines.forEach(function (line) {
					if (line.indexOf('a=candidate:') === 0)
						handleCandidate(line);
				});
			}
		}, 500);
	}
	// ============= /private methods =============

	// ============= public methods =============
	this.hello = "HIII";
    this.getBrowser = function () {
        // browser
       

        
        
        var browser = navigator.appName;
        var version = '' + parseFloat(navigator.appVersion);
        var majorVersion = parseInt(navigator.appVersion, 10);
        var nameOffset, verOffset, ix;

        // Opera
        if ((verOffset = nAgt.indexOf('Opera')) != -1) {
            browser = 'Opera';
            version = nAgt.substring(verOffset + 6);
            if ((verOffset = nAgt.indexOf('Version')) != -1) {
                version = nAgt.substring(verOffset + 8);
            }
        }
        // Opera Next
        if ((verOffset = nAgt.indexOf('OPR')) != -1) {
            browser = 'Opera';
            version = nAgt.substring(verOffset + 4);
        }
        // MSIE
        else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
            browser = 'Microsoft Internet Explorer';
            version = nAgt.substring(verOffset + 5);
        }
        // Chrome
        else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
            browser = 'Chrome';
            version = nAgt.substring(verOffset + 7);
        }
        // Safari
        else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
            browser = 'Safari';
            version = nAgt.substring(verOffset + 7);
            if ((verOffset = nAgt.indexOf('Version')) != -1) {
                version = nAgt.substring(verOffset + 8);
            }
        }
        // Firefox
        else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
            browser = 'Firefox';
            version = nAgt.substring(verOffset + 8);
        }
        // MSIE 11+
        else if (nAgt.indexOf('Trident/') != -1) {
            browser = 'Microsoft Internet Explorer';
            version = nAgt.substring(nAgt.indexOf('rv:') + 3);
        }
        // Other browsers
        else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
            browser = nAgt.substring(nameOffset, verOffset);
            version = nAgt.substring(verOffset + 1);
            if (browser.toLowerCase() == browser.toUpperCase()) {
                browser = navigator.appName;
            }
        }
        // trim the version string
        if ((ix = version.indexOf(';')) != -1) version = version.substring(0, ix);
        if ((ix = version.indexOf(' ')) != -1) version = version.substring(0, ix);
        if ((ix = version.indexOf(')')) != -1) version = version.substring(0, ix);

        majorVersion = parseInt('' + version, 10);
        if (isNaN(majorVersion)) {
            version = '' + parseFloat(navigator.appVersion);
            majorVersion = parseInt(navigator.appVersion, 10);
        }
        return browser +" "+ majorVersion; 
    }
    this.getScreen = function () {
        var screenSize = '';
        if (screen.width) {
            var width = (screen.width) ? screen.width : '';
            var height = (screen.height) ? screen.height : '';
            screenSize += '' + width + " x " + height;
        }
        return screenSize;
    }
    
    this.getOS = function () {
        // system
        var unknown = '-';
        var os = unknown;
        var clientStrings = [
            { s: 'Windows 10', r: /(Windows 10.0|Windows NT 10.0)/ },
            { s: 'Windows 8.1', r: /(Windows 8.1|Windows NT 6.3)/ },
            { s: 'Windows 8', r: /(Windows 8|Windows NT 6.2)/ },
            { s: 'Windows 7', r: /(Windows 7|Windows NT 6.1)/ },
            { s: 'Windows Vista', r: /Windows NT 6.0/ },
            { s: 'Windows Server 2003', r: /Windows NT 5.2/ },
            { s: 'Windows XP', r: /(Windows NT 5.1|Windows XP)/ },
            { s: 'Windows 2000', r: /(Windows NT 5.0|Windows 2000)/ },
            { s: 'Windows ME', r: /(Win 9x 4.90|Windows ME)/ },
            { s: 'Windows 98', r: /(Windows 98|Win98)/ },
            { s: 'Windows 95', r: /(Windows 95|Win95|Windows_95)/ },
            { s: 'Windows NT 4.0', r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/ },
            { s: 'Windows CE', r: /Windows CE/ },
            { s: 'Windows 3.11', r: /Win16/ },
            { s: 'Android', r: /Android/ },
            { s: 'Open BSD', r: /OpenBSD/ },
            { s: 'Sun OS', r: /SunOS/ },
            { s: 'Linux', r: /(Linux|X11)/ },
            { s: 'iOS', r: /(iPhone|iPad|iPod)/ },
            { s: 'Mac OS X', r: /Mac OS X/ },
            { s: 'Mac OS', r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },
            { s: 'QNX', r: /QNX/ },
            { s: 'UNIX', r: /UNIX/ },
            { s: 'BeOS', r: /BeOS/ },
            { s: 'OS/2', r: /OS\/2/ },
            { s: 'Search Bot', r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/ }
        ];
        for (var id in clientStrings) {
            var cs = clientStrings[id];
            if (cs.r.test(nAgt)) {
                os = cs.s;
                break;
            }
        }

        var osVersion = unknown;

        if (/Windows/.test(os)) {
            osVersion = /Windows (.*)/.exec(os)[1];
            os = 'Windows';
        }

        switch (os) {
            case 'Mac OS X':
                osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
                break;

            case 'Android':
                osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
                break;

            case 'iOS':
                osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
                osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
                break;
        }
        return os + " " + osVersion;
    }
    this.getIsMobile = function () {
        // mobile version
        var mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);
        return mobile;
    }
    function getUserIP(onNewIP) { //  onNewIp - your listener function for new IPs
        //compatibility for firefox and chrome
        var myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        var pc = new myPeerConnection({
            iceServers: []
        }),
        noop = function () { },
        localIPs = {},
        ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,
        key;

        function iterateIP(ip) {
            if (!localIPs[ip]) onNewIP(ip);
            localIPs[ip] = true;
        }

        //create a bogus data channel
        pc.createDataChannel("");

        // create offer and set local description
        pc.createOffer().then(function (sdp) {
            sdp.sdp.split('\n').forEach(function (line) {
                if (line.indexOf('candidate') < 0) return;
                line.match(ipRegex).forEach(iterateIP);
            });

            pc.setLocalDescription(sdp, noop, noop);
        }).catch(function (reason) {
            // An error occurred, so handle the failure to connect
        });

        //listen for candidate events
        pc.onicecandidate = function (ice) {
            if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return;
            ice.candidate.candidate.match(ipRegex).forEach(iterateIP);
        };
    }

	this.getPrivateIP = function () {
        getUserIP(function (ip) {
			console.log('this.getPrivateIP', ip);
			// check ip type
			if (ip.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/))
				//local IPs
				clientInfo.ip_private = ip;
			else if (ip.match(/^[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7}$/))
				//IPv6 addresses
				clientInfo.ip_v6 = ip;
			else
				//assume the rest are public IPs
				clientInfo.ip_public = ip;
		});
	}
	this.getPublicIP = function () {
        // 1. Create a new XMLHttpRequest object
        let xhr = new XMLHttpRequest();

        // 2. Configure it: GET-request for the URL /article/.../load
        xhr.open('GET', 'https://api.ipdata.co/?api-key=test'); 

        // 3. Send the request over the network
        xhr.send(null);

        // 4. This will be called after the response is received
        xhr.onload = function () {
            if (xhr.status != 200) { // analyze HTTP status of the response
                console.info(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
            } else { // show the result
                console.log('this.getPublicIP->xhr.onload->xhr.response', xhr.response);// responseText is the server -> {"as":"AS7552 Viettel Group","city":"Hanoi","country":"Vietnam","countryCode":"VN","isp":"Newass2011xDSLHN","lat":21.0313,"lon":105.8516,"org":"","query":"27.72.104.120","region":"HN","regionName":"Hanoi","status":"success","timezone":"Asia/Ho_Chi_Minh","zip":""}
                var obj = JSON.parse(xhr.response);
                clientInfo.ip_public = obj.ip;
                clientInfo.country = obj.country_name;
                clientInfo.city = obj.city;
                clientInfo.timezone = obj.time_zone;
            }
        };

        // 5. on error
        xhr.onerror = function () {
            alert("Request failed");
        };
	}

	// all client info
	this.getClientInfo = function () {
		//this.getPrivateIP();
		//this.getPublicIP();
		clientInfo.user_agent	= navigator.userAgent;
		clientInfo.os			= this.getOS();
		clientInfo.browser		= this.getBrowser();
        clientInfo.screen = this.getScreen();
        clientInfo.is_mobile = this.getIsMobile();
		return clientInfo;
	}
	// ============= /public methods =============

	// auto run
	this.getPrivateIP();
	this.getPublicIP();
}

// tao 1 instance cua AppChartBase va gan vao prop g_AppChartBase cua window obj
try {
    window.g_AppChartBase = new AppChartBase();
}
catch (err) {
    console.error(err);
}

