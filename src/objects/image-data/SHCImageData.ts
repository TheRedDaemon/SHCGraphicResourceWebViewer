export default interface SHCImageData {
  get width(): number;
  get height(): number;
  drawOnContext(context: CanvasRenderingContext2D, x: number, y: number): void;
}
