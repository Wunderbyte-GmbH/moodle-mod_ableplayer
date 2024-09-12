(function($) {

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.populateChaptersDiv = function() {

    var headingLevel, headingType, headingId, $chaptersHeading;

    if ($('#' + this.chaptersDivLocation)) {
      this.$chaptersDiv = $('#' + this.chaptersDivLocation);
      this.$chaptersDiv.addClass('able-chapters-div');

      // Add optional header
      if (this.chaptersTitle) {
        headingLevel = this.getNextHeadingLevel(this.$chaptersDiv);
        headingType = 'h' + headingLevel.toString();
        headingId = this.mediaId + '-chapters-heading';
        $chaptersHeading = $('<' + headingType + '>', {
          'class': 'able-chapters-heading',
          'id': headingId
        }).text(this.chaptersTitle);
        this.$chaptersDiv.append($chaptersHeading);
      }

      this.$chaptersNav = $('<nav>');
      if (this.chaptersTitle) {
        this.$chaptersNav.attr('aria-labelledby', headingId);
      } else {
        this.$chaptersNav.attr('aria-label', this.tt.chapters);
      }
      this.$chaptersDiv.append(this.$chaptersNav);

      // Populate this.$chaptersNav with a list of chapters
      this.updateChaptersList();
    }
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.updateChaptersList = function() {

    var thisObj, cues, $chaptersList, c, thisChapter,
      $chapterItem, $chapterButton, hasDefault,
      // eslint-disable-next-line no-unused-vars
      getClickFunction, $clickedItem, thisChapterIndex;

    thisObj = this;

    if (!this.$chaptersNav) {
      return false;
    }

    if (typeof this.useChapterTimes === 'undefined') {
      if (this.seekbarScope === 'chapter' && this.selectedChapters.cues.length) {
        this.useChapterTimes = true;
      } else {
        this.useChapterTimes = false;
      }
    }

    if (this.useChapterTimes) {
      cues = this.selectedChapters.cues;
    } else if (this.chapters.length >= 1) {
      cues = this.chapters[0].cues;
    } else {
      cues = [];
    }
    if (cues.length > 0) {
      $chaptersList = $('<ul>');
      for (c = 0; c < cues.length; c++) {
        thisChapter = c;
        $chapterItem = $('<li></li>');
        $chapterButton = $('<button>', {
          'type': 'button',
          'val': thisChapter
        }).text(this.flattenCueForCaption(cues[thisChapter]));

        // Add event listeners
        // eslint-disable-next-line no-loop-func
        getClickFunction = function(time) {
          return function() {
            thisObj.seekTrigger = 'chapter';
            $clickedItem = $(this).closest('li');
            $chaptersList = $(this).closest('ul').find('li');
            thisChapterIndex = $chaptersList.index($clickedItem);
            $chaptersList.removeClass('able-current-chapter').attr('aria-selected', '');
            $clickedItem.addClass('able-current-chapter').attr('aria-selected', 'true');
            // Need to updateChapter before seeking to it
            // Otherwise seekBar is redrawn with wrong chapterDuration and/or chapterTime
            thisObj.updateChapter(time);
            thisObj.seekTo(time);
          };
        };
        $chapterButton.on('click', getClickFunction(cues[thisChapter].start)); // Works with Enter too
        $chapterButton.on('focus', function() {
          $(this).closest('ul').find('li').removeClass('able-focus');
          $(this).closest('li').addClass('able-focus');
        });
        $chapterItem.on('hover', function() {
          $(this).closest('ul').find('li').removeClass('able-focus');
          $(this).addClass('able-focus');
        });
        $chapterItem.on('mouseleave', function() {
          $(this).removeClass('able-focus');
        });
        $chapterButton.on('blur', function() {
          $(this).closest('li').removeClass('able-focus');
        });

        // Put it all together
        $chapterItem.append($chapterButton);
        $chaptersList.append($chapterItem);
        if (this.defaultChapter === cues[thisChapter].id) {
          $chapterButton.attr('aria-selected', 'true').parent('li').addClass('able-current-chapter');
          this.currentChapter = cues[thisChapter];
          hasDefault = true;
        }
      }
      if (!hasDefault) {
        // Select the first chapter
        this.currentChapter = cues[0];
        $chaptersList.find('button').first().attr('aria-selected', 'true')
          .parent('li').addClass('able-current-chapter');
      }
      this.$chaptersNav.html($chaptersList);
    }
    return false;
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.seekToChapter = function(chapterId) {

    // Step through chapters looking for matching ID
    var i = 0;
    while (i < this.selectedChapters.cues.length) {
      if (this.selectedChapters.cues[i].id == chapterId) {
        // Found the target chapter! Seek to it
        this.seekTo(this.selectedChapters.cues[i].start);
        this.updateChapter(this.selectedChapters.cues[i].start);
        break;
      }
      i++;
    }
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.updateChapter = function(now) {

    // As time-synced chapters change during playback, track changes in current chapter
    if (typeof this.selectedChapters === 'undefined') {
      return;
    }

    var chapters, i, thisChapterIndex;

    chapters = this.selectedChapters.cues;
    for (i = 0; i < chapters.length; i++) {
      if ((chapters[i].start <= now) && (chapters[i].end > now)) {
        thisChapterIndex = i;
        break;
      }
    }
    if (typeof thisChapterIndex !== 'undefined') {
      if (this.currentChapter !== chapters[thisChapterIndex]) {
        // This is a new chapter
        this.currentChapter = chapters[thisChapterIndex];
        if (this.useChapterTimes) {
          this.chapterDuration = this.getChapterDuration();
          this.seekIntervalCalculated = false; // Will be recalculated in setSeekInterval()
        }
        if (typeof this.$chaptersDiv !== 'undefined') {
          // Chapters are listed in an external container
          this.$chaptersDiv.find('ul').find('li').removeClass('able-current-chapter').attr('aria-selected', '');
          this.$chaptersDiv.find('ul').find('li').eq(thisChapterIndex)
            .addClass('able-current-chapter').attr('aria-selected', 'true');
        }
      }
    }
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.getChapterDuration = function() {

    // Called if this.seekbarScope === 'chapter'
    // get duration of the current chapter

    var videoDuration, lastChapterIndex, chapterEnd;

    if (typeof this.currentChapter === 'undefined') {
      return 0;
    }
    videoDuration = this.getDuration();
    lastChapterIndex = this.selectedChapters.cues.length - 1;

    if (this.selectedChapters.cues[lastChapterIndex] == this.currentChapter) {
      // This is the last chapter
      if (this.currentChapter.end !== videoDuration) {
        // Chapter ends before or after video ends, adjust chapter end to match video end
        chapterEnd = videoDuration;
        this.currentChapter.end = videoDuration;
      } else {
        chapterEnd = this.currentChapter.end;
      }
    } else { // This is not the last chapter
      chapterEnd = this.currentChapter.end;
    }
    return chapterEnd - this.currentChapter.start;
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.getChapterElapsed = function() {

    // Called if this.seekbarScope === 'chapter'
    // get current elapsed time, relative to the current chapter duration
    if (typeof this.currentChapter === 'undefined') {
      return 0;
    }
    // eslint-disable-next-line no-unused-vars
    var videoDuration = this.getDuration();
    var videoElapsed = this.getElapsed();
    if (videoElapsed > this.currentChapter.start) {
      return videoElapsed - this.currentChapter.start;
    } else {
      return 0;
    }
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.convertChapterTimeToVideoTime = function(chapterTime) {

    // ChapterTime is the time within the current chapter
    // return the same time, relative to the entire video
    if (typeof this.currentChapter !== 'undefined') {
      var newTime = this.currentChapter.start + chapterTime;
      if (newTime > this.currentChapter.end) {
        return this.currentChapter.end;
      } else {
        return newTime;
      }
    } else {
      return chapterTime;
    }
  };

// eslint-disable-next-line no-undef
})(jQuery);
