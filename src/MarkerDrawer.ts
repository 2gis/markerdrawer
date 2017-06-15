import { Atlas } from './Atlas';
import { CanvasRenderer } from './CanvasRenderer';
import { Marker, Vec2, MarkerDrawerMouseEvent } from './types';

export interface MarkerDrawerOptions {
    debugDrawing?: boolean;
    bufferFactor?: number;
    zIndex?: number;
}

/**
 * This class helps to draw fast a huge amount of markers
 */
export class MarkerDrawer extends L.Layer {
    private _markers: Marker[];
    private _atlas: Atlas;
    private _map?: L.Map;
    private _renderer: CanvasRenderer;
    private _pane: HTMLElement;
    private _hoveredMarker?: number;
    private _clickedMarker?: number;

    constructor(atlas: Atlas, options: MarkerDrawerOptions = {}) {
        super();

        this._atlas = atlas;
        this._markers = [];
        this._renderer = new CanvasRenderer(
            this._atlas,
            options.debugDrawing || false,
            options.bufferFactor !== undefined ? options.bufferFactor : 0.5,
            options.zIndex,
        );
    }

    public setMarkers(markers: Marker[]) {
        this._markers = markers;
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
        this._pane.addEventListener('mousemove', this._onMouseMove);
        this._pane.addEventListener('mouseout', this._onMouseOut);
        this._pane.addEventListener('mousedown', this._onMouseDown);
        this._pane.addEventListener('mouseup', this._onMouseUp);
        this._pane.appendChild(this._renderer.container);
        this._atlas.whenReady()
            .then(() => {
                this._renderer.update();
            });

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
        this._pane.removeEventListener('mousemove', this._onMouseMove);
        this._pane.removeEventListener('mouseout', this._onMouseOut);
        this._pane.removeEventListener('mousedown', this._onMouseDown);
        this._pane.removeEventListener('mouseup', this._onMouseUp);

        return this;
    }

    public setDebugDrawing(value: boolean) {
        this._renderer.setDebugDrawing(value);
    }

    private _onClick = (ev: MouseEvent) => {
        const point = this._getMousePosition(ev);
        const markers = this._renderer.search(point);

        if (markers.length) {
            ev.stopPropagation();
            const event: MarkerDrawerMouseEvent = {
                originalEvent: ev,
                marker: Math.max(...markers),
            };
            this.fire('click', event);
        }
    }

    private _onMouseOut = (ev: MouseEvent) => {
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
