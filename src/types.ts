export type Vec2 = [number, number];

export type lngLat = [number, number];

export interface Marker {
    position: lngLat;
    icon?: number; // Индекс иконки маркера в атласе
};

export interface IRenderer {
    container: HTMLCanvasElement;
    onAddToMap(map: L.Map);
    clear();
    search(point: L.Point);
    update();
}
