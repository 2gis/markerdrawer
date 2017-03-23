type vec2 = [number, number];

type latLng = [number, number];

interface Marker {
  latLng: latLng;
  icon?: number; // Индекс иконки маркера в атласе

  _drawerData?: any; // Поле нужное для сохранения информации рендерера

  [key: string]: any; // В объекте маркера могут быть и другие поля
};

interface IRenderer {
    container: HTMLCanvasElement;
    onAddToMap(map: L.Map);
    clear();
    search(point: L.Point);
    update();
}
