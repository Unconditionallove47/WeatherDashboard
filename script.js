var city = "";
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var currentCity = $("#current-city");
var currentHumidty = $("#humidity");
var currentUvindex = $("#uv-index");
var currentTemperature = $("#temperature");
var currentWSpeed = $("#wind-speed");
var searchCity = [];

function find(c) {
  for (var i = 0; i < searchCity.length; i++) {
    if (c.toUpperCase() === searchCity[i]) {
      return -1;
    }
  }
  return 1;
}
//API KEY FROM ACCOUNT
var APIKey = "9e5dd807f3747fa829bc189ad78e918a";

function displayWeather(event) {
  event.preventDefault();
  if (searchCity.val().trim() !== "") {
    city = searchCity.val().trim();
    currentWeather(city);
  }
}
function currentWeather(city) {
  // Takes server side data
  var queryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&APPID=" +
    APIKey;
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    console.log(response);
    var weathericon = response.weather[0].icon;

    var iconurl =
      "https://openweathermap.org/img/wn/" + weathericon + "@2x.png";

    var date = new Date(response.dt * 1000).toLocaleDateString();

    $(currentCity).html(
      response.name + "(" + date + ")" + "<img src=" + iconurl + ">"
    );

    var tempF = (response.main.temp - 273.15) * 1.8 + 32;
    $(currentTemperature).html(tempF.toFixed(2) + "&#8457");
    //HUM display
    $(currentHumidty).html(response.main.humidity + "%");
    //WIND
    var ws = response.wind.speed;
    var windsmph = (ws * 2.237).toFixed(1);
    $(currentWSpeed).html(windsmph + "MPH");
    // UV
    UVIndex(response.coord.lon, response.coord.lat);
    forecast(response.id);
    if (response.cod == 200) {
      searchCity = JSON.parse(localStorage.getItem("cityname"));
      console.log(searchCity);
      if (searchCity == null) {
        searchCity = [];
        searchCity.push(city.toUpperCase());
        localStorage.setItem("cityname", JSON.stringify(searchCity));
        addToList(city);
      } else {
        if (find(city) > 0) {
          searchCity.push(city.toUpperCase());
          localStorage.setItem("cityname", JSON.stringify(searchCity));
          addToList(city);
        }
      }
    }
  });
}
// UV WORKING PROPERLY
function UVIndex(ln, lt) {
  var uvqURL =
    "https://api.openweathermap.org/data/2.5/uvi?appid=" +
    APIKey +
    "&lat=" +
    lt +
    "&lon=" +
    ln;
  $.ajax({
    url: uvqURL,
    method: "GET",
  }).then(function (response) {
    $(currentUvindex).html(response.value);
  });
}

// 5 day forecast
function forecast(cityid) {
  var queryforcastURL =
    "https://api.openweathermap.org/data/2.5/forecast?id=" +
    cityid +
    "&appid=" +
    APIKey;
  $.ajax({
    url: queryforcastURL,
    method: "GET",
  }).then(function (response) {
    for (i = 0; i < 5; i++) {
      var date = new Date(
        response.list[(i + 1) * 8 - 1].dt * 1000
      ).toLocaleDateString();
      var iconcode = response.list[(i + 1) * 8 - 1].weather[0].icon;
      var iconurl = "https://openweathermap.org/img/wn/" + iconcode + ".png";
      var tempc = response.list[(i + 1) * 8 - 1].main.temp;
      var tempF = ((tempc - 273.5) * 1.8 + 32).toFixed(2);
      var humidity = response.list[(i + 1) * 8 - 1].main.humidity;

      $("#F" + i).html(date);
      $("#FDPIC" + i).html("<img src=" + iconurl + ">");
      $("#FDTemp" + i).html(tempF + "&#8457");
      $("#FDHumidity" + i).html(humidity + "%");
    }
  });
}
//MAKE SURE IS WORKING PROPERLY
function addToList(c) {
  var listEl = $("<li>" + c.toUpperCase() + "</li>");
  $(listEl).attr("class", "list-group-item");
  $(listEl).attr("data-value", c.toUpperCase());
  $(".list-group").append(listEl);
}

function invokePastSearch(event) {
  var liEl = event.target;
  if (event.target.matches("li")) {
    city = liEl.textContent.trim();
    currentWeather(city);
  }
}
//LS LOADING
function loadlastCity() {
  $("ul").empty();
  var searchCity = JSON.parse(localStorage.getItem("cityname"));
  if (searchCity !== null) {
    searchCity = JSON.parse(localStorage.getItem("cityname"));
    for (i = 0; i < searchCity.length; i++) {
      addToList(searchCity[i]);
    }
    city = searchCity[i - 1];
    currentWeather(city);
  }
}
//FUNCTIONING PERFECT NOW
$("#search-button").on("click", displayWeather);
$(document).on("click", invokePastSearch);
$(window).on("load", loadlastCity);
