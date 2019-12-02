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
    private _renderer;
    private _pane;
    private _hoveredMarker?;
    private _clickedMarker?;
    private _duringInvalidTreeLastEvent?;
    private _isValidData;
    private _isZooming;
    constructor(options?: MarkerDrawerOptions);
    setAtlas(atlas: Atlas): void;
    setMarkers(markers: Marker[]): void;
    update(): void;
    addTo(map: L.Map): this;
    onAdd(): this;
    remove(): this;
    onRemove(): this;
    setDebugDrawing(value: boolean): void;
    private _handleEvent;
    private _onClick;
    private _onContextmenu;
    private _onMouseLeave;
    private _onMouseMove;
    private _onMouseDown;
    private _onMouseUp;
    /**
     * События, вызывающие movestart у карты, сохраняются на случай, когда
     * во время невалидности rbush не происходит движение мышью, поскольку в таком
     * случае будет невозможно определить местоположение курсора мыши, тем самым
     * данная ситуация будет обработана некорректно.
     */
    private _onMouseWheel;
    /**
     * События, вызывающие movestart у карты, сохраняются на случай, когда
     * во время невалидности rbush не происходит движение мышью, поскольку в таком
     * случае будет невозможно определить местоположение курсора мыши, тем самым
     * данная ситуация будет обработана некорректно.
     */
    private _onDblClick;
    private _onZoomStart;
    private _onMoveEnd;
    private _getMousePosition;
}
