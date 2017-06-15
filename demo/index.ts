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

const pixelRatio = window.devicePixelRatio < 2 ? 1 : 2;

const pin = new Image();
pin.src = 'demo/markers/' + pixelRatio + '/pin_regular.png';

const hoveredPin = new Image();
hoveredPin.src = 'demo/markers/' + pixelRatio + '/pin_regular_hover.png';

const activePin = new Image();
activePin.src = 'demo/markers/' + pixelRatio + '/pin_regular_active.png';

const atlas = new Atlas([{
    image: pin,
    anchor: [0.5, 1],
    pixelDensity: pixelRatio,
}, {
    image: hoveredPin,
    anchor: [0.5, 1],
    pixelDensity: pixelRatio,
}, {
    image: activePin,
    anchor: [0.5, 1],
    pixelDensity: pixelRatio,
}]);

const markerDrawer = new MarkerDrawer(atlas, {
    bufferFactor: 0.5,
});

markerDrawer.setMarkers(markersData);

markerDrawer.on('mousedown', (ev: any) => {
    markersData[ev.marker].iconIndex = 2;
    markerDrawer.update();
});

markerDrawer.on('mouseup', (ev: any) => {
    markersData[ev.marker].iconIndex = 1;
    markerDrawer.update();
});

markerDrawer.on('mouseover', (ev: any) => {
    if (!markersData[ev.marker].iconIndex) {
        markersData[ev.marker].iconIndex = 1;
        markerDrawer.update();
    }
    map.getContainer().style['cursor'] = 'pointer';
});

markerDrawer.on('mouseout', (ev: any) => {
    if (markersData[ev.marker].iconIndex === 1) {
        markersData[ev.marker].iconIndex = 0;
        markerDrawer.update();
    }
    map.getContainer().style['cursor'] = 'default';
});

markerDrawer.addTo(map);

// Second marker drawer layer
const pinFav = new Image();
pinFav.src = 'demo/markers/' + pixelRatio + '/pin_favorites.png';

const hoveredPinFav = new Image();
hoveredPinFav.src = 'demo/markers/' + pixelRatio + '/pin_favorites_active.png';

const atlas2 = new Atlas([{
    image: pinFav,
    anchor: [0.5, 1],
    pixelDensity: pixelRatio,
}, {
    image: hoveredPinFav,
    anchor: [0.5, 1],
    pixelDensity: pixelRatio,
}]);

const markerDrawer2 = new MarkerDrawer(atlas2, {
    bufferFactor: 0.5,
});

const markersData2: Marker[] = [];
for (let i = 0; i < 50; i++) {
    markersData2.push({
        position: [
            centerLngLat[0] + (random() - 0.5) * 0.25,
            centerLngLat[1] + (random() - 0.5) * 0.1,
        ],
    });
}
markerDrawer2.setMarkers(markersData2);

markerDrawer2.addTo(map);

markerDrawer2.on('click', (ev: any) => {
    // tslint:disable-next-line
    console.log('click', ev);

    markersData2[ev.marker].iconIndex = 1;

    markerDrawer2.update();
});
