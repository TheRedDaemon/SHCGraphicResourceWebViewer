import { constants } from "image-q";

export interface PointRGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export class Point implements PointRGBA {
  private _r: number;
  private _g: number;
  private _b: number;
  private _a: number;

  constructor() {
    this._r = 0;
    this._g = 0;
    this._b = 0;
    this._a = 0;
  }

  get r(): number {
    return this._r;
  }

  set r(value: number) {
    this._r = value | 0;
  }

  get g(): number {
    return this._g;
  }

  set g(value: number) {
    this._g = value | 0;
  }

  get b(): number {
    return this._b;
  }

  set b(value: number) {
    this._b = value | 0;
  }

  get a(): number {
    return this._a;
  }

  set a(value: number) {
    this._a = value | 0;
  }

  get rgba(): number[] {
    return [this._r, this._g, this._b, this._a];
  }

  set rgba(value: number[]) {
    this._r = value[0] | 0;
    this._g = value[1] | 0;
    this._b = value[2] | 0;
    this._a = value[3] | 0;
  }

  get uint32(): number {
    return ((this.a << 24) | (this.b << 16) | (this.g << 8) | this.r) >>> 0;
  }

  set uint32(value: number) {
    this._a = (value >>> 24) & 0xff;
    this._b = (value >>> 16) & 0xff;
    this._g = (value >>> 8) & 0xff;
    this._r = value & 0xff;
  }

  static createByQuadruplet(quadruplet: number[]) {
    const point = new Point();
    point.rgba = quadruplet;
    return point;
  }

  static createByRGBA(red: number, green: number, blue: number, alpha: number) {
    const point = new Point();
    point.r = red;
    point.g = green;
    point.b = blue;
    point.a = alpha;
    return point;
  }

  static createByUint32(uint32: number) {
    const point = new Point();
    point.uint32 = uint32;
    return point;
  }

  from(point: Point) {
    this.r = point.r;
    this.g = point.g;
    this.b = point.b;
    this.a = point.a;
  }

  getLuminosity(useAlphaChannel: boolean) {
    let r = this.r;
    let g = this.g;
    let b = this.b;

    if (useAlphaChannel) {
      r = Math.min(255, 255 - this.a + (this.a * r) / 255);
      g = Math.min(255, 255 - this.a + (this.a * g) / 255);
      b = Math.min(255, 255 - this.a + (this.a * b) / 255);
    }

    return (
      r * constants.bt709.Y.RED +
      g * constants.bt709.Y.GREEN +
      b * constants.bt709.Y.BLUE
    );
  }
}
