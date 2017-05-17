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
        this._renderer.container.removeEventListener('click', this._onClick);

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
                markers,
            };
            this.fire('click', event);
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
