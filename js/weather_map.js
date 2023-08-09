(function () {
    "use strict";
// change video
    function backgroundVideo(tempID){
        if (tempID < 298) {
            $('#background-video').attr('src','images/thunder.mp4');
        } else if (tempID > 299 && tempID < 598) {
            $('#background-video').attr('src','images/rain.mp4');
        } else if (tempID > 599 && tempID < 698) {
            $('#background-video').attr('src','images/snow.mp4');
        } else if (tempID > 699 && tempID < 799) {
            $('#background-video').attr('src','images/atmosphere.mp4');
        } else if (tempID > 800 && tempID < 805) {
            $('#background-video').attr('src','images/clouds.mp4');
        } else if (tempID === 800) {
            $('#background-video').attr('src','images/clear.mp4');
        } else {
            $('#background-video').attr('');
        }
    }

// current weather
    function currentWeather(lng, lat) {
        $.get("https://api.openweathermap.org/data/2.5/weather", {
            APPID: OPEN_WEATHER_APPID,
            lat: lat,
            lon: lng,
            units: "imperial"
        }).done(function (weather) {
            console.log(weather);
            $('#current-city').html(`${weather.name}`);
            $('#current-temp').html(`Current Temperature: ${weather.main.temp.toString().slice(0, 2)}°F`);
            $('#current-icon').html(`<img src="http://openweathermap.org/img/w/${weather.weather[0].icon}.png">`);
            $('#current-weather').html(`${weather.weather[0].description}`);
            $('#current-humidity').html(`Humidity: ${weather.main.humidity}%`);
            $('#current-wind').html(`Wind: ${weather.wind.speed} mph`);
            $('#current-pressure').html(`Pressure: ${weather.main.pressure} hPa`);

            var tempID = weather.weather[0].id;
            console.log(tempID);
            backgroundVideo(tempID);
        });
    }

//5 day forecast
    function forecastDay(day) {
        var html = `<div class="card">`;
        html += `<div class="card-header">${day.dt_txt.slice(0, 10)}</div>`;
        html += `<div class="card-body">`;
        html += `<p class="card-title fw-bold">${day.main.temp_min.toString().slice(0, 2)}°F / ${day.main.temp_max.toString().slice(0, 2)}°F</p>`;
        html += `<img src="http://openweathermap.org/img/w/${day.weather[0].icon}.png">`;
        html += `<p class="card-text fw-bold">${day.weather[0].description}</p>`;
        html += `<p class="card-text">Humidity: ${day.main.humidity}%</p>`;
        html += `<p class="card-text">Wind: ${day.wind.speed} mph</p>`;
        html += `<p class="card-text">Pressure: ${day.main.pressure} hPa</p>`;
        html += `</div>`;
        html += `</div>`;
        return html;
    }

    function forecastDays(days) {
        var html = '';
        for (var i = 0; i < days.length; i += 8) {
            // console.log(days[i]);
            html += forecastDay(days[i]);
        }
        return html;
    }

    function forecastWeather(lng, lat) {
        $.get("http://api.openweathermap.org/data/2.5/forecast", {
            APPID: OPEN_WEATHER_APPID,
            lat: lat,
            lon: lng,
            units: "imperial"
        }).done(function (weather) {
            // console.log(weather);
            // console.log(weather.list);
            $('#forecast-cards').html(forecastDays(weather.list));
        })
    }

    function callWeather(lng, lat) {
        currentWeather(lng, lat);
        forecastWeather(lng, lat);
    }

// mapbox
    mapboxgl.accessToken = MAPBOX_KEY;
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v12', // style URL
        center: [-106.48, 31.76], // starting position [lng, lat]
        zoom: 15, // starting zoom
    });

// draggable marker
    const marker = new mapboxgl.Marker({
        draggable: true
    })

    function onDragEnd() {
        const lngLat = marker.getLngLat();
        callWeather(lngLat.lng, lngLat.lat);
        map.flyTo({
            center: lngLat,
            zoom: 15,
            essential: true
        })
    }

    marker.on('dragend', onDragEnd);

// click marker
    function setMarker(cords) {
        marker.setLngLat(cords)
        marker.addTo(map);
        map.flyTo({
            center: cords,
            zoom: 15,
            essential: true
        })
    }

    map.on('click', function (event) {
        var clickInfo = {
            lng: event.lngLat.lng,
            lat: event.lngLat.lat
        }
        callWeather(clickInfo.lng, clickInfo.lat);
        setMarker(clickInfo);
    });

// search box
    var geocoder = new MapboxGeocoder({
        accessToken: MAPBOX_KEY,
        placeholder: "El Paso, TX",
        mapboxgl: mapboxgl
    })
    // map.addControl(geocoder); //adds input box to map
    geocoder.addTo('#geocoder-container');

    function searchSelect(result) {
        // console.log(result);
        // console.log(result.result.center);
        var cityInfo = {
            lng: result.result.center[0],
            lat: result.result.center[1]
        }
        callWeather(cityInfo.lng, cityInfo.lat);
        setMarker(cityInfo);
    }

    geocoder.on('result', searchSelect);

// navigation controls
    map.addControl(new mapboxgl.NavigationControl());
    // map.addControl(new mapboxgl.GeolocateControl({
    //     positionOptions: {
    //         enableHighAccuracy: true
    //     },
    //     trackUserLocation: true,
    //     showUserHeading: true
    // }));

// first call from El Paso
    //El Paso, TX 31.76165, -106.48552
    var elPaso = {
        lng: -106.48552,
        lat: 31.76165
    };

    callWeather(elPaso.lng, elPaso.lat);
    setMarker(elPaso);
})();