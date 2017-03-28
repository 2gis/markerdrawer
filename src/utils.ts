import {
  LngLat,
  Vec2,
} from './types';

const R = 6378137;
const MAX_LATITUDE = 85.0511287798;

export function lngLatToZoomPoint(lngLat: LngLat, zoom: number) {
    return mapPointToScreenPoint(latLngToMapPoint(lngLat), zoom);
}

function mapPointToScreenPoint(point: Vec2, zoom): Vec2 {
    const scale = 256 * Math.pow(2, zoom);
    const k = 0.5 / (Math.PI * R);
    return [
        scale * (k * point[0] + 0.5),
        scale * (-k * point[1] + 0.5),
    ];
}

function latLngToMapPoint(lngLat: LngLat): Vec2 {
    const d = Math.PI / 180;
    const lat = Math.max(Math.min(MAX_LATITUDE, lngLat[1]), -MAX_LATITUDE);
    const sin = Math.sin(lat * d);
    return [
        R * lngLat[0] * d,
        R * Math.log((1 + sin) / (1 - sin)) / 2,
    ];
}
