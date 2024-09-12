(function($) {

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.addVolumeSlider = function($div) {

    // Input type="range" requires IE10 and later
    // and still isn't supported by Opera Mini as of v8
    // Also, vertical orientation of slider requires CSS hacks
    // and causes problems in some screen readers
    // Therefore, building a custom vertical volume slider
    // eslint-disable-next-line no-unused-vars
    var thisObj, volumeSliderId, volumeHelpId, x, y, volumePct;

    thisObj = this;

    // Define a few variables
    volumeSliderId = this.mediaId + '-volume-slider';
    volumeHelpId = this.mediaId + '-volume-help';
    this.volumeTrackHeight = 50; // Must match CSS height for .able-volume-slider
    this.volumeHeadHeight = 7; // Must match CSS height for .able-volume-head
    this.volumeTickHeight = this.volumeTrackHeight / 10;

    this.$volumeSlider = $('<div>', {
      'id': volumeSliderId,
      'class': 'able-volume-slider',
      'aria-hidden': 'true'
    }).hide();
    this.$volumeSliderTooltip = $('<div>', {
      'class': 'able-tooltip',
      'role': 'tooltip'
    }).hide();
    this.$volumeSliderTrack = $('<div>', {
      'class': 'able-volume-track'
    });
    this.$volumeSliderTrackOn = $('<div>', {
      'class': 'able-volume-track able-volume-track-on'
    });
    this.$volumeSliderHead = $('<div>', {
      'class': 'able-volume-head',
      'role': 'slider',
      'aria-orientation': 'vertical',
      'aria-label': this.tt.volumeUpDown,
      'aria-valuemin': 0,
      'aria-valuemax': 10,
      'aria-valuenow': this.volume,
      'tabindex': -1
    });
    this.$volumeSliderTrack.append(this.$volumeSliderTrackOn, this.$volumeSliderHead);
    this.$volumeAlert = $('<div>', {
      'class': 'able-offscreen',
      'aria-live': 'assertive',
      'aria-atomic': 'true'
    });
    volumePct = parseInt(thisObj.volume) / 10 * 100;
    this.$volumeHelp = $('<div>', {
      'id': volumeHelpId,
      'class': 'able-volume-help'
    }).text(volumePct + '%, ' + this.tt.volumeHelp);
    this.$volumeButton.attr({
      'aria-describedby': volumeHelpId
    });
    this.$volumeSlider.append(this.$volumeSliderTooltip, this.$volumeSliderTrack, this.$volumeAlert, this.$volumeHelp);
    $div.append(this.$volumeSlider);

    this.refreshVolumeSlider(this.volume);

    // Add event listeners
    this.$volumeSliderHead.on('mousedown', function(event) {
      event.preventDefault(); // Prevent text selection (implications?)
      thisObj.draggingVolume = true;
      thisObj.volumeHeadPositionTop = $(this).offset().top;
    });

    // Prevent dragging after mouseup as mouseup not detected over iframe (YouTube)
    // eslint-disable-next-line no-unused-vars
    this.$mediaContainer.on('mouseover', function(event) {
      if (thisObj.player == 'youtube') {
        thisObj.draggingVolume = false;
      }
    });

    // eslint-disable-next-line no-unused-vars
    $(document).on('mouseup', function(event) {
      thisObj.draggingVolume = false;
    });

    $(document).on('mousemove', function(event) {
      if (thisObj.draggingVolume) {
        x = event.pageX;
        y = event.pageY;
        thisObj.moveVolumeHead(y);
      }
    });

    this.$volumeSliderHead.on('keydown', function(event) {
      // Left arrow or down arrow
      if (event.which === 37 || event.which === 40) {
        thisObj.handleVolume('down');
      } else if (event.which === 39 || event.which === 38) {
        thisObj.handleVolume('up');
      } else if (event.which === 27 || event.which === 13) {
        // Close popup
        if (thisObj.$volumeSlider.is(':visible')) {
          thisObj.hideVolumePopup();
        } else {
          thisObj.showVolumePopup();
        }
      } else {
        return;
      }
      event.preventDefault();
    });
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.refreshVolumeSlider = function(volume) {

    // Adjust slider position based on current volume
    var volumePct, volumePctText;
    volumePct = (volume / 10) * 100;
    volumePctText = volumePct + '%';

    var trackOnHeight, trackOnTop, headTop;
    trackOnHeight = volume * this.volumeTickHeight;
    trackOnTop = this.volumeTrackHeight - trackOnHeight;
    headTop = trackOnTop - this.volumeHeadHeight;

    this.$volumeSliderTrackOn.css({
      'height': trackOnHeight + 'px',
      'top': trackOnTop + 'px'
    });
    this.$volumeSliderHead.attr({
      'aria-valuenow': volume,
      'aria-valuetext': volumePctText
    });
    this.$volumeSliderHead.css({
      'top': headTop + 'px'
    });
    this.$volumeAlert.text(volumePct + '%');

  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.refreshVolumeButton = function(volume) {

    var volumeName, volumePct, volumeLabel, volumeIconClass, volumeImg;

    volumeName = this.getVolumeName(volume);
    volumePct = (volume / 10) * 100;
    volumeLabel = this.tt.volume + ' ' + volumePct + '%';

    if (this.iconType === 'font') {
      volumeIconClass = 'icon-volume-' + volumeName;
      this.$volumeButton.find('span').first().removeClass().addClass(volumeIconClass);
      this.$volumeButton.find('span.able-clipped').text(volumeLabel);
    } else {
      volumeImg = this.imgPath + 'volume-' + volumeName + '.png';
      this.$volumeButton.find('img').attr('src', volumeImg);
    }
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.moveVolumeHead = function(y) {

    // Y is current position after mousemove
    var direction, ticksDiff, newVolume;

    var diff = this.volumeHeadPositionTop - y;

    // Only move the volume head if user had dragged at least one tick
    // this is more efficient, plus creates a "snapping' effect
    if (Math.abs(diff) > this.volumeTickHeight) {
      if (diff > 0) {
        direction = 'up';
      } else {
        direction = 'down';
      }
      if (direction == 'up' && this.volume == 10) {
        // Can't go any higher
        return;
      } else if (direction == 'down' && this.volume == 0) {
        // Can't go any lower
        return;
      } else {
        ticksDiff = Math.round(Math.abs(diff) / this.volumeTickHeight);
        if (direction == 'up') {
          newVolume = this.volume + ticksDiff;
          if (newVolume > 10) {
            newVolume = 10;
          }
        } else { // Direction is down
          newVolume = this.volume - ticksDiff;
          if (newVolume < 0) {
            newVolume = 0;
          }
        }
        this.setVolume(newVolume); // This.volume will be updated after volumechange event fires (event.js)
        this.refreshVolumeSlider(newVolume);
        this.refreshVolumeButton(newVolume);
        this.volumeHeadPositionTop = y;
      }
    }
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.handleVolume = function(direction) {

    // 'direction is either 'up','down', or an ASCII key code 49-57 (numeric keys 1-9)
    // Action: calculate and change the volume
    // Don't change this.volume and this.volumeButton yet - wait for 'volumechange' event to fire (event.js)

    // If NO direction is provided, user has just clicked on the Volume button
    // Action: show slider
    var volume;

    if (typeof direction === 'undefined') {
      if (this.$volumeSlider.is(':visible')) {
        this.hideVolumePopup();
      } else {
        this.showVolumePopup();
      }
      return;
    }

    if (direction >= 49 && direction <= 57) {
      volume = direction - 48;
    } else {

      volume = this.getVolume();

      if (direction === 'up' && volume < 10) {
        volume += 1;
      } else if (direction === 'down' && volume > 0) {
        volume -= 1;
      }
    }

    if (this.isMuted() && volume > 0) {
      this.setMute(false);
    } else if (volume === 0) {
      this.setMute(true);
    } else {
      this.setVolume(volume); // This.volume will be updated after volumechange event fires (event.js)
      this.refreshVolumeSlider(volume);
      this.refreshVolumeButton(volume);
    }
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.handleMute = function() {
    if (this.isMuted()) {
      this.setMute(false);
    } else {
      this.setMute(true);
    }
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.showVolumePopup = function() {

    this.closePopups();
    this.$tooltipDiv.hide();
    this.$volumeSlider.show().attr('aria-hidden', 'false');
    this.$volumeSliderHead.attr('tabindex', '0').focus();
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.hideVolumePopup = function() {

    this.$volumeSlider.hide().attr('aria-hidden', 'true');
    this.$volumeSliderHead.attr('tabindex', '-1');
    this.$volumeButton.focus();
  };

  // eslint-disable-next-line no-undef, consistent-return
  AblePlayer.prototype.isMuted = function() {

    if (this.player === 'html5') {
      return this.media.muted;
    } else if (this.player === 'jw' && this.jwPlayer) {
      return this.jwPlayer.getMute();
    } else if (this.player === 'youtube') {
      return this.youTubePlayer.isMuted();
    }
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.setMute = function(mute) {

    // Mute is either true (muting) or false (unmuting)
    if (mute) {
      // Save current volume so it can be restored after unmute
      this.lastVolume = this.volume;
      this.volume = 0;
    } else { // Restore to previous volume
      if (typeof this.lastVolume !== 'undefined') {
        this.volume = this.lastVolume;
      }
    }

    if (this.player === 'html5') {
      this.media.muted = mute;
    } else if (this.player === 'jw' && this.jwPlayer) {
      this.jwPlayer.setMute(mute);
    } else if (this.player === 'youtube') {
      if (mute) {
        this.youTubePlayer.mute();
      } else {
        this.youTubePlayer.unMute();
      }
    }
    this.refreshVolumeSlider(this.volume);
    this.refreshVolumeButton(this.volume);
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.setVolume = function(volume) {

    // Volume is 1 to 10
    // convert as needed depending on player

    if (this.player === 'html5') {
      this.media.volume = volume / 10;
      if (this.hasSignLanguage && this.signVideo) {
        this.signVideo.volume = 0; // Always mute
      }
    } else if (this.player === 'jw' && this.jwPlayer) {
      this.jwPlayer.setVolume(volume * 10);
    } else if (this.player === 'youtube') {
      this.youTubePlayer.setVolume(volume * 10);
      this.volume = volume;
    }

    this.lastVolume = volume;
  };

  // eslint-disable-next-line no-undef, consistent-return, no-unused-vars
  AblePlayer.prototype.getVolume = function(volume) {

    // Return volume using common audio control scale 1 to 10

    if (this.player === 'html5') {
      // Uses 0 to 1 scale
      return this.media.volume * 10;
    } else if (this.player === 'jw' && this.jwPlayer) {
      // Uses 0 to 100 scale
      return this.jwPlayer.getVolume() / 10;
    } else if (this.player === 'youtube') {
      // Uses 0 to 100 scale
      return this.youTubePlayer.getVolume() / 10;
    }
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.getVolumeName = function(volume) {

    // Returns 'mute','soft','medium', or 'loud' depending on volume level
    if (volume == 0) {
      return 'mute';
    } else if (volume == 10) {
      return 'loud';
    } else if (volume < 5) {
      return 'soft';
    } else {
      return 'medium';
    }
  };

// eslint-disable-next-line no-undef
})(jQuery);
