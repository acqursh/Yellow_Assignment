// Global variables
let allRestaurants = [];
let map;
let serial_no = 1;

function initMap() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: userLat, lng: userLng },
        zoom: 15,
      });

      storeLocation(userLat, userLng);
      getAllRestaurants(userLat, userLng);
    });
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

function handleResults(results, status, pagination) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    const restaurantTable = document.getElementById("restaurant-table");

    for (let i = 0; i < results.length; i++) {
      const place = results[i];
      const name = place.name;
      const location = place.geometry.location;

      const marker = new google.maps.Marker({
        position: location,
        map: map,
        title: name,
      });

      const row = document.createElement("tr");
      const serialCell = document.createElement("td");
      serialCell.textContent = serial_no;
      serial_no = serial_no + 1;
      row.appendChild(serialCell);

      const nameCell = document.createElement("td");
      nameCell.textContent = name;
      row.appendChild(nameCell);

      restaurantTable.appendChild(row);

      allRestaurants.push(name);
    }

    if (pagination.hasNextPage) {
      pagination.nextPage();
    }
  } else {
    console.log("No restaurants found.");
  }
}

function getAllRestaurants(userLat, userLng) {
  const service = new google.maps.places.PlacesService(map);

  service.nearbySearch(
    {
      location: { lat: userLat, lng: userLng },
      radius: 2000000,
      type: ['restaurant'],
    },
    function(results, status, pagination) {
      console.log(results, "RESTAURANTS");
      handleResults(results, status, pagination);
    }
  );
}

function storeLocation(lat, lng) {
  let pastLocations = JSON.parse(localStorage.getItem("pastLocations")) || [];

  pastLocations.push({ lat: lat, lng: lng });

  if (pastLocations.length > 10) {
    pastLocations = pastLocations.slice(pastLocations.length - 10);
  }

  localStorage.setItem("pastLocations", JSON.stringify(pastLocations));
}

function displayPastLocations() {
  const pastLocations = JSON.parse(localStorage.getItem("pastLocations")) || [];
  const pastLocationsList = document.getElementById("past-locations-list");
  pastLocationsList.innerHTML = "";

  const geocoder = new google.maps.Geocoder();
  pastLocations.forEach((location, index) => {
    const latlng = new google.maps.LatLng(location.lat, location.lng);
    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === "OK") {
        if (results[0]) {
          const address = results[0].formatted_address;
          const row = document.createElement("tr");
          const cell = document.createElement("td");
          cell.textContent = address;
          row.appendChild(cell);
          pastLocationsList.appendChild(row);
        } else {
          console.log(`${index + 1}. Address not found for Lat: ${location.lat}, Lng: ${location.lng}`);
        }
      } else {
        console.log(`${index + 1}. Geocoder failed for Lat: ${location.lat}, Lng: ${location.lng}`);
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initMap();
  displayPastLocations();
});
