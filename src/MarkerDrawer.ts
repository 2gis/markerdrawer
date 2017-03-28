import { Atlas } from './Atlas';
import { CanvasRenderer } from './CanvasRenderer';
import { Marker } from './types';

export interface MarkerDrawerOptions {
    debugDrawing?: boolean;
    bufferFactor?: number;
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

    constructor(markers: Marker[], atlas: Atlas, options: MarkerDrawerOptions = {}) {
        super();

        this._markers = markers;
        this._atlas = atlas;
        this._renderer = new CanvasRenderer(
            this._markers,
            this._atlas,
            options.debugDrawing || false,
            options.bufferFactor !== undefined ? options.bufferFactor : 0.5,
        );
    }

    public addTo(map: L.Map) {
        map.addLayer(this);

        return this;
    }

    public onAdd() {
        if (!this._map) {
            return this;
        }

        if (!this._map.getPane('markerbatch')) {
            this._pane = this._map.createPane('markerbatch');
        } else {
            this._pane = this._map.getPane('markerbatch');
        }

        this._renderer.onAddToMap(this._map);
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

        return this;
    }

    public getEvents() {
        return {
            viewreset: this._update,
            moveend: this._update,
            zoomstart: this._onZoomStart,
            click: this._onClick,
        };
    }

    public setMarkerIcon(index: number, iconIndex: number) {
        this._markers[index].iconIndex = iconIndex;
        this._renderer.update();
    }

    public setMarkersIcon(array: Array<{index: number, iconIndex: number}>) {
        array.forEach(({ index, iconIndex }) => {
            this._markers[index].iconIndex = iconIndex;
        });
        this._renderer.update();
    }

    private _onZoomStart() {
        this._renderer.clear();
    }

    private _update() {
        this._renderer.update();
    }

    private _onClick(e) {
        const markers = this._renderer.search(e.containerPoint);

        if (markers.length) {
            this.fire('click', { markers });
        }
    }
}
