import { Vec2 } from './types';
/**
 * Icon with options for atlas
 */
export interface Icon {
    image: HTMLImageElement;
    anchor?: Vec2;
    size?: Vec2;
    pixelDensity?: number;
    interactiveMargin?: number;
}
export interface Sprite {
    position: Vec2;
    size: Vec2;
    anchor: Vec2;
    pixelDensity: number;
    interactiveMargin: number;
}
/**
 * The Atlas creates one image from a set of icons.
 * After creating holds information about positions of each icon in the image.
 */
export declare class Atlas {
    image?: HTMLCanvasElement;
    size: Vec2;
    sprites: Sprite[];
    private _promise;
    constructor(icons: Icon[]);
    /**
     * Returns a promise that will be resolve after all images loading done
     */
    whenReady(): Promise<any>;
    private _imageLoad;
    private _createSprite;
}
