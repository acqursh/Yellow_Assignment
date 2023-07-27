// Global variables
let allRestaurants = [];
let map;
let serial_no = 1;

// Function to initialize the map
function initMap() {
  // Get the user's current location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      // Create the map centered at the user's location
      map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: userLat, lng: userLng },
        zoom: 15,
      });
	  
	  // Store the user's current location in local storage
      storeLocation(userLat, userLng);

      // Get all restaurants near the user's location
      getAllRestaurants(userLat, userLng);
    });
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}


// Function to handle the results from the Google Places API
function handleResults(results, status, pagination) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    const restaurantTable = document.getElementById("restaurant-table");

    // // Clear the existing content in the restaurant table
    // restaurantTable.innerHTML = "";

    // Loop through the results and add rows for each restaurant
    for (let i = 0; i < results.length; i++) {
      const place = results[i];
      const name = place.name;
	  const location = place.geometry.location;
	  
	  // Add marker for the restaurant on the map
      const marker = new google.maps.Marker({
        position: location,
        map: map, // Use the global 'map' variable here
        title: name,
      });

      // Create a new row for the restaurant in the table
      const row = document.createElement("tr");

      // Add the serial number cell
      const serialCell = document.createElement("td");
      // serialCell.textContent = i + 1;
	  serialCell.textContent = serial_no;
	  serial_no = serial_no + 1;
      row.appendChild(serialCell);

      // Add the restaurant name cell
      const nameCell = document.createElement("td");
      nameCell.textContent = name;
      row.appendChild(nameCell);

      // Add the row to the restaurant table
      restaurantTable.appendChild(row);

      // Add restaurant name to the array
      allRestaurants.push(name);
    }

    if (pagination.hasNextPage) {
      // Fetch the next page of results
      pagination.nextPage();
    }
  } else {
    console.log("No restaurants found.");
  }
}


// Function to fetch all restaurants
function getAllRestaurants(userLat, userLng) {
  const service = new google.maps.places.PlacesService(map);
  // const gridSize = 0.2; // Adjust the grid size as needed
  // const totalRequests = 17; // Number of requests to make (adjust as needed)
  
  // for (let i = 0; i < totalRequests; i++) {
    // for (let j = 0; j < totalRequests; j++) {
      // const lat = userLat - gridSize + (gridSize * i);
      // const lng = userLng - gridSize + (gridSize * j);
      // const location = new google.maps.LatLng(lat, lng);

	  service.nearbySearch(
      {
        location: { lat: userLat, lng: userLng },
        radius: 2000000, // Search radius in meters (increase to cover a larger area)
        type: ['restaurant'], // Filter to include only restaurants
      },
      function(results, status, pagination) {
	    console.log(results, "RESTAURANTS");
        handleResults(results, status, pagination);
      }
     );
	// }
  // }
}

// Function to store the user's current location in local storage
function storeLocation(lat, lng) {
  // Get the past locations from local storage or initialize an empty array
  let pastLocations = JSON.parse(localStorage.getItem("pastLocations")) || [];

  // Add the current location to the array
  pastLocations.push({ lat: lat, lng: lng });

  // Ensure the array only contains the last 10 locations
  if (pastLocations.length > 10) {
    pastLocations = pastLocations.slice(pastLocations.length - 10);
  }

  // Store the updated array back to local storage
  localStorage.setItem("pastLocations", JSON.stringify(pastLocations));
}

// // Function to display the past locations as addresses
// function displayPastLocations() {
  // // Get the past locations from local storage
  // const pastLocations = JSON.parse(localStorage.getItem("pastLocations")) || [];

  // // Display the past locations in the console
  // console.log("Past Locations:");
  // pastLocations.forEach((location, index) => {
    // // Use the Google Maps Geocoding API to convert latlng to address
    // const geocoder = new google.maps.Geocoder();
    // const latlng = new google.maps.LatLng(location.lat, location.lng);

    // geocoder.geocode({ location: latlng }, (results, status) => {
      // if (status === "OK") {
        // if (results[0]) {
          // const address = results[0].formatted_address;
          // console.log(`${index + 1}. ${address}`);
        // } else {
          // console.log(`${index + 1}. Address not found for Lat: ${location.lat}, Lng: ${location.lng}`);
        // }
      // } else {
        // console.log(`${index + 1}. Geocoder failed for Lat: ${location.lat}, Lng: ${location.lng}`);
      // }
    // });
  // });
// }

// Function to display the past locations as addresses
function displayPastLocations() {
  // Get the past locations from local storage
  const pastLocations = JSON.parse(localStorage.getItem("pastLocations")) || [];

  // Clear the existing content in the past locations list
  const pastLocationsList = document.getElementById("past-locations-list");
  pastLocationsList.innerHTML = "";

  // Display the past locations in the table
  const geocoder = new google.maps.Geocoder();
  pastLocations.forEach((location, index) => {
    const latlng = new google.maps.LatLng(location.lat, location.lng);
    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === "OK") {
        if (results[0]) {
          const address = results[0].formatted_address;
          // Add the address to the past locations table
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


// Call the initMap function when the page loads
// Note: The initMap function will be called automatically by the API after loading
// because we included the 'callback=initMap' parameter in the API URL.
// initMap();
// displayPastLocations();
document.addEventListener("DOMContentLoaded", function () {
  initMap();
  displayPastLocations();
});

