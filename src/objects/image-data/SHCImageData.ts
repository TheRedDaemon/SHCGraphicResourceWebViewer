export default interface SHCImageData {
  width(): number;
  height(): number;
  data(): Uint16Array;
}
