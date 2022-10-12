var userFormEl = document.querySelector('#user-form');
var cityInputEl = document.querySelector('#city');
var weatherSearchCityEl = document.querySelector('#weather-search');


var formSubmitHandler = function (event) {
  event.preventDefault();

  var city = cityInputEl.value.trim();
  if (city) {
    var coordinates = getCoordinates(city)
    console.log(coordinates);
    coordinates.then(function (latlong) {
      getWeather(latlong).then(function (weatherJson) {
        getDailyForcasts(weatherJson);
      })
    })
    cityInputEl.value = '';
  } else {
    alert('Please enter a city name');
  }
};

var buttonClickHandler = function (event) {
  var city = document.getElementById('city').value;
  getCoordinates(city);
}


function getWeather(coordinates) {
  var requestUrl = 'http://api.openweathermap.org/data/2.5/forecast?lat=' + coordinates.lat + '&lon=' + coordinates.lon + '&appid=b6fcde7da7cee900d9a48b786dd97c9a&units=imperial';
  console.log(requestUrl);
  return fetch(requestUrl).then(function (response) {
    if (response.ok) {
      return response.json()
    } else {
      return null;
    }
  }).then(function (json) {
    console.log(json);
    return json;
  })
}


var getCoordinates = function (city) {
  var geocode = 'http://api.openweathermap.org/geo/1.0/direct?q=' + city + '&limit=1&appid=b6fcde7da7cee900d9a48b786dd97c9a';

  return fetch(geocode).then(function (response) {
    if (response.ok) {
      return response.json()
    } else {
      return null;
    }
  }).then(function (json) {
    if (json) {
      console.log(json);
      var latlong = {
        lat: json[0].lat,
        lon: json[0].lon,
      }
      return latlong;
    } else {
      return null;
    }
  })
}

function getDailyForcasts(weatherJson) {
  var allWeatherData = [];
  console.log(weatherJson);
  var filteredWeather = filterWeatherJson(weatherJson);
  console.log(filteredWeather);
  for (var i = 0; i < filteredWeather.length; i++) {
    var weatherData = {
      cityName: weatherJson.city.name,
      date: filteredWeather[i].dt_txt,
      temp: filteredWeather[i].main.temp,
      wind: filteredWeather[i].wind.speed,
      humidity: filteredWeather[i].main.humidity,
      icon: filteredWeather[i].weather[0].icon,
    }
    allWeatherData.push(weatherData);
  }
  
  console.log(allWeatherData);
  let forecast = {
    cityName: weatherJson.city.name,
    forecast: allWeatherData
  };

  storeWeather(forecast);
  displayForecast(forecast);
  displayRecentSearches();
}

function displayForecast(weatherData) {
  let allWeatherData = weatherData.forecast;
  populateTodayForecast(allWeatherData[0]);
  document.getElementById("forecast").innerHTML = "";
  populateForecast(allWeatherData[1]);
  populateForecast(allWeatherData[2]);
  populateForecast(allWeatherData[3]);
  populateForecast(allWeatherData[4]);
  populateForecast(allWeatherData[5]);
}

function displayRecentSearches() {
  document.getElementById("recent-searches").innerHTML = "";
  
  let recentSearches = getStoredWeather();

  recentSearches.forEach(element => {
    let cityName = document.createElement("button");
    cityName.textContent = element.cityName;
    cityName.setAttribute("class", "my-2");
    cityName.addEventListener("click", function(){
      displayForecast(element);
    });
    document.getElementById("recent-searches").appendChild(cityName);
  });
}

function populateTodayForecast(weatherData){
  let container = document.getElementById("today-container");
  container.innerHTML = "";
  container.setAttribute("class", "d-flex flex-column border border-dark");

  var card = document.createElement("div");
  card.setAttribute("class", "d-flex flex-row align-items-center");
  var cityName = document.createElement("h4");
  cityName.textContent = weatherData.cityName + " " + "(" + formatDate(weatherData.date) + ")";
  card.appendChild(cityName);
  var icon = document.createElement("img");
  icon.src = "http://openweathermap.org/img/wn/" + weatherData.icon +"@2x.png";
  icon.height = 40;
  card.appendChild(icon);
  container.appendChild(card);

  var subcontent = document.createElement("div");
  subcontent.setAttribute("class", "d-flex list-group pl-1");
  var temp = document.createElement("p");
  temp.textContent = weatherData.temp + "°F";
  subcontent.appendChild(temp);
  var wind = document.createElement("p");
  wind.textContent = "Wind: " + weatherData.wind; + " MPH";
  subcontent.appendChild(wind);
  var humidity = document.createElement("p");
  humidity.textContent = "Humidity: " + weatherData.humidity + "%";
  subcontent.appendChild(humidity);
  container.appendChild(subcontent);
}

function populateForecast(weatherData){
  var card = document.createElement("div");
  card.setAttribute("class", "card bg-dark text-light p-2 m-2")
  var date = document.createElement("h5");
  date.textContent = formatDate(weatherData.date);
  card.appendChild(date);
  var icon = document.createElement("img");
  icon.src = "http://openweathermap.org/img/wn/" + weatherData.icon +"@2x.png";
  icon.height = 50;
  icon.width = 50;
  card.appendChild(icon);
  var temp = document.createElement("p");
  temp.textContent = weatherData.temp + "°F";
  card.appendChild(temp);
  var wind = document.createElement("p");
  wind.textContent = "Wind: " + weatherData.wind; + " MPH";
  card.appendChild(wind);
  var humidity = document.createElement("p");
  humidity.textContent = "Humidity: " + weatherData.humidity + "%";
  card.appendChild(humidity);
  document.getElementById("forecast").appendChild(card);
}



function formatDate(stringDate){
  return new Date(stringDate).toLocaleDateString("en-US")
}

function filterWeatherJson(weatherJson) {
  let dates = weatherJson.list.map(function (forecast) {
    return forecast.dt_txt;
  });
  console.log("filterWeatherJson: dates=" + dates);
  let noonDates = filterDates(dates);
  console.log("filterWeatherJson: noonDates=" + noonDates);
  return noonDates.map(function(date) {
    return weatherJson.list.find(function(forecast) {
      return new Date(forecast.dt_txt).getDate() === new Date(date).getDate();
    });
  });
}

function filterDates(dates) {
  var todayDate = dates[0];
  console.log("filterDates: todayDate=" + todayDate);
  var filteredDates = dates.filter(function (stringDate) {
    let date = new Date(stringDate);
    let today = new Date();
    return date.getHours() === 12 &&
      date.getDate() !== today.getDate();
  });
  console.log("filterDates: filteredDates=" + filteredDates);

  filteredDates.unshift(todayDate);
  console.log("filterDates: filteredDates=" + filteredDates);

  return filteredDates;
}

function storeWeather(weatherData){
    var storedWeather = getStoredWeather();
    storedWeather = storedWeather.filter(function(data) {
      return data.cityName !== weatherData.cityName;
    });
    storedWeather.unshift(weatherData);
    var json=JSON.stringify(storedWeather);
    localStorage.setItem("savedWeatherData", json);
}

function getStoredWeather(){
  var data = localStorage.getItem("savedWeatherData");
  var parsedData = JSON.parse(data);
  if (parsedData === null) {
      parsedData = [];
  }
  return parsedData.slice(0,5);
}

userFormEl.addEventListener('submit', formSubmitHandler);
displayRecentSearches();
//getCoordinates