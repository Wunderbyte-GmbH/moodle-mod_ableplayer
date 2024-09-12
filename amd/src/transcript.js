/* eslint-disable complexity, block-scoped-var */
(function($) {

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.injectTranscriptArea = function() {
    this.$transcriptArea = $('<div>', {
      'class': 'able-transcript-area',
      'tabindex': '-1'
    });

    this.$transcriptToolbar = $('<div>', {
      'class': 'able-window-toolbar able-' + this.toolbarIconColor + '-controls'
    });

    this.$transcriptDiv = $('<div>', {
      'class': 'able-transcript'
    });

    // Transcript toolbar content:
    this.$autoScrollTranscriptCheckbox = $('<input id="autoscroll-transcript-checkbox" type="checkbox">');
    this.$transcriptToolbar.append($('<label for="autoscroll-transcript-checkbox">' +
      this.tt.autoScroll + ': </label>'), this.$autoScrollTranscriptCheckbox);

    // Add field for selecting a transcript language
    // This will be deleted in initialize.js > recreatePlayer() if there are no languages
    this.$transcriptLanguageSelect = $('<select id="transcript-language-select">');
    // Add a default "Unknown" option; this will be deleted later if there are any
    // elements with a language.
    this.$unknownTranscriptOption = $('<option val="unknown">' + this.tt.unknown + '</option>');
    this.$transcriptLanguageSelect.append(this.$unknownTranscriptOption);
    this.$transcriptLanguageSelect.prop('disabled', true);

    var languageSelectWrapper = $('<div class="transcript-language-select-wrapper">');
    this.$transcriptLanguageSelectContainer = languageSelectWrapper;

    languageSelectWrapper.append($('<label for="transcript-language-select">' +
      this.tt.language + ': </label>'), this.$transcriptLanguageSelect);
    this.$transcriptToolbar.append(languageSelectWrapper);

    this.$transcriptArea.append(this.$transcriptToolbar, this.$transcriptDiv);

    // If client has provided separate transcript location, put it there.
    // Otherwise append it to the body
    if (this.transcriptDivLocation) {
      $('#' + this.transcriptDivLocation).append(this.$transcriptArea);
    } else {
      this.$ableWrapper.append(this.$transcriptArea);
    }

    // Make it draggable (popup only; NOT external transcript)
    if (!this.transcriptDivLocation) {
      this.initDragDrop('transcript');
      if (this.prefTranscript === 1) {
        // Transcript is on. Go ahead and position it
        this.positionDraggableWindow('transcript', this.getDefaultWidth('transcript'));
      }
    }

    // If client has provided separate transcript location, override user's preference for hiding transcript
    if (!this.prefTranscript && !this.transcriptDivLocation) {
      this.$transcriptArea.hide();
    }
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.addTranscriptAreaEvents = function() {

    var thisObj = this;

    this.$autoScrollTranscriptCheckbox.click(function() {
      thisObj.handleTranscriptLockToggle(thisObj.$autoScrollTranscriptCheckbox.prop('checked'));
    });

    // eslint-disable-next-line no-unused-vars
    this.$transcriptDiv.on('mousewheel DOMMouseScroll click scroll', function(event) {
      // Propagation is stopped in transcript click handler, so clicks are on the scrollbar
      // or outside of a clickable span.
      if (!thisObj.scrollingTranscript) {
        thisObj.autoScrollTranscript = false;
        thisObj.refreshControls();
      }
      thisObj.scrollingTranscript = false;
    });

    if (typeof this.$transcriptLanguageSelect !== 'undefined') {

      this.$transcriptLanguageSelect.on('click mousedown', function(event) {
        // Execute default behavior
        // prevent propagation of mouse event to toolbar or window
        event.stopPropagation();
      });

      this.$transcriptLanguageSelect.on('change', function() {

        var language = thisObj.$transcriptLanguageSelect.val();

        thisObj.syncTrackLanguages('transcript', language);
      });
    }
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.transcriptSrcHasRequiredParts = function() {

    // Check the external transcript to be sure it has all required components
    // return true or false
    // in the process, define all the needed variables and properties

    if ($('#' + this.transcriptSrc).length) {
      this.$transcriptArea = $('#' + this.transcriptSrc);
      if (this.$transcriptArea.find('.able-window-toolbar').length) {
        this.$transcriptToolbar = this.$transcriptArea.find('.able-window-toolbar').eq(0);
        if (this.$transcriptArea.find('.able-transcript').length) {
          this.$transcriptDiv = this.$transcriptArea.find('.able-transcript').eq(0);
          if (this.$transcriptArea.find('.able-transcript-seekpoint').length) {
            this.$transcriptSeekpoints = this.$transcriptArea.find('.able-transcript-seekpoint');
            return true;
          }
        }
      }
    }
    return false;
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.setupManualTranscript = function() {

    // Add an auto-scroll checkbox to the toolbar

    this.$autoScrollTranscriptCheckbox = $('<input id="autoscroll-transcript-checkbox" type="checkbox">');
    this.$transcriptToolbar.append($('<label for="autoscroll-transcript-checkbox">' +
      this.tt.autoScroll + ': </label>'), this.$autoScrollTranscriptCheckbox);

  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.updateTranscript = function() {

    if (!this.transcriptType) {
      return;
    }

    if (this.transcriptType === 'external' || this.transcriptType === 'popup') {

      var chapters, captions, descriptions;

      // Language of transcript might be different than language of captions
      // But both are in sync by default
      if (this.transcriptLang) {
        captions = this.transcriptCaptions.cues;
      } else {
        if (this.transcriptCaptions) {
          this.transcriptLang = this.transcriptCaptions.language;
          captions = this.transcriptCaptions.cues;
        } else if (this.selectedCaptions) {
          this.transcriptLang = this.captionLang;
          captions = this.selectedCaptions.cues;
        }
      }

      // Setup chapters
      if (this.transcriptChapters) {
        chapters = this.transcriptChapters.cues;
      } else if (this.chapters.length > 0) {
        // Try and match the caption language.
        if (this.transcriptLang) {
          for (var ii = 0; ii < this.chapters.length; ii++) {
            if (this.chapters[ii].language === this.transcriptLang) {
              chapters = this.chapters[ii].cues;
            }
          }
        }
        if (typeof chapters === 'undefined') {
          chapters = this.chapters[0].cues || [];
        }
      }

      // Setup descriptions
      if (this.transcriptDescriptions) {
        descriptions = this.transcriptDescriptions.cues;
      } else if (this.descriptions.length > 0) {
        // Try and match the caption language.
        if (this.transcriptLang) {
          for (var jj = 0; jj < this.descriptions.length; jj++) {
            if (this.descriptions[jj].language === this.transcriptLang) {
              descriptions = this.descriptions[jj].cues;
            }
          }
        }
        if (!descriptions) {
          descriptions = this.descriptions[0].cues || [];
        }
      }

      var div = this.generateTranscript(chapters || [], captions || [], descriptions || []);

      this.$transcriptDiv.html(div);
      // Reset transcript selected <option> to this.transcriptLang
      if (this.$transcriptLanguageSelect) {
        this.$transcriptLanguageSelect.find('option:selected').prop('selected', false);
        this.$transcriptLanguageSelect.find('option[lang=' + this.transcriptLang + ']').prop('selected', true);
      }
    }

    var thisObj = this;

    // Make transcript tabbable if preference is turned on.
    if (this.prefTabbable === 1) {
      $('.able-transcript span.able-transcript-seekpoint').attr('tabindex', '0');
    }

    // Handle clicks on text within transcript
    // Note: This event listeners handles clicks only, not keydown events
    // Pressing Enter on an element that is not natively clickable does NOT trigger click()
    // Keydown events are handled elsehwere, both globally (ableplayer-base.js) and locally (event.js)
    if (this.$transcriptArea.length > 0) {
      // eslint-disable-next-line no-unused-vars
      this.$transcriptArea.find('span.able-transcript-seekpoint').click(function(event) {
        thisObj.seekTrigger = 'transcript';
        var spanStart = parseFloat($(this).attr('data-start'));
        // Add a tiny amount so that we're inside the span.
        spanStart += 0.01;
        // Each click within the transcript triggers two click events (not sure why)
        // this.seekingFromTranscript is a stopgab to prevent two calls to SeekTo()
        if (!thisObj.seekingFromTranscript) {
          thisObj.seekingFromTranscript = true;
          thisObj.seekTo(spanStart);
        } else {
          // Don't seek a second time, but do reset var
          thisObj.seekingFromTranscript = false;
        }
      });
    }
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.highlightTranscript = function(currentTime) {

    // Show highlight in transcript marking current caption

    if (!this.transcriptType) {
      return;
    }

    var start, end;
    var thisObj = this;

    currentTime = parseFloat(currentTime);

    // Highlight the current transcript item.
    // eslint-disable-next-line consistent-return
    this.$transcriptArea.find('span.able-transcript-caption').each(function() {
      start = parseFloat($(this).attr('data-start'));
      end = parseFloat($(this).attr('data-end'));
      if (currentTime >= start && currentTime <= end) {
        // Move all previous highlights before adding one to current span
        thisObj.$transcriptArea.find('.able-highlight').removeClass('able-highlight');
        $(this).addClass('able-highlight');
        return false;
      }
    });
    thisObj.currentHighlight = $('.able-highlight');
    if (thisObj.currentHighlight.length === 0) {
      // Nothing highlighted.
      thisObj.currentHighlight = null;
    }
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.generateTranscript = function(chapters, captions, descriptions) {

    var thisObj = this;

    var $main = $('<div class="able-transcript-container"></div>');
    var transcriptTitle;

    // Set language for transcript container
    $main.attr('lang', this.transcriptLang);

    if (typeof this.transcriptTitle !== 'undefined') {
      transcriptTitle = this.transcriptTitle;
    } else if (this.lyricsMode) {
      transcriptTitle = this.tt.lyricsTitle;
    } else {
      transcriptTitle = this.tt.transcriptTitle;
    }

    if (typeof this.transcriptDivLocation === 'undefined') {
      // Only add an HTML heading to internal transcript
      // external transcript is expected to have its own heading
      var headingNumber = this.playerHeadingLevel;
      headingNumber += 1;
      var chapterHeadingNumber = headingNumber + 1;

      if (headingNumber <= 6) {
        var transcriptHeading = 'h' + headingNumber.toString();
      } else {
        // eslint-disable-next-line no-redeclare
        var transcriptHeading = 'div';
      }
      // Var transcriptHeadingTag = '<' + transcriptHeading + ' class="able-transcript-heading">';
      var $transcriptHeadingTag = $('<' + transcriptHeading + '>');
      $transcriptHeadingTag.addClass('able-transcript-heading');
      if (headingNumber > 6) {
        $transcriptHeadingTag.attr({
          'role': 'heading',
          'aria-level': headingNumber
        });
      }
      $transcriptHeadingTag.text(transcriptTitle);

      // Set language of transcript heading to language of player
      // this is independent of language of transcript
      $transcriptHeadingTag.attr('lang', this.lang);

      $main.append($transcriptHeadingTag);
    }

    var nextChapter = 0;
    var nextCap = 0;
    var nextDesc = 0;

    var addChapter = function(div, chap) {

      if (chapterHeadingNumber <= 6) {
        var chapterHeading = 'h' + chapterHeadingNumber.toString();
      } else {
        // eslint-disable-next-line no-redeclare
        var chapterHeading = 'div';
      }

      var $chapterHeadingTag = $('<' + chapterHeading + '>', {
        'class': 'able-transcript-chapter-heading'
      });
      if (chapterHeadingNumber > 6) {
        $chapterHeadingTag.attr({
          'role': 'heading',
          'aria-level': chapterHeadingNumber
        });
      }

      var flattenComponentForChapter = function(comp) {

        var result = [];
        if (comp.type === 'string') {
          result.push(comp.value);
        } else {
          for (var ii = 0; ii < comp.children.length; ii++) {
            result = result.concat(flattenComponentForChapter(comp.children[ii]));
          }
        }
        return result;
      };

      var $chapSpan = $('<span>', {
        'class': 'able-transcript-seekpoint'
      });
      for (var ii = 0; ii < chap.components.children.length; ii++) {
        var results = flattenComponentForChapter(chap.components.children[ii]);
        for (var jj = 0; jj < results.length; jj++) {
          $chapSpan.append(results[jj]);
        }
      }
      $chapSpan.attr('data-start', chap.start.toString());
      $chapSpan.attr('data-end', chap.end.toString());
      $chapterHeadingTag.append($chapSpan);

      div.append($chapterHeadingTag);
    };

    var addDescription = function(div, desc) {
      var $descDiv = $('<div>', {
        'class': 'able-transcript-desc'
      });
      var $descHiddenSpan = $('<span>', {
        'class': 'able-hidden'
      });
      $descHiddenSpan.attr('lang', thisObj.lang);
      $descHiddenSpan.text(thisObj.tt.prefHeadingDescription + ': ');
      $descDiv.append($descHiddenSpan);

      var flattenComponentForDescription = function(comp) {

        var result = [];
        if (comp.type === 'string') {
          result.push(comp.value);
        } else {
          for (var ii = 0; ii < comp.children.length; ii++) {
            result = result.concat(flattenComponentForDescription(comp.children[ii]));
          }
        }
        return result;
      };

      var $descSpan = $('<span>', {
        'class': 'able-transcript-seekpoint'
      });
      for (var ii = 0; ii < desc.components.children.length; ii++) {
        var results = flattenComponentForDescription(desc.components.children[ii]);
        for (var jj = 0; jj < results.length; jj++) {
          $descSpan.append(results[jj]);
        }
      }
      $descSpan.attr('data-start', desc.start.toString());
      $descSpan.attr('data-end', desc.end.toString());
      $descDiv.append($descSpan);

      div.append($descDiv);
    };

    var addCaption = function(div, cap) {

      var $capSpan = $('<span>', {
        'class': 'able-transcript-seekpoint able-transcript-caption'
      });

      var flattenComponentForCaption = function(comp) {

        var result = [];

        var flattenString = function(str) {
          var result = [];
          if (str === '') {
            return result;
          }
          var openBracket = str.indexOf('[');
          var closeBracket = str.indexOf(']');
          var openParen = str.indexOf('(');
          var closeParen = str.indexOf(')');

          var hasBrackets = openBracket !== -1 && closeBracket !== -1;
          var hasParens = openParen !== -1 && closeParen !== -1;

          if ((hasParens && hasBrackets && openBracket < openParen) || hasBrackets) {
            result = result.concat(flattenString(str.substring(0, openBracket)));
            var $silentSpan = $('<span>', {
              'class': 'able-unspoken'
            });
            $silentSpan.text(str.substring(openBracket, closeBracket + 1));
            result.push($silentSpan);
            result = result.concat(flattenString(str.substring(openParen, closeParen + 1)));
          } else if (hasParens) {
            result = result.concat(flattenString(str.substring(0, openParen)));
            // eslint-disable-next-line no-redeclare
            var $silentSpan = $('<span>', {
              'class': 'able-unspoken'
            });
            $silentSpan.text(str.substring(openBracket, closeBracket + 1));
            result.push($silentSpan);
            result = result.concat(flattenString(str.substring(closeParen + 1)));
          } else {
            result.push(str);
          }
          return result;
        };

        if (comp.type === 'string') {
          result = result.concat(flattenString(comp.value));
        } else if (comp.type === 'v') {
          var $vSpan = $('<span>', {
            'class': 'able-unspoken'
          });
          $vSpan.text('(' + comp.value + ')');
          result.push($vSpan);
          for (var ii = 0; ii < comp.children.length; ii++) {
            var subResults = flattenComponentForCaption(comp.children[ii]);
            for (var jj = 0; jj < subResults.length; jj++) {
              result.push(subResults[jj]);
            }
          }
        } else if (comp.type === 'b' || comp.type === 'i') {
          if (comp.type === 'b') {
            var $tag = $('<strong>');
          } else if (comp.type === 'i') {
            // eslint-disable-next-line no-redeclare
            var $tag = $('<em>');
          }
          for (var iii = 0; iii < comp.children.length; iii++) {
            var subResults2 = flattenComponentForCaption(comp.children[ii]);
            for (var jjj = 0; jjj < subResults2.length; jjj++) {
              $tag.append(subResults2[jjj]);
            }
          }
          if (comp.type === 'b' || comp.type == 'i') {
            result.push($tag, ' ');
          }
        } else {
          for (var iiii = 0; ii < comp.children.length; iiii++) {
            result = result.concat(flattenComponentForCaption(comp.children[iiii]));
          }
        }
        return result;
      };

      for (var ii = 0; ii < cap.components.children.length; ii++) {
        var results = flattenComponentForCaption(cap.components.children[ii]);
        for (var jj = 0; jj < results.length; jj++) {
          var result = results[jj];
          if (typeof result === 'string') {
            if (thisObj.lyricsMode) {
              // Add <br> BETWEEN each caption and WITHIN each caption (if payload includes "\n")
              result = result.replace('\n', '<br>') + '<br>';
            } else {
              // Just add a space between captions
              result += ' ';
            }
          }
          $capSpan.append(result);
        }
      }
      $capSpan.attr('data-start', cap.start.toString());
      $capSpan.attr('data-end', cap.end.toString());
      div.append($capSpan);
      div.append(' \n');
    };

    // Keep looping as long as any one of the three arrays has content
    while ((nextChapter < chapters.length) || (nextDesc < descriptions.length) || (nextCap < captions.length)) {
      var firstStart;
      if ((nextChapter < chapters.length) && (nextDesc < descriptions.length) && (nextCap < captions.length)) {
        // They all three have content
        firstStart = Math.min(chapters[nextChapter].start, descriptions[nextDesc].start, captions[nextCap].start);
      } else if ((nextChapter < chapters.length) && (nextDesc < descriptions.length)) {
        // Chapters & descriptions have content
        firstStart = Math.min(chapters[nextChapter].start, descriptions[nextDesc].start);
      } else if ((nextChapter < chapters.length) && (nextCap < captions.length)) {
        // Chapters & captions have content
        firstStart = Math.min(chapters[nextChapter].start, captions[nextCap].start);
      } else if ((nextDesc < descriptions.length) && (nextCap < captions.length)) {
        // Descriptions & captions have content
        firstStart = Math.min(descriptions[nextDesc].start, captions[nextCap].start);
      } else {
        firstStart = null;
      }
      if (firstStart !== null) {
        if (typeof chapters[nextChapter] !== 'undefined' && chapters[nextChapter].start === firstStart) {
          addChapter($main, chapters[nextChapter]);
          nextChapter += 1;
        } else if (typeof descriptions[nextDesc] !== 'undefined' && descriptions[nextDesc].start === firstStart) {
          addDescription($main, descriptions[nextDesc]);
          nextDesc += 1;
        } else {
          addCaption($main, captions[nextCap]);
          nextCap += 1;
        }
      } else {
        if (nextChapter < chapters.length) {
          addChapter($main, chapters[nextChapter]);
          nextChapter += 1;
        } else if (nextDesc < descriptions.length) {
          addDescription($main, descriptions[nextDesc]);
          nextDesc += 1;
        } else if (nextCap < captions.length) {
          addCaption($main, captions[nextCap]);
          nextCap += 1;
        }
      }
    }
    // Organize transcript into blocks using [] and () as starting points
    var $components = $main.children();
    var spanCount = 0;
    $components.each(function() {
      if ($(this).hasClass('able-transcript-caption')) {
        if ($(this).text().indexOf('[') !== -1 || $(this).text().indexOf('(') !== -1) {
          // This caption includes a bracket or parenth. Start a new block
          // close the previous block first
          if (spanCount > 0) {
            $main.find('.able-block-temp').removeClass('able-block-temp').wrapAll('<div class="able-transcript-block"></div>');
            spanCount = 0;
          }
        }
        $(this).addClass('able-block-temp');
        spanCount++;
      } else {
        // This is not a caption. Close the caption block
        if (spanCount > 0) {
          $main.find('.able-block-temp').removeClass('able-block-temp').wrapAll('<div class="able-transcript-block"></div>');
          spanCount = 0;
        }
      }
    });
    return $main;
  };

// eslint-disable-next-line no-undef
})(jQuery);
