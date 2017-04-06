import {
    MarkerDrawer,
    Atlas,
    Marker,
} from '../src';

const map = window['map'] = L.map('map', {
    center: [54.980156831455, 82.897440725094],
    zoom: 15,
});

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

const centerLngLat: [number, number] = [82.897440725094, 54.980156831455];
const markersData: Marker[] = [];
for (let i = 0; i < 5000; i++) {
    markersData.push({
        position: [
            centerLngLat[0] + (Math.random() - 0.5) * 0.25,
            centerLngLat[1] + (Math.random() - 0.5) * 0.1,
        ],
    });
}
markersData.push({
    position: centerLngLat,
});

const pin = new Image();
pin.src = 'demo/marker.png';

const hoveredPin = new Image();
hoveredPin.src = 'demo/marker_hover.png';

const atlas = new Atlas([{
    image: pin,
    anchor: [0.5, 1],
    size: [25, 41],
}, {
    image: hoveredPin,
    anchor: [0.5, 1],
    size: [25, 41],
}]);

const markerDrawer = new MarkerDrawer(atlas, {
    bufferFactor: 0.5,
});

markerDrawer.setMarkers(markersData);

markerDrawer.on('click', (ev: any) => {
    // tslint:disable-next-line
    console.log('click', ev);

    ev.markers.forEach((index) => {
        markersData[index].iconIndex = 1;
    });
    markerDrawer.update();
});

markerDrawer.addTo(map);
