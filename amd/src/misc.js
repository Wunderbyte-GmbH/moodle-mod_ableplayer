(function($) {

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.getNextHeadingLevel = function($element) {

    // Finds the nearest heading in the ancestor tree
    // Loops over each parent of the current element until a heading is found
    // If multiple headings are found beneath a given parent, get the closest
    // Returns an integer (1-6) representing the next available heading level

    var $parents, $foundHeadings, numHeadings, headingType, headingNumber;

    $parents = $element.parents();
    // eslint-disable-next-line consistent-return
    $parents.each(function() {
      $foundHeadings = $(this).children(':header');
      numHeadings = $foundHeadings.length;
      if (numHeadings) {
        headingType = $foundHeadings.eq(numHeadings - 1).prop('tagName');
        return false;
      }
    });
    if (typeof headingType === 'undefined') {
      // Page has no headings
      headingNumber = 1;
    } else {
      // Increment closest heading by one if less than 6.
      headingNumber = parseInt(headingType[1]);
      headingNumber += 1;
      if (headingNumber > 6) {
        headingNumber = 6;
      }
    }
    return headingNumber;
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.countProperties = function(obj) {
    // Returns the number of properties in an object
    var count, prop;
    count = 0;
    for (prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        ++count;
      }
    }
    return count;
  };

  // Takes seconds and converts to string of form hh:mm:ss
  // eslint-disable-next-line no-undef
  AblePlayer.prototype.formatSecondsAsColonTime = function(seconds) {

    var dHours = Math.floor(seconds / 3600);
    var dMinutes = Math.floor(seconds / 60) % 60;
    var dSeconds = Math.floor(seconds % 60);
    if (dSeconds < 10) {
      dSeconds = '0' + dSeconds;
    }
    if (dHours > 0) {
      if (dMinutes < 10) {
        dMinutes = '0' + dMinutes;
      }
      return dHours + ':' + dMinutes + ':' + dSeconds;
    } else {
      return dMinutes + ':' + dSeconds;
    }
  };

  // eslint-disable-next-line no-undef
  AblePlayer.prototype.capitalizeFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

// eslint-disable-next-line no-undef
})(jQuery);
