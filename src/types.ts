export type Vec2 = [number, number] | Float64Array;

export type LngLat = [number, number];

export interface Marker {
    position: LngLat;
    iconIndex?: number; // Индекс иконки маркера в атласе
    drawingOffsets?: number[];
};

export interface IRenderer {
    container: HTMLCanvasElement;
    onAddToMap(map: L.Map);
    clear();
    search(point: L.Point);
    update();
    invalidateSize();
}
