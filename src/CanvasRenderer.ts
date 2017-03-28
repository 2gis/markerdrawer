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
    private _map: L.Map | undefined;
    private _size: Vec2;
    private _pixelRatio: number;
    private _pixelOffset: L.Point;
    private _tree: any;
    private _debugDrawing: boolean;
    private _bufferFactor: number;
    private _bufferOffset: Vec2;

    constructor(markers: Marker[], atlas: Atlas, debugDrawing: boolean, bufferFactor: number) {
        this._markers = markers;
        this._atlas = atlas;
        this._debugDrawing = debugDrawing;
        this._bufferFactor = bufferFactor;

        // Set ordered indices
        this._markersData = this._markers.map((_, i) => ({ index: i }));

        this.container = document.createElement('canvas');

        // We do not consider the case when 2d context is not exist
        this._ctx = this.container.getContext('2d') as CanvasRenderingContext2D;

        this._tree = rbush();
    }

    public onAddToMap(map: L.Map) {
        this._map = map;
        const mapSize = map.getSize();
        this._pixelRatio = window.devicePixelRatio;

        this._bufferOffset = [
            mapSize.x * this._bufferFactor,
            mapSize.y * this._bufferFactor,
        ];
        const size = this._size = [
            mapSize.x + this._bufferOffset[0] * 2,
            mapSize.y + this._bufferOffset[1] * 2,
        ];

        this.container.width = size[0] * this._pixelRatio;
        this.container.height = size[1] * this._pixelRatio;
        this.container.style.width = size[0] + 'px';
        this.container.style.height = size[1] + 'px';
    }

    public onRemoveFromMap() {
        this._map = undefined;
    }

    public clear() {
        this._ctx.clearRect(0, 0, this._size[0] * this._pixelRatio, this._size[1] * this._pixelRatio);
        this._tree.clear();
    }

    public update() {
        if (!this._map) {
            return;
        }

        this._pixelOffset = this._map.containerPointToLayerPoint([
            -this._bufferOffset[0],
            -this._bufferOffset[1],
        ]);

        L.DomUtil.setPosition(this.container, this._pixelOffset);

        this._render();
        this._updateTree();
    }

    public search(point: L.Point) {
        const x = point.x + this._bufferOffset[0];
        const y = point.y + this._bufferOffset[1];
        const res: MarkerData[] = this._tree.search({
            minX: x,
            minY: y,
            maxX: x,
            maxY: y,
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
        const debugDrawing = this._debugDrawing;
        const pixelRatio = this._pixelRatio;

        if (!map || !atlas.image) {
            return;
        }

        const zoom = map.getZoom();

        const size = this._size;

        ctx.clearRect(0, 0, size[0] * pixelRatio, size[1] * pixelRatio);

        const origin = map.getPixelOrigin();

        for (let i = 0; i < markers.length; i++) {
            const marker = markers[i];
            const data = markersData[i];

            const sprite = atlas.sprites[marker.iconIndex || 0];
            if (!sprite) {
                continue;
            }

            const latLng = L.latLng(marker.position[1], marker.position[0]);
            const layerPoint = map.project(latLng, zoom);
            const containerPoint: Vec2 = [
                layerPoint.x - origin.x - pixelOffset.x,
                layerPoint.y - origin.y - pixelOffset.y,
            ];

            const offset: Vec2 = [
                containerPoint[0] - sprite.size[0] * sprite.anchor[0],
                containerPoint[1] - sprite.size[1] * sprite.anchor[1],
            ];

            if (offset[0] < 0 || offset[0] + sprite.size[0] > size[0] ||
                offset[1] < 0 || offset[1] + sprite.size[1] > size[1]) {
                data.inBounds = false;
                continue;
            }

            // Prepare for rbush
            data.inBounds = true;
            data.minX = offset[0];
            data.minY = offset[1];
            data.maxX = offset[0] + sprite.size[0];
            data.maxY = offset[1] + sprite.size[1];

            const realOffset: Vec2 = [
                Math.round(containerPoint[0] * pixelRatio - sprite.size[0] * sprite.anchor[0]),
                Math.round(containerPoint[1] * pixelRatio - sprite.size[1] * sprite.anchor[1]),
            ];

            ctx.drawImage(
                atlas.image,
                sprite.position[0],
                sprite.position[1],
                sprite.size[0],
                sprite.size[1],

                realOffset[0],
                realOffset[1],
                sprite.size[0],
                sprite.size[1],
            );

            if (debugDrawing) {
                this._debugDraw(marker, realOffset, sprite.size);
            }
        }
    }

    private _updateTree() {
        this._tree.clear();
        this._tree.load(this._markersData.filter((d) => d.inBounds));
    }

    private _debugDraw(marker: Marker, offset: Vec2, size: Vec2) {
        const ctx = this._ctx;
        const colors = [
            '#000000',
            '#ff0000',
            '#00ff00',
        ];
        const drawingOffsets = marker.drawingOffsets;
        if (!drawingOffsets) {
            return;
        }

        for (let j = 0; j < drawingOffsets.length; j++) {
            const drawingOffset = drawingOffsets[j];
            ctx.beginPath();
            ctx.strokeStyle = colors[j];
            ctx.rect(
                offset[0] - drawingOffset,
                offset[1] - drawingOffset,
                size[0] + drawingOffset * 2,
                size[1] + drawingOffset * 2,
            );

            ctx.stroke();
        }
    }
}
