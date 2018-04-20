declare namespace L {
    class Point {
        x: number;
        y: number;
        round(): Point;
    }

    class LatLng {
        lat: number;
        lng: number;
    }

    class Layer {
        protected _map: Map;
        fire(type: string, data?: any, propagate?: boolean): this;
        on(type: string, fn: Function, context?: any): this;
    }

    class Map {
        getContainer(): HTMLElement;
        getPane(name?: string): HTMLElement | undefined;
        addLayer(layer: Layer): this;
        removeLayer(layer: Layer): this;
        on(eventMap: {[name: string]: Function}): this;
        off(eventMap: {[name: string]: Function}): this;
        getSize(): Point;
        getCenter(): LatLng;
        getZoom(): number;
        containerPointToLayerPoint(point: [number, number]): Point;
    }

    namespace DomUtil {
        function setPosition(el: HTMLElement, position: Point): void;
    }
}
