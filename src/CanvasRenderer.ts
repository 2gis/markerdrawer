import { Atlas } from './Atlas';
import * as rbush from 'rbush';
import {
    Marker,
    IRenderer,
    Vec2,
} from './types';

import {
    lngLatToZoomPoint,
    vec2create,
    now,
} from './utils';

interface MarkerData {
    index: number;
    inBounds?: boolean;
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
}

interface Frame {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    tree: any;
}

export class CanvasRenderer implements IRenderer {
    public container: HTMLDivElement;

    private _atlas: Atlas;

    private _markers: Marker[];
    private _markersData: MarkerData[];

    private _debugDrawing: boolean;

    private _map: L.Map | undefined;
    private _size: Vec2;
    private _zoom: number;
    private _bufferFactor: number;
    private _bufferOffset: Vec2;

    private _origin: Vec2;
    private _pixelRatio: number;

    private _currentFrame: Frame;
    private _hiddenFrame: Frame;
    private _isRendering: boolean;
    private _timePerFrame: number;
    private _markersPerFrame: number;
    private _lastRenderedMarker: number;
    private _needUpdate: boolean;
    private _requestAnimationFrameId: number;

    private _vec: Vec2;

    constructor(atlas: Atlas, debugDrawing: boolean, bufferFactor: number) {
        this._atlas = atlas;
        this._debugDrawing = debugDrawing;
        this._bufferFactor = bufferFactor;
        this._markersPerFrame = 5000;
        this._timePerFrame = 10;
        this._origin = vec2create();
        this._vec = vec2create();
        this._lastRenderedMarker = 0;
        this._needUpdate = false;

        this.container = document.createElement('div');
        this._currentFrame = this._createFrame();
        this._hiddenFrame = this._createFrame();
    }

    public setMarkers(markers: Marker[]) {
        this.clear();

        this._markers = markers;

        // Set ordered indices
        const markersData: MarkerData[] = [];
        for (let i = 0; i < markers.length; i++) {
            markersData[i] = {
                index: i,
            };
        }
        this._markersData = markersData;
    }

    public onAddToMap(map: L.Map) {
        this._map = map;
        this.invalidateSize();
    }

    public onRemoveFromMap() {
        this._map = undefined;
    }

    public clear() {
        if (!this._map) {
            return;
        }

        this._currentFrame.ctx.clearRect(0, 0, this._size[0] * this._pixelRatio, this._size[1] * this._pixelRatio);
        this._currentFrame.tree.clear();

        if (this._isRendering) {
            cancelAnimationFrame(this._requestAnimationFrameId);
            this._isRendering = false;
        }
    }

    public invalidateSize() {
        if (!this._map) {
            return;
        }

        const mapSize = this._map.getSize();
        this._pixelRatio = window.devicePixelRatio;

        this._bufferOffset = [
            Math.floor(mapSize.x * this._bufferFactor),
            Math.floor(mapSize.y * this._bufferFactor),
        ];
        const size = this._size = [
            mapSize.x + this._bufferOffset[0] * 2,
            mapSize.y + this._bufferOffset[1] * 2,
        ];

        this._currentFrame.canvas.width = size[0] * this._pixelRatio;
        this._currentFrame.canvas.height = size[1] * this._pixelRatio;
        this._currentFrame.canvas.style.width = size[0] + 'px';
        this._currentFrame.canvas.style.height = size[1] + 'px';

        this._hiddenFrame.canvas.width = size[0] * this._pixelRatio;
        this._hiddenFrame.canvas.height = size[1] * this._pixelRatio;
        this._hiddenFrame.canvas.style.width = size[0] + 'px';
        this._hiddenFrame.canvas.style.height = size[1] + 'px';
    }

    public update() {
        if (!this._map) {
            return;
        }

        if (this._isRendering) {
            this._needUpdate = true;
            return;
        }

        this._zoom = this._map.getZoom();
        const center = this._map.getCenter();

        lngLatToZoomPoint(this._origin, [center.lng, center.lat], this._zoom);
        this._origin[0] = Math.round(this._origin[0] - this._size[0] / 2);
        this._origin[1] = Math.round(this._origin[1] - this._size[1] / 2);

        this._render();
    }

