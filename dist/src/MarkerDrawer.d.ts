/// <reference types="leaflet" />
import { Atlas } from './Atlas';
import { Marker } from './types';
export interface MarkerDrawerOptions {
    debugDrawing?: boolean;
    bufferFactor?: number;
}
/**
 * This class helps to draw fast a huge amount of markers
 */
export declare class MarkerDrawer extends L.Layer {
    private _markers;
    private _atlas;
    private _map?;
    private _renderer;
    private _pane;
    constructor(atlas: Atlas, options?: MarkerDrawerOptions);
    setMarkers(markers: Marker[]): void;
    update(): void;
    addTo(map: L.Map): this;
    onAdd(): this;
    remove(): this;
    onRemove(): this;
    setDebugDrawing(value: boolean): void;
    private _onClick;
    private _getMousePosition(ev);
}
