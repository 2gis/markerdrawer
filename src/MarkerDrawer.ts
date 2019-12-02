import { Atlas } from './Atlas';
import { CanvasRenderer } from './CanvasRenderer';
import { Marker, Vec2, MarkerDrawerMouseEvent } from './types';

export interface MarkerDrawerOptions {
    debugDrawing?: boolean;
    bufferFactor?: number;
    zIndex?: number;
    updateOnMoveEnd?: boolean;
}

/**
 * This class helps to draw fast a huge amount of markers
 */
export class MarkerDrawer extends L.Layer {
    private _renderer: CanvasRenderer;
    private _pane: HTMLElement;
    private _hoveredMarker?: number;
    private _clickedMarker?: number;
    private _duringInvalidTreeLastEvent?: MouseEvent;
    private _isValidData: boolean;
    private _isZooming: boolean;

    constructor(options: MarkerDrawerOptions = {}) {
        super();

        this._renderer = new CanvasRenderer(
            options.debugDrawing || false,
            options.bufferFactor !== undefined ? options.bufferFactor : 0.5,
            options.zIndex,
            options.updateOnMoveEnd,
        );

        this._isZooming = false;
        this._isValidData = true;
        this._renderer.on('invalidtree', () => {
            this._isValidData = false;
        });
        this._renderer.on('validtree', () => {
            if (!this._isValidData) {
                this._isValidData = true;
                if (this._duringInvalidTreeLastEvent) {
                    this._onMouseMove(this._duringInvalidTreeLastEvent);
                    this._duringInvalidTreeLastEvent = undefined;
                }
            }
        });
    }

    public setAtlas(atlas: Atlas) {
        this._renderer.setAtlas(atlas);
    }

    public setMarkers(markers: Marker[]) {
        this._renderer.setMarkers(markers);
    }

    public update() {
        this._renderer.update();
    }

    public addTo(map: L.Map) {
        map.addLayer(this);

        return this;
    }

    public onAdd() {
        if (!this._map) {
            return this;
        }

        this._pane = this._map.getPane('overlayPane') as HTMLElement; // overlayPane always exist

        this._renderer.onAddToMap(this._map);
        this._pane.addEventListener('click', this._onClick);
        this._pane.addEventListener('contextmenu', this._onContextmenu);
        this._pane.addEventListener('mousemove', this._onMouseMove);
        this._pane.addEventListener('mouseleave', this._onMouseLeave);
        this._pane.addEventListener('mousedown', this._onMouseDown);
        this._pane.addEventListener('mouseup', this._onMouseUp);
        this._pane.addEventListener('wheel', this._onMouseWheel);
        this._pane.addEventListener('dblclick', this._onDblClick);
        this._map.on({
            zoomstart: this._onZoomStart,
            moveend: this._onMoveEnd,
        });
        this._pane.appendChild(this._renderer.container);

        return this;
    }

    public remove() {
        if (this._map) {
            this._map.removeLayer(this);
        }

        return this;
    }

    public onRemove() {
        this._pane.removeChild(this._renderer.container);
        this._renderer.onRemoveFromMap();
        this._pane.removeEventListener('click', this._onClick);
        this._pane.removeEventListener('contextmenu', this._onContextmenu);
        this._pane.removeEventListener('mousemove', this._onMouseMove);
        this._pane.removeEventListener('mouseleave', this._onMouseLeave);
        this._pane.removeEventListener('mousedown', this._onMouseDown);
        this._pane.removeEventListener('mouseup', this._onMouseUp);
        this._pane.removeEventListener('wheel', this._onMouseWheel);
        this._pane.removeEventListener('dblclick', this._onDblClick);
        this._map.off({
            zoomstart: this._onZoomStart,
            moveend: this._onMoveEnd,
        });

        return this;
    }

    public setDebugDrawing(value: boolean) {
        this._renderer.setDebugDrawing(value);
    }