    public search(point: L.Point) {
        const x = (point.x + this._bufferOffset[0]) * this._pixelRatio;
        const y = (point.y + this._bufferOffset[1]) * this._pixelRatio;
        const res: MarkerData[] = this._currentFrame.tree.search({
            minX: x,
            minY: y,
            maxX: x,
            maxY: y,
        });

        return res.map((d) => d.index);
    }

    private _render() {
        if (!this._map) {
            return;
        }

        this._hiddenFrame.tree.clear();
        this._hiddenFrame.ctx.clearRect(0, 0, this._size[0] * this._pixelRatio, this._size[1] * this._pixelRatio);

        this._isRendering = true;
        this._lastRenderedMarker = 0;

        this._renderLoop();
    }

    private _renderLoop = () => {
        const from = this._lastRenderedMarker;
        const to = Math.min(from + this._markersPerFrame, this._markers.length);

        const startTime = now();

        this._renderPart(
            from,
            to,
        );

        this._lastRenderedMarker = to;

        const timePerMarker = (now() - startTime) / (to - from);
        this._markersPerFrame = Math.floor((this._markersPerFrame + this._timePerFrame / timePerMarker) / 2);

        if (to !== this._markers.length) {
            this._requestAnimationFrameId = requestAnimationFrame(this._renderLoop);
        } else {
            this._isRendering = false;
            this._switchFrames();

            if (this._needUpdate) {
                this._needUpdate = false;
                this.update();
            }
        }
    }

    private _renderPart(
        from: number,
        to: number,
    ) {
        const markers = this._markers;
        const markersData = this._markersData;
        const atlas = this._atlas;
        const debugDrawing = this._debugDrawing;
        const pixelRatio = this._pixelRatio;
        const size = this._size;
        const ctx = this._hiddenFrame.ctx;
        const offset = this._vec;
        const zoom = this._zoom;
        const origin = this._origin;

        if (!atlas.image) {
            return;
        }

        this._lastRenderedMarker = to;

        const visibleMarkers: MarkerData[] = [];

        for (let i = from; i < to; i++) {
            const marker = markers[i];
            const data = markersData[i];

            const sprite = atlas.sprites[marker.iconIndex || 0];
            if (!sprite) {
                data.inBounds = false;
                continue;
            }

            lngLatToZoomPoint(offset, marker.position, zoom);
            offset[0] -= origin[0];
            offset[1] -= origin[1];

            offset[0] = Math.round(offset[0] * pixelRatio - sprite.size[0] * sprite.anchor[0]);
            offset[1] = Math.round(offset[1] * pixelRatio - sprite.size[1] * sprite.anchor[1]);

            if (offset[0] < 0 || offset[0] + sprite.size[0] > size[0] * pixelRatio ||
                offset[1] < 0 || offset[1] + sprite.size[1] > size[1] * pixelRatio) {
                data.inBounds = false;
                continue;
            }

            // Prepare for rbush
            data.inBounds = true;
            data.minX = offset[0];
            data.minY = offset[1];
            data.maxX = offset[0] + sprite.size[0];
            data.maxY = offset[1] + sprite.size[1];
            visibleMarkers.push(data);

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

            if (debugDrawing) {
                this._debugDraw(marker, offset, sprite.size);
            }
        }

        this._hiddenFrame.tree.load(visibleMarkers);
    }

    private _debugDraw(marker: Marker, offset: Vec2, size: Vec2) {
        const ctx = this._hiddenFrame.ctx;
        const colors = [
            '#000000',
            '#ff0000',
            '#00ff00',
            '#0000ff',
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

    private _createFrame(): Frame {
        const canvas = document.createElement('canvas');
        canvas.style.display = 'none';
        canvas.style.pointerEvents = 'none';
        // We do not consider the case when 2d context is not exist
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        const tree = rbush();

        this.container.appendChild(canvas);

        return {
            canvas,
            ctx,
            tree,
        };
    }

    private _switchFrames() {
        if (!this._map) {
            return;
        }

        this._currentFrame.canvas.style.display = 'none';
        this._hiddenFrame.canvas.style.display = 'block';

        const pixelOffset = this._map.containerPointToLayerPoint([
            -this._bufferOffset[0],
            -this._bufferOffset[1],
        ]);
        L.DomUtil.setPosition(this._hiddenFrame.canvas, pixelOffset);

        const t = this._currentFrame;
        this._currentFrame = this._hiddenFrame;
        this._hiddenFrame = t;
    }
}
