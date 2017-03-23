import { MarkerDrawer, Atlas } from '../src';

const map = L.map('map', {
    center: [54.980156831455, 82.897440725094],
    zoom: 15
});

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const center = [54.980156831455, 82.897440725094];
const markersData: Marker[] = [];
for (let i = 0; i < 5000; i++) {
    markersData.push({
        latLng: [center[0] + (Math.random() - 0.5) * 0.1, center[1] + (Math.random() - 0.5) * 0.25]
    });
}

const pin = new Image();
pin.src = 'demo/marker.png';

const hoveredPin = new Image();
hoveredPin.src = 'demo/marker_hover.png';

const atlas = new Atlas([{
    image: pin,
    anchor: [0.5, 1]
}, {
    image: hoveredPin,
    anchor: [0.5, 1]
}]);

const markerDrawer = new MarkerDrawer(markersData, atlas);

markerDrawer.on('click', (ev: any) => {
    // tslint:disable-next-line
    console.log('click', ev);

    const arg = ev.markers.map((index) => ({ index, icon: 1 }));
    markerDrawer.setMarkersIcon(arg);
});

markerDrawer.addTo(map);
