// Main function.
function main() {
		$("#f").click(function() {
			if(!$("#f").hasClass("active")) {
				$("#f").addClass("active");
				$("#c").removeClass("active");
			}
		});
		
		$("#c").click(function() {
			if(!$("#c").hasClass("active")) {
				$("#c").addClass("active");
				$("#f").removeClass("active");
			}
		});
		
		$(".check").click(function() {
			if(document.getElementById('addr').value !== undefined) {
				$(".final").addClass("hidden");
				$(".initial").removeClass("hidden");
				geoCode(document.getElementById('addr').value);
			}
			else {
				alert("Please enter a location");
			}
		});
		$(".current").click(function() {
			geoLoc();
		})
		$(".current").mouseup(function() {
			$(this).blur();
		})
		geoLoc();
}

// This function uses W3C geolocation api to retrive client location.
function geoLoc() {
				if (!navigator.geolocation) {
						alert("Browser doesnt support geolocation. Use the text field to enter location");
						return;
				}

				function success(position) {
						uponObtGeoloc(position);
				}

				function error() {
						alert("Could not obtain your location. Please manually enter your location");
				}

				navigator.geolocation.getCurrentPosition(success, error, {
						maximumAge: 60000,
						timeout: 5000,
						enableHighAccuracy: true
				});
		}
		// This function will be called when the call to geolocation api results true.

function uponObtGeoloc(position) {
		getWeatherData(position.coords.latitude, position.coords.longitude);
		
		reverseGeoCode(position.coords.latitude, position.coords.longitude);
}

function getWeatherData(latitude, longitude) {
		var coods = latitude.toString() + "," + longitude.toString()+"?";
		var units;
		if($("#c").hasClass("active")) {
			units = "units=ca";
		}
		else if($("#f").hasClass("active")) {
			units = "units=us";
		}
		var forcastApiUrl = "https://api.forecast.io/forecast/2f100951a504a2130471e10dff1123de/" + coods + units;
		$.ajax({
				url: forcastApiUrl,
				dataType: "jsonp",
				success: function(data) {
					gotWeatherData(data);
				}
		});
}

function gotWeatherData(data) {
	console.log(data);
	if(data.currently.hasOwnProperty("summary")) {
		$(".sky").html(data.currently.summary);
	}
	else {
		$(".sky").html("-");
	}
	
	if(data.currently.hasOwnProperty("windSpeed")) {
		var speedUnit;
		if($("#c").hasClass("active")) {
			 speedUnit = "Kmph";
		}
		else {
			speedUnit = "Mph";
		}
		$(".windSpeed").html("Wind: " + (data.currently.windSpeed).toString() + " " +speedUnit);
	}
	else {
		$(".windSpeed").html("Wind: -");
	}
	
	if(data.currently.hasOwnProperty("humidity")) {
		$(".humidity").html("Humidity: "+(data.currently.humidity*100).toString()+"%");
	}
	else {
		$(".humidity").html("Humidity: -");
	}
	
	if(data.currently.hasOwnProperty("temperature")) {
		$(".currTemp").html((Math.round(data.currently.temperature)).toString() + "°");
	}
	else {
		$(".currTemp").html("-");
	}
	
	if(data.currently.hasOwnProperty("dewPoint")) {
		$(".dew").html("Dew Pt: " + (data.currently.dewPoint).toString() + "°");
	}
	else {
		$(".dew").html("Dew Pt: -");
	}
	
	if(data.currently.hasOwnProperty("pressure")) {
		$(".pressure").html("Pressure: " + (data.currently.pressure).toString() + "mBar");
	}
	else {
		$().html("Pressure: -");
	}
	
	if(data.currently.hasOwnProperty("icon")) {
		var skycons = new Skycons({"color": "orange"});
		skycons.set("skycons", data.currently.icon);
		skycons.play();
	}
	
	if(data.hasOwnProperty("minutely")) {
		$(".hour").html(data.minutely.summary);
	}
	else {
		$(".hourly").addClass("hidden");
	}
	
	if(data.hasOwnProperty("hourly")) {
		$(".day").html(data.hourly.summary);
	}
	else {
		$(".day").addClass("hidden");
	}
	
	if(data.hasOwnProperty("daily")) {
		$(".week").html(data.daily.summary);
	}
	else {
		$(".weekly").addClass("hidden");
	}
	
	$(".initial").addClass("hidden");
	$(".final").removeClass("hidden");
}


//reverse geocoding lat long to name and id of place.

function reverseGeoCode(lat, lng) {
	var revUrl = "http://api.geonames.org/findNearbyPlaceNameJSON?lat=" + lat.toString() + "&lng=" + lng.toString() + "&username=skmsoumya";
	
	$.ajax({
		url: revUrl,
		dataType: "jsonp",
		success: function(data) {
			document.getElementById('addr').value = data.geonames[0].toponymName + ", " + data.geonames[0].countryName;
		}
	});
}

// geocoding place names entered in the input bar.

function geoCode(place) {
	var address = place.replace(/[\s]/g, "%20"),
			geoUrl = "http://api.geonames.org/searchJSON?q=" + address + "&maxRows=1&username=skmsoumya&orderby=relevance";
	$.ajax({
		url: geoUrl,
		dataType: "jsonp",
		success: function(data) {
			if(data.geonames[0].length === 0) {
				alert("Sorry cannot recognise the place you have entered. Please enter the name of a bigger town or city nearby your place");
			}
			else {
				document.getElementById('addr').value = data.geonames[0].name + ", " + data.geonames[0].countryName;
				getWeatherData(data.geonames[0].lat, data.geonames[0].lng);
			}
		}
	});
	
}
$(document).ready(main());