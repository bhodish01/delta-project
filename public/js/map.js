// let mapToken = mapToken;
//Add your LocationIQ Maps Access Token here (not the API token!)
console.log("MAP JS LOADED");
const mapDiv = document.getElementById("map");

const coordinates = JSON.parse(mapDiv.dataset.coordinates);
console.log(coordinates);

locationiq.key = mapToken;
//Define the map and configure the map's theme
var map = new maplibregl.Map({
  container: "map",
  style: locationiq.getLayer("Streets"),
  zoom: 9,
  // center: [77.209, 28.6139],
  center: coordinates,
});

//Define layers you want to add to the layer controls; the first element will be the default layer
// var layerStyles = {
//   Streets: "streets/vector",
//   Dark: "dark/vector",
//   Light: "light/vector",
// };
var layerStyles = {
  Streets: "streets/raster",
  Dark: "dark/raster",
  Light: "light/raster",
};

map.addControl(
  new locationiqLayerControl({
    key: locationiq.key,
    layerStyles: layerStyles,
  }),
  "top-left",
);

const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
    <h5>${mapDiv.dataset.location}</h5>
    <p>Exact location will be provided after booking</p>
  `);

new maplibregl.Marker({ color: "red" })
  .setLngLat(coordinates)
  .setPopup(popup)
  .addTo(map);
