/*
 * Title: Twitch.tv JSON API v1.2 (for freeCodeCamp), July 2017
 * Author: Boško Rabrenović
 * https://github.com/boniverski/twitch-tv
 * Description: Twitch.tv App monitors the state of selected Twitch users and filters their profiles based on the stream status.
 
 *   v1.2 July 14, 2017
 * > Fixed '404' status info
 *
 *   v1.1 July 8, 2017
 * > Added ES6 syntax instead of vanilla string concatenation
 * > Added user's profile link to avatars
 */

// Twitch users
var users = ["MedryBW", "ESL_SC2", "OgamingSC2", "cretetion", "freecodecamp", "storbeck", "habathcx", "RobotCaleb", "noobs2ninjas", "batmaaan"];

// Running code on ready state
$(document).ready(function() {

  // Iterating through "users" array
  users.forEach(function getUsers(channel){
    function makeURL(type, name) {
      return 'https://wind-bow.gomix.me/twitch-api/' + type + '/' + name + '?callback=?';
    };

    // Checking for user's stream status
    $.getJSON(makeURL("streams", channel), function(data) {

      var streamInfo, 
          status,
          defaultAvatar = 'https://raw.githubusercontent.com/boniverski/twitch-tv/master/image/twitch-icon.png'; //If there's no user's avatar

      if (data.stream === null) {
        streamInfo = "";
        status = "offline"
      } else {
        streamInfo = data.stream.game;
        status = "online"
      };

      // Fetching JSON data and setting up variables
      $.getJSON(makeURL("channels", channel), function(data) {
        
        
        var avatar = data.logo != null ? data.logo : defaultAvatar,
            user = data.display_name != null ? data.display_name : channel,
            game = streamInfo ? " " + data.status : "",
            url = data.url,
            searchQuery = user.toLowerCase();
        
        //Check if user exist
        if (data.error) {
          game = "This user does not exit or the account is closed.";
          status = "offline";
        }
        
        // Setting online/fffline indicator in user's card
        var statusIndicator, addClass;
            if (status === "online") {
              statusIndicator = '<span class="user__availability user__availability--on" title="Online"></span>';
              addClass = 'online';
            } else {
              statusIndicator = '<span class="user__availability user__availability--off" title="Offline"></span>';
              addClass = 'offline';
            }

        // Displays user's card in results
        var html = `<div class="user ${addClass}" data-filter-item data-filter-name="${searchQuery}"><a href="${url}" target="_blank"><img class="user__avatar" src="${avatar}"></a><div class="user__card"><a href="${url}" target="_blank"><h4 class="user--name">${user}</h4></a><p class="user--stream-info">${game}</p></div>${statusIndicator}</div>`;
        $(html).hide().appendTo(".main").fadeIn(300);
        $(".load-bar").hide(300); // Hiding loading bar when data is ready
        $(".availability__btn--all").addClass("active-all-btn"); //Active "All" button
        
        // Setting up search bar
        $("[data-search]").on("keyup", function() {
        	var searchVal = $(this).val().toLowerCase();
        	var filterItems = $("[data-filter-item]");
        	if (searchVal != "") {
        		filterItems.addClass("hidden");
        		$(`[data-filter-item][data-filter-name*="${searchVal}"]`).removeClass("hidden");
        	} else {
        		filterItems.removeClass("hidden");
        	}
        });
      });
    });
  })

  //Filtering users based on stream status
  $(".availability__btn").click(function() {
    var status = $(this).attr('id');
    if (status === "all") {
      $(".online, .offline").removeClass("hidden");
      $(".availability__btn--all").addClass("active-all-btn");
      $(".availability__btn--on").removeClass("active-on-btn");
      $(".availability__btn--off").removeClass("active-off-btn");
    } else if (status === "on") {
      $(".online").removeClass("hidden");
      $(".offline").addClass("hidden");
      $(".availability__btn--on").addClass("active-on-btn");
      $(".availability__btn--off").removeClass("active-off-btn");
      $(".availability__btn--all").removeClass("active-all-btn");
    } else {
      $(".offline").removeClass("hidden");
      $(".online").addClass("hidden");
      $(".availability__btn--off").addClass("active-off-btn");
      $(".availability__btn--on").removeClass("active-on-btn");
      $(".availability__btn--all").removeClass("active-all-btn");
    }
  })
});