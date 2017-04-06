import {
  LngLat,
  Vec2,
} from './types';

const R = 6378137;
const MAX_LATITUDE = 85.0511287798;

export function vec2create(): Vec2 {
    return new Float64Array(2);
}

export function lngLatToZoomPoint(out: Vec2, lngLat: LngLat, zoom: number) {
    latLngToMapPoint(out, lngLat);
    mapPointToScreenPoint(out, out, zoom);
}

function mapPointToScreenPoint(out: Vec2, point: Vec2, zoom) {
    const scale = 256 * Math.pow(2, zoom);
    const k = 0.5 / (Math.PI * R);

    out[0] = scale * (k * point[0] + 0.5);
    out[1] = scale * (-k * point[1] + 0.5);
}

function latLngToMapPoint(out: Vec2, lngLat: LngLat) {
    const d = Math.PI / 180;
    const lat = Math.max(Math.min(MAX_LATITUDE, lngLat[1]), -MAX_LATITUDE);
    const sin = Math.sin(lat * d);

    out[0] = R * lngLat[0] * d;
    out[1] = R * Math.log((1 + sin) / (1 - sin)) / 2;
}

export const now = window.performance ? performance.now.bind(performance) : Date.now.bind(Date);
