
// const script = document.currentScript;
// const mapToken = script.dataset.mapToken;
// const coordinates = JSON.parse(script.dataset.coordinates || '[77.2148,28.62137]');

// // Initialize Radar
// Radar.initialize(mapToken);

// // Create map
// let map = Radar.ui.map({
//   container: 'map',
//   style: 'radar-default-v1',
//   center: coordinates.length ? coordinates : [77.2148, 28.62137],
//   zoom: 14,
// });

// // Add marker
// if (coordinates && coordinates.length === 2) {
//   const marker = Radar.ui.marker({ text: 'Your Location' })
//     .setLngLat(coordinates)
//     .addTo(map);
// }
 

(() => {
  const script = document.currentScript;
  const mapToken = script.dataset.mapToken;
  const coordinates = JSON.parse(script.dataset.coordinates || '[77.2148,28.62137]');
  console.log(script.dataset.mapToken);

  if (!mapToken) {
    console.error("❌ Radar publishable key is missing!");
    return; // stop execution if token is missing
  }

  const coords = Array.isArray(coordinates) && coordinates.length === 2
    ? [Number(coordinates[0]), Number(coordinates[1])]
    : [77.2148, 28.62137];

    console.log(coords)

  // Initialize Radar
  Radar.initialize(mapToken);

  // Create map
  const map = Radar.ui.map({
    container: 'map',
    style: 'radar-default-v1',
    center: coordinates,
    zoom: 9,
  });
//  const popup = Radar.ui.popup()
//   .setText("Listing Location here");
  // Add marker (no 'new')
  Radar.ui.marker({  color:"red",
    // url:'https://www.flaticon.com/free-icon/home_10307931?term=home&page=1&position=55&origin=tag&related_id=10307931',
    // width:'48px',
    // height:'48px',  it not workin see it after completing this project
     popup:{text:"Exact Location provided after booking" }

     })
    .setLngLat(coords)
     // add popup
     
    .addTo(map)

    
    
})();


