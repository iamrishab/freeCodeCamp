$(document).ready(function() {
  /* Method 1, autocomplete :D, search D:
   * Basically your hello world of wikipedia searches :P
   * Url: https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=search+term
   * Response: [search term, [10 items], [desc for each item], [link for each item]]
   */
  
  /* Method 2, autocomplete D:, search :D
   * It took some fiddling but I got something that works the same way as the example...
   * Thanks for stack overflow peoples
   * http://stackoverflow.com/questions/8555320/is-there-a-clean-wikipedia-api-just-for-retrieve-content-summary
   * http://stackoverflow.com/questions/9846795/prop-extracts-not-returning-all-extracts-in-the-wikimedia-api
   * Url: https://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&prop=extracts&exlimit=max&explaintext&exintro&exsentences=1&gsrsearch=search+term
   * Response: {query: {pages: {'id': {pageid: 'id', title: 'page title', extract: 'Line from page'}}}}
   */
  
  // For displaying...
  var $search = $('#search'),
      $search_input = $search.find('#search-input'),
      $search_clear = $search.find('#search-clear'),
      $search_auto = $search.find('#search-complete'),
      $success = $('#success'),
      $failed = $('#failed');
  // Handlebars for templates :D
  var auto_source = $search_auto.find('#complete-template').html(),
      res_source = $success.find('#result-template').html();
  var auto_template = Handlebars.compile(auto_source),
      res_template = Handlebars.compile(res_source);
  
  // Hide both things...
  function hideResult() {
    $success.css('display', 'none');
    $failed.css('display', 'none');
  }
  
  // Load the search results
  var lastSearch = "";
  function loadShowResults(search_term) {
    // Don't waste time searching for what you already have...
    if(typeof search_term === 'undefined' || lastSearch === search_term.toLowerCase()) {
      return;
    }
    lastSearch = search_term.toLowerCase();
    // Hide both to wait for request to load
    hideResult();
    // Don't waste time searching for nothing...
    if(search_term.length === 0) {
      return;
    }
    $.getJSON('https://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&prop=extracts&exlimit=max&explaintext&exintro&exsentences=1&gsrsearch=' + encodeURIComponent(search_term) + '&callback=?', function(data) {
      // Compile results
      var results = [];
      if(data.query && data.query.pages) {
        // Make sure it doesn't scream about query.pages not existing...
        for(var pid in data.query.pages) {
          var page = data.query.pages[pid];
          results.push({id: page.pageid, title: page.title, desc: page.extract})
        }
      }
      // Display, using handlebars
      var info = {results: results};
      $success.html(res_template(info));
      $success.css('display', 'block');
    }).fail(function() {
      // Show the error div when it fails
      $failed.css('display', 'block');
    });
  }
  
  // Render out autocomplete results
  var lastAuto = "";
  var lastAutos = [];
  var autoPos = 0, autoResults;
  function setAuto(arr, over) {
    // Safety for event listeners, kinda :P
    $('.auto-result').off('click', autoClick);
    if(arr && arr.length > 0) {
      // Make sure it's a valid query...
      var loc = lastAutos.lastIndexOf(arr[0]);
      if(loc >= 0 || over) {
        // Autocomplete request might come out of order, take the most recent only
        lastAutos.splice(loc, 1);
        autoPos = 0; // Reset the up and down arrow highlighting
        autoResults = arr;
        // Don't show the original query in the options, but keep it there for up and down scrolling
        var info = {results: arr.slice(1)};
        // More handlebars templating
        $search_auto.html(auto_template(info));
      }
      // Add back the event listeners
      $('.auto-result').on('click', autoClick);
    } else {
      // Hide the results list, invalid query
      $search_auto.html('');
    }
  }
  /*
   * Start with a blank search, just for it to not look weird and
   *   actually say "no suggestions" on your first autocomplete.
   *   Instead of a white line thing...
   */
  setAuto([''], true);
  // Up and down autocomplete selecting :D so fancy
  function updateAutoScroll() {
    // Only allow it if you have results, of course
    if(autoResults) {
      // Get the new result (position error checking when hitting up and down)
      var new_auto = autoResults[autoPos];
      lastAuto = new_auto; // Make sure hitting left or right won't screw it up
      $search_input.val(new_auto); // Set it in the search bar
      $search_auto.find('.auto-result').each(function(i) {
        // Make sure only the proper line is selected
        var $el = $(this);
        if(autoPos === i + 1) { // Since the real index 0 is your original query
          $el.addClass('selected');
        } else {
          $el.removeClass('selected');
        }
      });
    }
  }
  
  // Requesting autocomplete options
  function loadAuto(search_term) {
    // Don't keep doing it for the same query
    if(lastAuto === search_term) {
      return;
    }
    lastAuto = search_term;
    lastAutos.push(search_term);
    // Don't bother requesting for a blank term
    if(search_term.length === 0) {
      setAuto([''], true);
      return;
    }
    $.getJSON('https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=' + encodeURIComponent(search_term) + '&callback=?', function(data) {
      // Compile results
      var results = [search_term];
      for(var i = 0; i < data[1].length; i++) { // Set method 1 descript at top
        results.push(data[1][i]);
      }
      setAuto(results);
    }).fail(function() {
      // Something happened? Just clear it...
      setAuto();
    });
  }
  
  // Searching, kinda self-explanatory
  function searched() {
    var input = $search_input.val().replace(/\s+/g, ' ');
    if(input.length > 0) {
      loadShowResults(input);
    } else {
      hideResult();
    }
  }
  
  // Auto complete :D
  var auto_visible = false;
  function showAuto(term) {
    // Get the input, but don't do it twice if provided
    var search_term = term;
    if(typeof term !== 'string') {
      search_term = $search_input.val().replace(/\s+/g, ' ');
    }
    // Request autocomplete
    loadAuto(search_term);
    // Only show the auto when there is something to show
    // And it's not already visible of course
    if(auto_visible === false && search_term.length > 0) {
      $search.addClass('auto');
      auto_visible = true;
    }
  }
  function hideAuto() {
    // Self-explanatory
    if(auto_visible === true) {
      $search.removeClass('auto');
      auto_visible = false;
    }
  }
  function autoClick() { // When an autocomplate item is clicked
    // This is only for the "no suggestions" thing since it appears where the autocomplete items are
    if($(this).data('invalid') === true) {
      return;
    }
    // Get the text and use it as the search
    var search_term = $(this).text();
    $search_input.val(search_term);
    loadShowResults(search_term);
    hideAuto();
  }
  var lastInput = "";
  // Update the autocomplete
  function searchUpdated() {
    var search_term = $search_input.val().replace(/\s+/g, ' ');
    // Don't repeat queries for autocomplete
    // Or when using left and right after up and down in through the options...
    if(lastInput === search_term) {
      return;
    }
    lastInput = search_term;
    // Only request if valid
    if(search_term.length > 0) {
      showAuto(search_term);
    } else {
      // Hide otherwise
      showAuto('');
      hideAuto();
    }
  }
  function searchPressed(e) {
    switch(e.which) {
      case 13: { // Enter key, search and hide suggestions
        searched();
        hideAuto();
      } break;
      case 38: { // Up arrow
        // Scroll up to next option... (--)
        if(autoPos <= 0) {
          autoPos = autoResults.length;
        }
        autoPos--;
        updateAutoScroll();
        // Dpn't got right or left in text box (single lines do that)
        e.preventDefault();
      } break;
      case 40: { // Down arrow
        // Scroll down (++)
        autoPos++;
        if(autoPos >= autoResults.length) {
          autoPos = 0;
        }
        updateAutoScroll();
        // Again, no right or left movement
        e.preventDefault();
      } break;
      // Update the suggestions as normal, not a special key
      default: searchUpdated(); break;
    }
  }
  $search_input.on('keyup', searchPressed);
  $search_input.on('focus', showAuto);
  $search_input.on('blur', hideAuto);
  $search.on('focusin', showAuto); // Just so when you hit an autocomplete it registers :P
  
  // Clear search when clicking the X
  function clear() {
    $search_input.val('');
    hideResult(); // Also hide the search
    hideAuto(); // As well as the suggestions
  }
  $search_clear.on('click', clear);
});