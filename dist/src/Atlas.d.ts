import { Vec2 } from './types';
/**
 * Icon with options for atlas
 */
export declare type Icon = {
    image: HTMLImageElement;
    anchor?: Vec2;
    size?: Vec2;
    pixelDensity?: number;
};
export declare type Sprite = {
    position: Vec2;
    size: Vec2;
    anchor: Vec2;
    pixelDensity: number;
};
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
    private _imageLoad(image);
    private _createSprite(icons);
}
