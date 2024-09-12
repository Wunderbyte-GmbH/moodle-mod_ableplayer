/* eslint-disable brace-style, block-spacing, no-console, no-useless-escape */
// eslint-disable-next-line no-unused-vars
(function(_$) {

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.getUserAgent = function() {

    // Whenever possible we avoid browser sniffing. Better to do feature detection.
    // However, in case it's needed...
    // this function defines a userAgent array that can be used to query for common browsers and OSs
    // NOTE: This would be much simpler with jQuery.browser but that was removed from jQuery 1.9
    // http://api.jquery.com/jQuery.browser/
    // Helper function to detect browser and version
    /**
     * @param {any} userAgent
     * @param {any} vendor
     */
    function detectBrowser(userAgent, vendor) {
      let browser = {name: 'Unknown', version: 'Unknown'};

      if (/Firefox[\/\s](\d+\.\d+)/.test(userAgent)) {
        browser.name = 'Firefox';
        browser.version = RegExp.$1;
      } else if (/MSIE (\d+\.\d+);/.test(userAgent)) {
        browser.name = 'Internet Explorer';
        browser.version = RegExp.$1;
      } else if (/Trident.*rv[ :]*(\d+\.\d+)/.test(userAgent)) {
        browser.name = 'Internet Explorer';
        browser.version = RegExp.$1;
      } else if (/Edge[\/\s](\d+\.\d+)/.test(userAgent)) {
        browser.name = 'Edge';
        browser.version = RegExp.$1;
      } else if (/OPR\/(\d+\.\d+)/i.test(userAgent)) {
        browser.name = 'Opera';
        browser.version = RegExp.$1;
      } else if (/Chrome/.test(userAgent) && /Google Inc/.test(vendor)) {
        browser.name = 'Chrome';
        if (/Chrome[\/\s](\d+\.\d+)/.test(userAgent)) {
          browser.version = RegExp.$1;
        }
      } else if (/Safari/.test(userAgent) && /Apple Computer/.test(vendor)) {
        browser.name = 'Safari';
        if (/Version[\/\s](\d+\.\d+)/.test(userAgent)) {
          browser.version = RegExp.$1;
        }
      }

      return browser;
    }

    // Helper function to detect operating system
    /**
     * @param {any} userAgent
     */
    function detectOS(userAgent) {
      if (userAgent.indexOf("Windows NT 6.2") != -1) {return "Windows 8";}
      if (userAgent.indexOf("Windows NT 6.1") != -1) {return "Windows 7";}
      if (userAgent.indexOf("Windows NT 6.0") != -1) {return "Windows Vista";}
      if (userAgent.indexOf("Windows NT 5.1") != -1) {return "Windows XP";}
      if (userAgent.indexOf("Windows NT 5.0") != -1) {return "Windows 2000";}
      if (userAgent.indexOf("Mac") != -1) {return "Mac/iOS";}
      if (userAgent.indexOf("X11") != -1) {return "UNIX";}
      if (userAgent.indexOf("Linux") != -1) {return "Linux";}
      return "Unknown";
    }

    // Assign userAgent details
    this.userAgent = {};
    this.userAgent.browser = detectBrowser(navigator.userAgent, navigator.vendor);
    this.userAgent.os = detectOS(navigator.userAgent);

    // Debug information
    if (this.debug) {
      console.log('User agent:' + navigator.userAgent);
      console.log('Vendor: ' + navigator.vendor);
      console.log('Browser: ' + this.userAgent.browser.name);
      console.log('Version: ' + this.userAgent.browser.version);
      console.log('OS: ' + this.userAgent.os);
    }
  };


  // eslint-disable-next-line no-undef
  AblePlayer.prototype.isUserAgent = function(which) {
    var userAgent = navigator.userAgent.toLowerCase();
    if (this.debug) {
      console.log('User agent: ' + userAgent);
    }
    if (userAgent.indexOf(which.toLowerCase()) !== -1) {
      return true;
    }
    else {
      return false;
    }
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.isIOS = function(version) {
    // Return true if this is IOS
    // if version is provided check for a particular version

    var userAgent, iOS;

    userAgent = navigator.userAgent.toLowerCase();
    iOS = /ipad|iphone|ipod/.exec(userAgent);
    if (iOS) {
      if (typeof version !== 'undefined') {
        if (userAgent.indexOf('os ' + version) !== -1) {
          // This is the target version of iOS
          return true;
        }
        else {
          return false;
        }
      }
      else {
        // No version was specified
        return true;
      }
    }
    else {
      // This is not IOS
      return false;
    }
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.browserSupportsVolume = function() {
    // Ideally we could test for volume support
    // However, that doesn't seem to be reliable
    // http://stackoverflow.com/questions/12301435/html5-video-tag-volume-support

    var userAgent, noVolume;

    userAgent = navigator.userAgent.toLowerCase();
    noVolume = /ipad|iphone|ipod|android|blackberry|windows ce|windows phone|webos|playbook/.exec(userAgent);
    if (noVolume) {
      if (noVolume[0] === 'android' && /firefox/.test(userAgent)) {
        // Firefox on android DOES support changing the volume:
        return true;
      }
      else {
        return false;
      }
    }
    else {
      // As far as we know, this userAgent supports volume control
      return true;
    }
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.nativeFullscreenSupported = function() {
    if (this.player === 'jw') {
      // JW player flash has problems with native fullscreen.
      return false;
    }
    return document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.msFullscreenEnabled;
  };

// eslint-disable-next-line no-undef
})(jQuery);
