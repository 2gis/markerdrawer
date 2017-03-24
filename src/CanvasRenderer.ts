import { Atlas } from './Atlas';
import * as rbush from 'rbush';
import {
    Marker,
    IRenderer,
    Vec2,
} from './types';

interface MarkerData {
    index: number;
    inBounds?: boolean;
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
}

export class CanvasRenderer implements IRenderer {
    public container: HTMLCanvasElement;

    private _markers: Marker[];
    private _markersData: MarkerData[];
    private _atlas: Atlas;
    private _ctx: CanvasRenderingContext2D;
    private _map: L.Map;
    private _size: L.Point;
    private _pixelOffset: L.Point;
    private _tree: any;

    constructor(markers: Marker[], atlas: Atlas) {
        this._markers = markers;
        this._atlas = atlas;

        // Set ordered indices
        this._markersData = this._markers.map((_, i) => ({ index: i }));

        this.container = document.createElement('canvas');

        // We do not consider the case when 2d context is not exist
        this._ctx = this.container.getContext('2d') as CanvasRenderingContext2D;

        this._tree = rbush();
    }

    public onAddToMap(map: L.Map) {
        this._map = map;
        const size = this._size = this._map.getSize();
        this.container.width = size.x;
        this.container.height = size.y;
        this.container.style.width = size.x + 'px';
        this.container.style.height = size.y + 'px';
    }

    public clear() {
        this._ctx.clearRect(0, 0, this._size.x, this._size.y);
        this._tree.clear();
    }

    public update() {
        this._pixelOffset = this._map.containerPointToLayerPoint([0, 0]);

        L.DomUtil.setPosition(this.container, this._pixelOffset);

        this._render();
        this._updateTree();
    }

    public search(point: L.Point) {
        const res: MarkerData[] = this._tree.search({
            minX: point.x,
            minY: point.y,
            maxX: point.x,
            maxY: point.y,
        });

        return res.map((d) => d.index);
    }

    private _render() {
        const markers = this._markers;
        const markersData = this._markersData;
        const atlas = this._atlas;
        const ctx = this._ctx;
        const map = this._map;
        const pixelOffset = this._pixelOffset;

        if (!map || !atlas.image) {
            return;
        }

        const zoom = map.getZoom();

        const size = this._size;

        ctx.clearRect(0, 0, size.x, size.y);

        const origin = map.getPixelOrigin();

        for (let i = 0; i < markers.length; i++) {
            const marker = markers[i];
            const data = markersData[i];

            const latLng = L.latLng(marker.latLng[0], marker.latLng[1]);
            const layerPoint = map.project(latLng, zoom);
            const containerPoint: Vec2 = [
                layerPoint.x - origin.x - pixelOffset.x,
                layerPoint.y - origin.y - pixelOffset.y,
            ];

            if (containerPoint[0] < 0 || containerPoint[0] > size[0] ||
                containerPoint[1] < 0 || containerPoint[1] > size[1]) {
                data.inBounds = false;
                continue;
            }

            const sprite = atlas.sprites[marker.icon || 0];

            const offset: Vec2 = [
                Math.floor(containerPoint[0] - sprite.size[0] * sprite.anchor[0]),
                Math.floor(containerPoint[1] - sprite.size[1] * sprite.anchor[1]),
            ];

            // Prepare for rbush
            data.inBounds = true;
            data.minX = offset[0];
            data.minY = offset[1];
            data.maxX = offset[0] + sprite.size[0];
            data.maxY = offset[1] + sprite.size[1];

            ctx.drawImage(
                atlas.image,
                sprite.position[0],
                sprite.position[1],
                sprite.size[0],
                sprite.size[1],

                offset[0],
                offset[1],
                sprite.size[0],
                sprite.size[1],
            );
        }
    }

    private _updateTree() {
        this._tree.clear();
        this._tree.load(this._markersData.filter((d) => d.inBounds));
    }
}
