/* eslint-disable complexity, block-scoped-var, no-console */
(function($) {
  // Loads files referenced in track elements, and performs appropriate setup.
  // For example, captions and text descriptions.
  // This will be called whenever the player is recreated.
  // Added in v2.2.23: Also handles YouTube caption tracks
  // eslint-disable-next-line no-undef
  AblePlayer.prototype.setupTracks = function() {

    var thisObj = this;

    var deferred = new $.Deferred();
    var promise = deferred.promise();
    this.$tracks = this.$media.find('track');

    this.captions = [];
    this.captionLabels = [];
    this.descriptions = [];
    this.chapters = [];
    this.meta = [];

    var loadingPromises = [];
    for (var ii = 0; ii < this.$tracks.length; ii++) {
      var track = this.$tracks[ii];
      var kind = track.getAttribute('kind');
      var trackSrc = track.getAttribute('src');

      // eslint-disable-next-line no-unused-vars
      var isDefaultTrack = track.getAttribute('default');

      if (!trackSrc) {
        // Nothing to load!
        continue;
      }

      var loadingPromise = this.loadTextObject(trackSrc);
      loadingPromises.push(loadingPromise);
      // eslint-disable-next-line promise/catch-or-return
      loadingPromise.then((function(track, kind) {
        return function(trackSrc, trackText) {
          var cues = thisObj.parseWebVTT(trackSrc, trackText).cues;
          if (kind === 'captions' || kind === 'subtitles') {
            thisObj.setupCaptions(track, cues);
          } else if (kind === 'descriptions') {
            thisObj.setupDescriptions(track, cues);
          } else if (kind === 'chapters') {
            thisObj.setupChapters(track, cues);
          } else if (kind === 'metadata') {
            thisObj.setupMetadata(track, cues);
          }
        };
      })(track, kind));
    }

    // eslint-disable-next-line promise/catch-or-return, promise/always-return
    $.when.apply($, loadingPromises).then(function() {
      deferred.resolve();
    });
    return promise;
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.setupCaptions = function(track, cues) {

    this.hasCaptions = true;
    // SrcLang should always be included with <track>, but HTML5 spec doesn't require it
    // if not provided, assume track is the same language as the default player language
    var trackLang = track.getAttribute('srclang') || this.lang;
    var trackLabel = track.getAttribute('label') || this.getLanguageName(trackLang);
    if (typeof track.getAttribute('default') == 'string') {
      var isDefaultTrack = true;
      // Now remove 'default' attribute from <track>
      // Otherwise, some browsers will display the track
      track.removeAttribute('default');
    } else {
      // eslint-disable-next-line no-redeclare
      var isDefaultTrack = false;
    }
    // Caption cues from WebVTT are used to build a transcript for both audio and video
    // but captions are currently only supported for video
    if (this.mediaType === 'video') {

      // Create a pair of nested divs for displaying captions
      // includes aria-hidden="true" because otherwise
      // captions being added and removed causes sporadic changes to focus in JAWS
      // (not a problem in NVDA or VoiceOver)
      if (!this.$captionsDiv) {
        this.$captionsDiv = $('<div>', {
          'class': 'able-captions',
        });
        this.$captionsWrapper = $('<div>', {
          'class': 'able-captions-wrapper',
          'aria-hidden': 'true'
        }).hide();
        if (this.prefCaptionsPosition === 'below') {
          this.$captionsWrapper.addClass('able-captions-below');
        } else {
          this.$captionsWrapper.addClass('able-captions-overlay');
        }
        this.$captionsWrapper.append(this.$captionsDiv);
        this.$vidcapContainer.append(this.$captionsWrapper);
      }
    }

    this.currentCaption = -1;
    if (this.prefCaptions === 1) {
      // Captions default to on.
      this.captionsOn = true;
    } else {
      this.captionsOn = false;
    }

    if (this.transcriptType === 'external' || this.transcriptType === 'popup') {
      // Remove the "Unknown" option from the select box.
      if (this.$unknownTranscriptOption) {
        this.$unknownTranscriptOption.remove();
        this.$unknownTranscriptOption = null;
      }
      var option = $('<option></option>', {
        value: trackLang,
        lang: trackLang
      }).text(trackLabel);
    }
    // Alphabetize tracks by label
    if (this.transcriptType === 'external' || this.transcriptType === 'popup') {
      var options = this.$transcriptLanguageSelect.find('option');
    }
    if (this.captions.length === 0) { // This is the first
      this.captions.push({
        'cues': cues,
        'language': trackLang,
        'label': trackLabel,
        'def': isDefaultTrack
      });
      if (this.transcriptType === 'external' || this.transcriptType === 'popup') {
        if (isDefaultTrack) {
          option.prop('selected', true);
        }
        this.$transcriptLanguageSelect.append(option);
      }
      this.captionLabels.push(trackLabel);
    } else { // There are already tracks in the array
      var inserted = false;
      for (var i = 0; i < this.captions.length; i++) {
        if (trackLabel.toLowerCase() < this.captionLabels[i].toLowerCase()) {
          // Insert before track i
          this.captions.splice(i, 0, {
            'cues': cues,
            'language': trackLang,
            'label': trackLabel,
            'def': isDefaultTrack
          });
          if (this.transcriptType === 'external' || this.transcriptType === 'popup') {
            // eslint-disable-next-line max-depth
            if (isDefaultTrack) {
              option.prop('selected', true);
            }
            option.insertBefore(options.eq(i));
          }
          this.captionLabels.splice(i, 0, trackLabel);
          inserted = true;
          break;
        }
      }
      if (!inserted) {

        // Just add track to the end
        this.captions.push({
          'cues': cues,
          'language': trackLang,
          'label': trackLabel,
          'def': isDefaultTrack
        });
        if (this.transcriptType === 'external' || this.transcriptType === 'popup') {
          if (isDefaultTrack) {
            option.prop('selected', true);
          }
          this.$transcriptLanguageSelect.append(option);
        }
        this.captionLabels.push(trackLabel);
      }
    }
    if (this.transcriptType === 'external' || this.transcriptType === 'popup') {
      if (this.$transcriptLanguageSelect.find('option').length > 1) {
        // More than one option now, so enable the select.
        this.$transcriptLanguageSelect.prop('disabled', false);
      }
    }
  };


  // eslint-disable-next-line no-undef
  AblePlayer.prototype.setupDescriptions = function(track, cues) {

    // Called via setupTracks() only if there is track with kind="descriptions"
    // prepares for delivery of text description , in case it's needed
    // whether and how it's delivered is controlled within description.js > initDescription()

    // srcLang should always be included with <track>, but HTML5 spec doesn't require it
    // if not provided, assume track is the same language as the default player language
    var trackLang = track.getAttribute('srclang') || this.lang;

    this.hasClosedDesc = true;
    this.currentDescription = -1;
    this.descriptions.push({
      cues: cues,
      language: trackLang
    });
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.setupChapters = function(track, cues) {

    // NOTE: WebVTT supports nested timestamps (to form an outline)
    // This is not currently supported.

    // srcLang should always be included with <track>, but HTML5 spec doesn't require it
    // if not provided, assume track is the same language as the default player language
    var trackLang = track.getAttribute('srclang') || this.lang;

    this.hasChapters = true;

    this.chapters.push({
      cues: cues,
      language: trackLang
    });
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.setupMetadata = function(track, cues) {
    if (this.metaType === 'text') {
      // Metadata is only supported if data-meta-div is provided
      // The player does not display metadata internally
      if (this.metaDiv) {
        if ($('#' + this.metaDiv)) {
          // Container exists
          this.$metaDiv = $('#' + this.metaDiv);
          this.hasMeta = true;
          this.meta = cues;
        }
      }
    } else if (this.metaType === 'selector') {
      this.hasMeta = true;
      this.visibleSelectors = [];
      this.meta = cues;
    }
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.loadTextObject = function(src) {

    var deferred = new $.Deferred();
    var promise = deferred.promise();
    var thisObj = this;

    // Create a temp div for holding data
    var $tempDiv = $('<div>', {
      style: 'display:none'
    });

    $tempDiv.load(src, function(trackText, status) {
      if (status === 'error') {
        if (thisObj.debug) {
          console.log('error reading file ' + src + ': ' + status);
        }
        deferred.fail();
      } else {
        deferred.resolve(src, trackText);
      }
      $tempDiv.remove();
    });
    return promise;
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.setupAltCaptions = function() {
    // Setup captions from an alternative source (not <track> elements)
    // only do this if no <track> captions are provided
    // currently supports: YouTube
    var deferred = new $.Deferred();
    var promise = deferred.promise();

    if (this.captions.length === 0) {
      if (this.player === 'youtube' && typeof youTubeDataAPIKey !== 'undefined') {
        this.setupYouTubeCaptions().done(function() {
          deferred.resolve();
        });
      } else {
        // Repeat for other alt sources once supported (e.g., Vimeo, DailyMotion)
        deferred.resolve();
      }
    } else { // There are <track> captions, so no need for alt source captions
      deferred.resolve();
    }
    return promise;
  };

// eslint-disable-next-line no-undef
})(jQuery);
