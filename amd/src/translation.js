/* eslint-disable promise/catch-or-return, no-console */
(function($) {
  // eslint-disable-next-line no-undef
  AblePlayer.prototype.getSupportedLangs = function() {
    // Returns an array of languages for which AblePlayer has translation tables
    // Removing 'nl' as of 2.3.54, pending updates
    var langs = ['ca', 'de', 'en', 'es', 'fr', 'it', 'ja', 'nb'];
    return langs;
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.getTranslationText = function() {
    // Determine language, then get labels and prompts from corresponding translation var
    var deferred, thisObj, lang, msg, translationFile;

    deferred = $.Deferred();

    thisObj = this;

    // Override this.lang to language of the web page, if known and supported
    // otherwise this.lang will continue using default
    if (!this.forceLang) {
      if ($('body').attr('lang')) {
        lang = $('body').attr('lang');
      } else if ($('html').attr('lang')) {
        lang = $('html').attr('lang');
      }
      if (lang !== this.lang) {
        msg = 'Language of web page (' + lang + ') ';
        if ($.inArray(lang, this.getSupportedLangs()) !== -1) {
          // This is a supported lang
          msg += ' has a translation table available.';
          this.lang = lang;
        } else {
          msg += ' is not currently supported. Using default language (' + this.lang + ')';
        }
        if (this.debug) {
          console.log(msg);
        }
      }
    }
    translationFile = this.rootPath + 'translations/' + this.lang + '.js';
    // eslint-disable-next-line promise/always-return, no-unused-vars
    this.importTranslationFile(translationFile).then(function(result) {
      // eslint-disable-next-line no-eval
      thisObj.tt = eval(thisObj.lang);
      deferred.resolve();
    });
    return deferred.promise();
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.importTranslationFile = function(translationFile) {

    var deferred = $.Deferred();

    $.getScript(translationFile)
      // eslint-disable-next-line no-unused-vars
      .done(function(translationVar, textStatus) {
        // Translation file successfully retrieved
        deferred.resolve(translationVar);
      })
      // eslint-disable-next-line no-unused-vars
      .fail(function(jqxhr, settings, exception) {
        deferred.fail();
        // Error retrieving file
        // TODO: handle this
      });
    return deferred.promise();
  };

// eslint-disable-next-line no-undef
})(jQuery);
