/* eslint-disable complexity, block-scoped-var, no-console */
(function($) {
  // Media events
  // eslint-disable-next-line no-undef
  AblePlayer.prototype.onMediaUpdateTime = function() {

    var currentTime = this.getElapsed();
    if (this.swappingSrc && (typeof this.swapTime !== 'undefined')) {
      if (this.swapTime === currentTime) {
        // Described version been swapped and media has scrubbed to time of previous version
        if (this.playing) {
          // Resume playback
          this.playMedia();
          // Reset vars
          this.swappingSrc = false;
          this.swapTime = null;
        }
      }
    } else if (this.startedPlaying) {
      // Do all the usual time-sync stuff during playback
      if (this.prefHighlight === 1) {
        this.highlightTranscript(currentTime);
      }
      this.updateCaption();
      this.showDescription(currentTime);
      this.updateChapter(currentTime);
      this.updateMeta();
      this.refreshControls();
    }
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.onMediaPause = function() {
    if (this.controlsHidden) {
      this.fadeControls('in');
      this.controlsHidden = false;
    }
    if (this.hidingControls) { // A timeout is actively counting
      window.clearTimeout(this.hideControlsTimeout);
      this.hidingControls = false;
    }
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.onMediaComplete = function() {
    // If there's a playlist, advance to next item and start playing
    if (this.hasPlaylist) {
      if (this.playlistIndex === (this.$playlist.length - 1)) {
        // This is the last track in the playlist
        if (this.loop) {
          this.playlistIndex = 0;
          this.swapSource(0);
        }
      } else {
        // This is not the last track. Play the next one.
        this.playlistIndex++;
        this.swapSource(this.playlistIndex);
      }
    }
    this.refreshControls();
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.onMediaNewSourceLoad = function() {

    if (this.swappingSrc === true) {
      // New source file has just been loaded
      if (this.swapTime > 0) {
        // This.swappingSrc will be set to false after seek is complete
        // see onMediaUpdateTime()
        this.seekTo(this.swapTime);
      } else {
        if (this.playing) {
          // Should be able to resume playback
          if (this.player === 'jw') {
            var player = this.jwPlayer;
            // Seems to be a bug in JW player, where this doesn't work when fired immediately.
            // Thus have to use a setTimeout
            setTimeout(function() {
              player.play(true);
            }, 500);
          } else {
            this.playMedia();
          }
        }
        this.swappingSrc = false; // Swapping is finished
        this.refreshControls();
      }
    }
  };

  // End Media events

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.onWindowResize = function() {

    if (this.isFullscreen()) {

      var newWidth, newHeight;

      newWidth = $(window).width();

      // Haven't isolated why, but some browsers return an innerHeight that's 20px too tall in fullscreen mode
      // Test results:
      // Browsers that require a 20px adjustment: Firefox, IE11 (Trident), Edge
      if (this.isUserAgent('Firefox') || this.isUserAgent('Trident') || this.isUserAgent('Edge')) {
        newHeight = window.innerHeight - this.$playerDiv.outerHeight() - 20;
      } else if (window.outerHeight >= window.innerHeight) {
        // Browsers that do NOT require adjustment: Chrome, Safari, Opera, MSIE 10
        newHeight = window.innerHeight - this.$playerDiv.outerHeight();
      } else {
        // Observed in Safari 9.0.1 on Mac OS X: outerHeight is actually less than innerHeight
        // Maybe a bug, or maybe window.outerHeight is already adjusted for controller height(?)
        // No longer observed in Safari 9.0.2
        newHeight = window.outerHeight;
      }
      if (!this.$descDiv.is(':hidden')) {
        newHeight -= this.$descDiv.height();
      }
      this.positionCaptions('overlay');
    } else { // Not fullscreen
      if (this.restoringAfterFullScreen) {
        newWidth = this.preFullScreenWidth;
        newHeight = this.preFullScreenHeight;
      } else {
        // Not restoring after full screen
        newWidth = this.$ableWrapper.width();
        if (typeof this.aspectRatio !== 'undefined') {
          newHeight = Math.round(newWidth / this.aspectRatio);
        } else {
          // Not likely, since this.aspectRatio is defined during intialization
          // however, this is a fallback scenario just in case
          newHeight = this.$ableWrapper.height();
        }
        this.positionCaptions(); // Reset with this.prefCaptionsPosition
      }
    }
    this.resizePlayer(newWidth, newHeight);
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.addSeekbarListeners = function() {
    var thisObj = this;

    // Handle seek bar events.
    // eslint-disable-next-line no-unused-vars
    this.seekBar.bodyDiv.on('startTracking', function(event) {
      thisObj.pausedBeforeTracking = thisObj.isPaused();
      thisObj.pauseMedia();
    }).on('tracking', function(event, position) {
      // Scrub transcript, captions, and metadata.
      thisObj.highlightTranscript(position);
      thisObj.updateCaption(position);
      thisObj.showDescription(position);
      thisObj.updateChapter(thisObj.convertChapterTimeToVideoTime(position));
      thisObj.updateMeta(position);
      thisObj.refreshControls();
    }).on('stopTracking', function(event, position) {
      if (thisObj.useChapterTimes) {
        thisObj.seekTo(thisObj.convertChapterTimeToVideoTime(position));
      } else {
        thisObj.seekTo(position);
      }
      if (!thisObj.pausedBeforeTracking) {
        setTimeout(function() {
          thisObj.playMedia();
        }, 200);
      }
    });
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.onClickPlayerButton = function(el) {
    // TODO: This is super-fragile since we need to know the length of
    // the class name to split off; update this to other way of dispatching?
    var whichButton = $(el).attr('class').split(' ')[0].substr(20);
    if (whichButton === 'play') {
      this.handlePlay();
    } else if (whichButton === 'restart') {
      this.seekTrigger = 'restart';
      this.handleRestart();
    } else if (whichButton === 'rewind') {
      this.seekTrigger = 'rewind';
      this.handleRewind();
    } else if (whichButton === 'forward') {
      this.seekTrigger = 'forward';
      this.handleFastForward();
    } else if (whichButton === 'mute') {
      this.handleMute();
    } else if (whichButton === 'volume') {
      this.handleVolume();
    } else if (whichButton === 'faster') {
      this.handleRateIncrease();
    } else if (whichButton === 'slower') {
      this.handleRateDecrease();
    } else if (whichButton === 'captions') {
      this.handleCaptionToggle();
    } else if (whichButton === 'chapters') {
      this.handleChapters();
    } else if (whichButton === 'descriptions') {
      this.handleDescriptionToggle();
    } else if (whichButton === 'sign') {
      this.handleSignToggle();
    } else if (whichButton === 'preferences') {
      this.handlePrefsClick();
    } else if (whichButton === 'help') {
      this.handleHelpClick();
    } else if (whichButton === 'transcript') {
      this.handleTranscriptToggle();
    } else if (whichButton === 'fullscreen') {
      this.handleFullscreenToggle();
    }
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.okToHandleKeyPress = function() {

    // Returns true unless user's focus is on a UI element
    // that is likely to need supported keystrokes, including space

    // eslint-disable-next-line no-undef
    var activeElement = AblePlayer.getActiveDOMElement();

    if ($(activeElement).prop('tagName') === 'INPUT') {
      return false;
    } else {
      return true;
    }
  };

  // eslint-disable-next-line no-undef, consistent-return
  AblePlayer.prototype.onPlayerKeyPress = function(e) {
    // Handle keystrokes (using DHTML Style Guide recommended key combinations)
    // http://dev.aol.com/dhtml_style_guide/#mediaplayer
    // Modifier keys Alt + Ctrl are on by default, but can be changed within Preferences
    // NOTE #1: Style guide only supports Play/Pause, Stop, Mute, Captions, & Volume Up & Down
    // The rest are reasonable best choices
    // NOTE #2: If there are multiple players on a single page, keystroke handlers
    // are only bound to the FIRST player
    if (!this.okToHandleKeyPress()) {
      return false;
    }
    // Convert to lower case.
    var which = e.which;

    if (which >= 65 && which <= 90) {
      which += 32;
    }
    if (which === 27) {
      this.closePopups();
    } else if (which === 32) { // Spacebar = play/pause
      if (this.$ableWrapper.find('.able-controller button:focus').length === 0) {
        // Only toggle play if a button does not have focus
        // if a button has focus, space should activate that button
        this.handlePlay();
      }
    } else if (which === 112) { // P = play/pause
      if (this.usingModifierKeys(e)) {
        this.handlePlay();
      }
    } else if (which === 115) { // S = stop (now restart)
      if (this.usingModifierKeys(e)) {
        this.handleRestart();
      }
    } else if (which === 109) { // M = mute
      if (this.usingModifierKeys(e)) {
        this.handleMute();
      }
    } else if (which === 118) { // V = volume
      if (this.usingModifierKeys(e)) {
        this.handleVolume();
      }
    } else if (which >= 49 && which <= 57) { // Set volume 1-9
      if (this.usingModifierKeys(e)) {
        this.handleVolume(which);
      }
    } else if (which === 99) { // C = caption toggle
      if (this.usingModifierKeys(e)) {
        this.handleCaptionToggle();
      }
    } else if (which === 100) { // D = description
      if (this.usingModifierKeys(e)) {
        this.handleDescriptionToggle();
      }
    } else if (which === 102) { // F = forward
      if (this.usingModifierKeys(e)) {
        this.handleFastForward();
      }
    } else if (which === 114) { // R = rewind
      if (this.usingModifierKeys(e)) {
        this.handleRewind();
      }
    } else if (which === 101) { // E = preferences
      if (this.usingModifierKeys(e)) {
        this.handlePrefsClick();
      }
    } else if (which === 13) { // Enter
      var thisElement = $(document.activeElement);
      if (thisElement.prop('tagName') === 'SPAN') {
        // Register a click on this SPAN
        // if it's a transcript span the transcript span click handler will take over
        thisElement.click();
      } else if (thisElement.prop('tagName') === 'LI') {
        thisElement.click();
      }
    }
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.addHtml5MediaListeners = function() {

    var thisObj = this;

    // NOTE: iOS and some browsers do not support autoplay
    // and no events are triggered until media begins to play
    // Able Player gets around this by automatically loading media in some circumstances
    // (see initialize.js > initPlayer() for details)
    this.$media
      .on('emptied', function() {
        // Do something
      })
      .on('loadedmetadata', function() {
        thisObj.onMediaNewSourceLoad();
      })
      .on('canplay', function() {
        // Previously handled seeking to startTime here
        // but it's probably safer to wait for canplaythrough
        // so we know player can seek ahead to anything
      })
      .on('canplaythrough', function() {
        if (thisObj.seekTrigger == 'restart' || thisObj.seekTrigger == 'chapter' || thisObj.seekTrigger == 'transcript') {
          // By clicking on any of these elements, user is likely intending to play
          // Not included: elements where user might click multiple times in succession
          // (i.e., 'rewind', 'forward', or seekbar); for these, video remains paused until user initiates play
          thisObj.playMedia();
        } else if (!thisObj.startedPlaying) {
          if (thisObj.startTime) {
            if (thisObj.seeking) {
              // A seek has already been initiated
              // since canplaythrough has been triggered, the seek is complete
              thisObj.seeking = false;
              if (thisObj.autoplay) {
                thisObj.playMedia();
              }
            } else {
              // Haven't started seeking yet
              thisObj.seekTo(thisObj.startTime);
            }
          } else if (thisObj.defaultChapter && typeof thisObj.selectedChapters !== 'undefined') {
            thisObj.seekToChapter(thisObj.defaultChapter);
          } else {
            // There is now startTime, therefore no seeking required
            if (thisObj.autoplay) {
              thisObj.playMedia();
            }
          }
        } else if (thisObj.hasPlaylist) {
          if ((thisObj.playlistIndex !== (thisObj.$playlist.length - 1)) || thisObj.loop) {
            // This is not the last track in the playlist (OR playlist is looping so it doesn't matter)
            thisObj.playMedia();
          }
        } else {
          // Already started playing
        }
      })
      .on('playing', function() {
        thisObj.playing = true;
        thisObj.refreshControls();
      })
      .on('ended', function() {
        thisObj.playing = false;
        thisObj.onMediaComplete();
      })
      .on('progress', function() {
        thisObj.refreshControls();
      })
      .on('waiting', function() {
        thisObj.refreshControls();
      })
      .on('durationchange', function() {
        // Display new duration.
        thisObj.refreshControls();
      })
      .on('timeupdate', function() {
        thisObj.onMediaUpdateTime();
      })
      .on('play', function() {
        if (thisObj.debug) {
          console.log('media play event');
        }
      })
      .on('pause', function() {
        if (!thisObj.clickedPlay) {
          // 'pause' was triggered automatically, not initiated by user
          // this happens between tracks in a playlist
          if (thisObj.hasPlaylist) {
            // Do NOT set playing to false.
            // doing so prevents continual playback after new track is loaded
          } else {
            thisObj.playing = false;
          }
        } else {
          thisObj.playing = false;
        }
        thisObj.clickedPlay = false; // Done with this variable
        thisObj.onMediaPause();
      })
      .on('ratechange', function() {
        // Do something
      })
      .on('volumechange', function() {
        thisObj.volume = thisObj.getVolume();
        if (thisObj.debug) {
          console.log('media volume change to ' + thisObj.volume + ' (' + thisObj.volumeButton + ')');
        }
      })
      .on('error', function() {
        if (thisObj.debug) {
          switch (thisObj.media.error.code) {
            case 1:
              console.log('HTML5 Media Error: MEDIA_ERR_ABORTED');
              break;
            case 2:
              console.log('HTML5 Media Error: MEDIA_ERR_NETWORK ');
              break;
            case 3:
              console.log('HTML5 Media Error: MEDIA_ERR_DECODE ');
              break;
            case 4:
              console.log('HTML5 Media Error: MEDIA_ERR_SRC_NOT_SUPPORTED ');
              break;
          }
        }
      });
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.addJwMediaListeners = function() {
    var thisObj = this;
    // Add listeners for JW Player events
    this.jwPlayer
      .onTime(function() {
        thisObj.onMediaUpdateTime();
      })
      .onComplete(function() {
        thisObj.onMediaComplete();
      })
      .onReady(function() {
        if (thisObj.debug) {
          console.log('JW Player onReady event fired');
        }
        // Remove JW Player from tab order.
        // We don't want users tabbing into the Flash object and getting trapped
        $('#' + thisObj.jwId).removeAttr('tabindex');

        // JW Player was initialized with no explicit width or height; get them now
        thisObj.$fallbackWrapper = $('#' + thisObj.mediaId + '_fallback_wrapper');
        thisObj.fallbackDefaultWidth = thisObj.$fallbackWrapper.width();
        thisObj.fallbackDefaultHeight = thisObj.$fallbackWrapper.height();
        thisObj.fallbackRatio = thisObj.fallbackDefaultWidth / thisObj.fallbackDefaultHeight;

        if (thisObj.startTime > 0 && !thisObj.startedPlaying) {
          thisObj.seekTo(thisObj.startTime);
          thisObj.startedPlaying = true;
        }
        thisObj.refreshControls();
      })
      .onSeek(function(event) {
        // This is called when user scrubs ahead or back,
        // after the target offset is reached
        if (thisObj.debug) {
          console.log('Seeking to ' + event.position + '; target: ' + event.offset);
        }

        if (thisObj.jwSeekPause) {
          // Media was temporarily paused
          thisObj.jwSeekPause = false;
          thisObj.playMedia();
        }

        setTimeout(function() {
          thisObj.refreshControls();
        }, 300);
      })
      .onPlay(function() {
        if (thisObj.debug) {
          console.log('JW Player onPlay event fired');
        }
        thisObj.refreshControls();
      })
      .onPause(function() {
        thisObj.onMediaPause();
      })
      .onBuffer(function() {
        if (thisObj.debug) {
          console.log('JW Player onBuffer event fired');
        }
        thisObj.refreshControls();
      })
      .onBufferChange(function() {
        thisObj.refreshControls();
      })
      // eslint-disable-next-line no-unused-vars
      .onIdle(function(e) {
        if (thisObj.debug) {
          console.log('JW Player onIdle event fired');
        }
        thisObj.refreshControls();
      })
      .onMeta(function() {
        if (thisObj.debug) {
          console.log('JW Player onMeta event fired');
        }
      })
      .onPlaylist(function() {
        if (thisObj.debug) {
          console.log('JW Player onPlaylist event fired');
        }

        // Playlist change includes new media source.
        thisObj.onMediaNewSourceLoad();
      });
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.addEventListeners = function() {
    var thisObj;

    // Save the current object context in thisObj for use with inner functions.
    thisObj = this;

    // Appropriately resize media player for full screen.
    $(window).resize(function() {
      thisObj.onWindowResize();
    });

    // Refresh player if it changes from hidden to visible
    // There is no event triggered by a change in visibility
    // but MutationObserver works in most browsers (but NOT in IE 10 or earlier)
    // http://caniuse.com/#feat=mutationobserver
    if (window.MutationObserver) {
      var target = this.$ableDiv[0];
      var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            // The player's style attribute has changed. Check to see if it's visible
            if (thisObj.$ableDiv.is(':visible')) {
              thisObj.refreshControls();
            }
          }
        });
      });
      var config = {attributes: true, childList: true, characterData: true};
      observer.observe(target, config);
    } else {
      // Browser doesn't support MutationObserver
      // TODO: Figure out an alternative solution for this rare use case in older browsers
      // See example in buildplayer.js > useSvg()
    }

    this.addSeekbarListeners();

    // Handle clicks on player buttons
    this.$controllerDiv.find('button').on('click', function(event) {
      event.stopPropagation();
      thisObj.onClickPlayerButton(this);
    });

    // Handle clicks anywhere on the page. If any popups are open, close them.
    $(document).on('click', function() {
      if ($('.able-popup:visible').length || $('.able-volume-popup:visible')) {
        // At least one popup is visible
        thisObj.closePopups();
      }
    });

    // Handle mouse movement over player; make controls visible again if hidden
    this.$ableDiv.on('mousemove', function() {
      if (thisObj.controlsHidden) {
        thisObj.fadeControls('in');
        thisObj.controlsHidden = false;
        // After showing controls, wait another few seconds, then hide them again if video continues to play
        thisObj.hidingControls = true;
        thisObj.hideControlsTimeout = window.setTimeout(function() {
          if (typeof thisObj.playing !== 'undefined' && thisObj.playing === true) {
            thisObj.fadeControls('out');
            thisObj.controlsHidden = true;
            thisObj.hidingControls = false;
          }
        }, 3000);
      }
    });

    // If user presses a key from anywhere on the page, show player controls
    $(document).keydown(function() {
      if (thisObj.controlsHidden) {
        thisObj.fadeControls('in');
        thisObj.controlsHidden = false;
      }
    });

    // Handle local keydown events if this isn't the only player on the page;
    // otherwise these are dispatched by global handler (see ableplayer-base,js)
    this.$ableDiv.keydown(function(e) {
      // eslint-disable-next-line no-undef
      if (AblePlayer.nextIndex > 1) {
        thisObj.onPlayerKeyPress(e);
      }
    });

    // Transcript is not a child of this.$ableDiv
    // therefore, must be added separately
    if (this.$transcriptArea) {
      this.$transcriptArea.keydown(function(e) {
        // eslint-disable-next-line no-undef
        if (AblePlayer.nextIndex > 1) {
          thisObj.onPlayerKeyPress(e);
        }
      });
    }

    // Handle clicks on playlist items
    if (this.$playlist) {
      this.$playlist.click(function() {
        thisObj.playlistIndex = $(this).index();
        thisObj.swapSource(thisObj.playlistIndex);
      });
    }

    // Also play/pause when clicking on the media.
    this.$media.click(function() {
      thisObj.handlePlay();
    });

    // Add listeners for media events
    if (this.player === 'html5') {
      this.addHtml5MediaListeners();
    } else if (this.player === 'jw') {
      this.addJwMediaListeners();
    } else if (this.player === 'youtube') {
      // Youtube doesn't give us time update events, so we just periodically generate them ourselves
      setInterval(function() {
        thisObj.onMediaUpdateTime();
      }, 300);
    }
  };
// eslint-disable-next-line no-undef
})(jQuery);
