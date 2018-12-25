import { Atlas } from './Atlas';
export declare type Vec2 = [number, number] | Float64Array | number[];
export declare type LngLat = number[];
export interface Marker {
    position: LngLat;
    iconIndex?: number;
    drawingOffsets?: number[];
}
export interface IRenderer {
    container: HTMLDivElement;
    onAddToMap(map: L.Map): any;
    clear(): any;
    search(point: Vec2): any;
    update(): any;
    setMarkers(markes: Marker[]): any;
    setAtlas(atlas: Atlas): any;
    setDebugDrawing(value: boolean): any;
}
export interface MarkerDrawerMouseEvent {
    marker: number;
    originalEvent: MouseEvent;
}
