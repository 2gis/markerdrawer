/// <reference types="leaflet" />
export declare type Vec2 = [number, number] | Float64Array;
export declare type LngLat = [number, number];
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
    setDebugDrawing(value: boolean): any;
}
