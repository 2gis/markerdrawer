/// <reference types="leaflet" />
import { Atlas } from './Atlas';
import { Marker } from './types';
export interface MarkerDrawerOptions {
    debugDrawing?: boolean;
    bufferFactor?: number;
    zIndex?: number;
    updateOnMoveEnd?: boolean;
}
/**
 * This class helps to draw fast a huge amount of markers
 */
export declare class MarkerDrawer extends L.Layer {
    private _markers;
    private _map?;
    private _renderer;
    private _pane;
    private _hoveredMarker?;
    private _clickedMarker?;
    constructor(options?: MarkerDrawerOptions);
    setAtlas(atlas: Atlas): void;
    setMarkers(markers: Marker[]): void;
    update(): void;
    addTo(map: L.Map): this;
    onAdd(): this;
    remove(): this;
    onRemove(): this;
    setDebugDrawing(value: boolean): void;
    private _onClick;
    private _onMouseLeave;
    private _onMouseMove;
    private _onMouseDown;
    private _onMouseUp;
    private _getMousePosition(ev);
}
