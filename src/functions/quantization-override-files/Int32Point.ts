import { constants } from "image-q";

export interface PointRGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export class Point implements PointRGBA {
  uint32: number;

  get r(): number {
    return this.uint32 & 0xff;
  }

  set r(value: number) {
    const r = value | 0;
    this.uint32 = (this.uint32 & 0xffffff00) | (r & 0xff);
  }

  get g(): number {
    return (this.uint32 >>> 8) & 0xff;
  }

  set g(value: number) {
    const g = value | 0;
    this.uint32 = (this.uint32 & 0xffff00ff) | ((g & 0xff) << 8);
  }

  get b(): number {
    return (this.uint32 >>> 16) & 0xff;
  }

  set b(value: number) {
    const b = value | 0;
    this.uint32 = (this.uint32 & 0xff00ffff) | ((b & 0xff) << 16);
  }

  get a(): number {
    return (this.uint32 >>> 24) & 0xff;
  }

  set a(value: number) {
    const a = value | 0;
    this.uint32 = (this.uint32 & 0x00ffffff) | ((a & 0xff) << 24);
  }

  // TODO?: would need to return a proxy object actually, assuming this value would be used like that
  get rgba(): number[] {
    return [this.r, this.g, this.b, this.a];
  }

  set rgba(value: number[]) {
    const r = value[0] | 0;
    const g = value[1] | 0;
    const b = value[2] | 0;
    const a = value[3] | 0;
    this.uint32 = ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
  }

  static createByQuadruplet(quadruplet: number[]) {
    const point = new Point();
    point.rgba = quadruplet;
    return point;
  }

  static createByRGBA(red: number, green: number, blue: number, alpha: number) {
    const point = new Point();
    const r = red | 0;
    const g = green | 0;
    const b = blue | 0;
    const a = alpha | 0;
    point.uint32 = ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
    return point;
  }

  static createByUint32(uint32: number) {
    const point = new Point();
    point.uint32 = uint32 >>> 0;
    return point;
  }

  constructor() {
    this.uint32 = -1 >>> 0;
  }

  from(point: Point) {
    this.uint32 = point.uint32;
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
