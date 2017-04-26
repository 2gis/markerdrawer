import * as DG from '2gis-maps';
import {
    MarkerDrawer,
    Atlas,
    Marker,
} from '../src';

const map = window['map'] = DG.map('map', {
    center: [54.980156831455, 82.897440725094],
    zoom: 15,
    geoclicker: true,
});

const random = (() => {
    let seed = 15;

    return () => {
        seed = seed * 16807 % 2147483647;
        return (seed - 1) / 2147483646;
    };
})();

map.on('click', () => {
    // tslint:disable-next-line
    console.log('map click');
});

map.poi.getMetaLayer().on('click', () => {
    // tslint:disable-next-line
    console.log('poi click');
});

const centerLngLat: [number, number] = [82.897440725094, 54.980156831455];
const markersData: Marker[] = [];
for (let i = 0; i < 5000; i++) {
    markersData.push({
        position: [
            centerLngLat[0] + (random() - 0.5) * 0.25,
            centerLngLat[1] + (random() - 0.5) * 0.1,
        ],
    });
}
markersData.push({
    position: centerLngLat,
});

const pin = new Image();
const pixelRatio = window.devicePixelRatio < 2 ? 1 : 2;
pin.src = 'demo/markers/' + pixelRatio + '/pin_regular.png';

const hoveredPin = new Image();
hoveredPin.src = 'demo/markers/' + pixelRatio + '/pin_regular_hover.png';

const atlas = new Atlas([{
    image: pin,
    anchor: [0.5, 1],
    pixelDensity: pixelRatio,
}, {
    image: hoveredPin,
    anchor: [0.5, 1],
    pixelDensity: pixelRatio,
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