    private _handleEvent = (type: 'click' | 'contextmenu', ev: MouseEvent) => {
        if (!this._isValidData) {
            return;
        }

        const point = this._getMousePosition(ev);
        const markers = this._renderer.search(point);

        if (markers.length) {
            ev.stopPropagation();
            const event: MarkerDrawerMouseEvent = {
                originalEvent: ev,
                marker: Math.max(...markers),
            };
            this.fire(type, event);
        }
    }

    private _onClick = (ev: MouseEvent) => this._handleEvent('click', ev);

    private _onContextmenu = (ev: MouseEvent) => this._handleEvent('contextmenu', ev);

    private _onMouseLeave = (ev: MouseEvent) => {
        /**
         * При зуме иногда бросается событие mouseleave, хотя курсор мыши остается на DOM-элементе.
         * Чтобы обойти этот момент, делаем проверку на процесс зума и положение курсора.
         */
        if (this._isZooming) {
            return;
        }

        if (this._hoveredMarker !== undefined) {
            const event: MarkerDrawerMouseEvent = {
                originalEvent: ev,
                marker: this._hoveredMarker,
            };
            this.fire('mouseout', event);
            this._hoveredMarker = undefined;
        }
    }

    private _onMouseMove = (ev: MouseEvent) => {
        if (!this._isValidData) {
            this._duringInvalidTreeLastEvent = ev;
            return;
        }

        const point = this._getMousePosition(ev);
        const markers = this._renderer.search(point);
        const event: MarkerDrawerMouseEvent = {
            originalEvent: ev,
            marker: 0,
        };

        if (markers.length) {
            const topMarker = Math.max(...markers);

            if (this._hoveredMarker !== undefined) {
                if (this._hoveredMarker === topMarker) {
                    return;
                }
                event.marker = this._hoveredMarker;
                this.fire('mouseout', event);
            }
            this._hoveredMarker = topMarker;
            event.marker = this._hoveredMarker;
            this.fire('mouseover', event);
        } else if (this._hoveredMarker !== undefined) {
            event.marker = this._hoveredMarker;
            this.fire('mouseout', event);
            this._hoveredMarker = undefined;
        }
    }

    private _onMouseDown = (ev: MouseEvent) => {
        if (!this._isValidData) {
            return;
        }

        const point = this._getMousePosition(ev);
        const markers = this._renderer.search(point);

        if (markers.length) {
            this._clickedMarker = Math.max(...markers);
            const event: MarkerDrawerMouseEvent = {
                originalEvent: ev,
                marker: this._clickedMarker,
            };
            this.fire('mousedown', event);
        }
    }

    private _onMouseUp = (ev: MouseEvent) => {
        if (this._clickedMarker !== undefined) {
            const event: MarkerDrawerMouseEvent = {
                originalEvent: ev,
                marker: this._clickedMarker,
            };
            this.fire('mouseup', event);
            this._clickedMarker = undefined;
        }
    }

    /**
     * События, вызывающие movestart у карты, сохраняются на случай, когда
     * во время невалидности rbush не происходит движение мышью, поскольку в таком
     * случае будет невозможно определить местоположение курсора мыши, тем самым
     * данная ситуация будет обработана некорректно.
     */
    private _onMouseWheel = (ev: MouseEvent) => {
        this._duringInvalidTreeLastEvent = ev;
    }

    /**
     * События, вызывающие movestart у карты, сохраняются на случай, когда
     * во время невалидности rbush не происходит движение мышью, поскольку в таком
     * случае будет невозможно определить местоположение курсора мыши, тем самым
     * данная ситуация будет обработана некорректно.
     */
    private _onDblClick = (ev: MouseEvent) => {
        this._duringInvalidTreeLastEvent = ev;
    }

    private _onZoomStart = () => {
        this._isZooming = true;
    }

    private _onMoveEnd = () => {
        this._isZooming = false;
    }

    private _getMousePosition(ev: MouseEvent): Vec2 {
        const map = this._map as L.Map;
        const container = map.getContainer();
        const rect = container.getBoundingClientRect();
        return [
            ev.clientX - rect.left - container.clientLeft,
            ev.clientY - rect.top - container.clientTop,
        ];
    }
}
