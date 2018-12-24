import { Atlas } from './Atlas';

export type Vec2 = [number, number] | Float64Array | number[];

export type LngLat = number[];

export interface Marker {
    position: LngLat;
    iconIndex?: number; // Индекс иконки маркера в атласе
    drawingOffsets?: number[];
}

export interface IRenderer {
    container: HTMLDivElement;
    onAddToMap(map: L.Map);
    clear();
    search(point: Vec2);
    update();
    setMarkers(markes: Marker[]);
    setAtlas(atlas: Atlas);
    setDebugDrawing(value: boolean);
}

export interface MarkerDrawerMouseEvent {
    marker: number;
    originalEvent: MouseEvent;
}
