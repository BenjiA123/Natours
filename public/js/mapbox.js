


export const dieplayMap = (locations)=>{

  
mapboxgl.accessToken =
'pk.eyJ1IjoidGVja3dybGQiLCJhIjoiY2tmdTIxNHgwMHB4YTJ3bWo5OTlzM2p6YiJ9.MOEwWtbYice6wS6JUeYiYg';
var map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
scrollZoom:false,
center: [-74.5, 40],

});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
const el = document.createElement('div');
el.className = 'marker';

new mapboxgl.Marker({
  element: el,
  anchor: 'bottom',
})
  .setLngLat(loc.coordinates)
  .addTo(map);

new mapboxgl.Popup({
    offset:30
})
  .setLngLat(loc.coordinates)
  .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
  .addTo(map);
bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
padding: {
  top: 200,
  bottom: 150,
  left: 100,
  right: 100,
},
});


}
