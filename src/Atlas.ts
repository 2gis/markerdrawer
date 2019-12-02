import * as pack from 'bin-pack';
import { Vec2 } from './types';

/**
 * Icon with options for atlas
 */
export interface Icon {
    image: HTMLImageElement;
    anchor?: Vec2; // [anchor=[0.5, 0.5]]
    size?: Vec2; // [size=[image.width, image.height]] Size in a final atlas image
    // Может отличаться от исходного размера изображения.
    pixelDensity?: number; // Icon pixel density, 1 by default
    interactiveMargin?: number;
}

export interface Sprite {
    position: Vec2; // Position of icon in the image of atlas
    size: Vec2; // Size of icon in the atlas
    anchor: Vec2;
    pixelDensity: number; // Icon pixel density
    interactiveMargin: number;
}

/**
 * The Atlas creates one image from a set of icons.
 * After creating holds information about positions of each icon in the image.
 */
export class Atlas {
    public image?: HTMLCanvasElement; // Image of icons
    public size: Vec2; // Size of image
    public sprites: Sprite[]; // Information about each icon

    private _promise: Promise<any>;

    constructor(icons: Icon[]) {
        this.sprites = [];

        this._promise = Promise.all<any>(icons.map((icon) => this._imageLoad(icon.image)))
            .then(() => this._createSprite(icons));
    }

    /**
     * Returns a promise that will be resolve after all images loading done
     */
    public whenReady() {
        return this._promise;
    }

    private _imageLoad(image: HTMLImageElement) {
        if (image.complete) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            image.addEventListener('load', resolve);
        });
    }

    private _createSprite(icons: Icon[]) {
        const margin = 2;

        const arr: any = icons.map((icon) => {
            const imageSize = [icon.image.width, icon.image.height];
            const size = icon.size || imageSize;

            return {
                // Data for bin-pack
                width: size[0] + margin * 2,
                height: size[1] + margin * 2,

                // Data that we need after bin-pack
                image: icon.image,
                anchor: icon.anchor || [0.5, 0.5],
                size,
                imageSize,
                interactiveMargin: icon.interactiveMargin || 0,
                pixelDensity: icon.pixelDensity || 1,
            };
        });

        const packed = pack(arr, { inPlace: true });
        this.size = [packed.width, packed.height];

        // Sum margins that get texture coordinates without margins
        this.sprites = arr.map((icon) => ({
            position: [icon.x + margin, icon.y + margin],
            size: icon.size,
            anchor: icon.anchor,
            interactiveMargin: icon.interactiveMargin,
            pixelDensity: icon.pixelDensity,
        }));

        const canvas = this.image = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return;
        }

        canvas.width = packed.width;
        canvas.height = packed.height;

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        arr.forEach((icon) => {
            ctx.drawImage(icon.image,
                0, 0, icon.imageSize[0], icon.imageSize[1],
                icon.x + margin, icon.y + margin, icon.size[0], icon.size[1],
            );
        });
    }
}
