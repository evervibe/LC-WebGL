import { TextDecoder } from 'node:util';

const decoder = new TextDecoder('utf-8');

export class BinaryReader {
  constructor(buffer) {
    if (buffer instanceof ArrayBuffer) {
      this.buffer = buffer;
      this.byteOffset = 0;
      this.byteLength = buffer.byteLength;
    } else if (ArrayBuffer.isView(buffer)) {
      this.buffer = buffer.buffer;
      this.byteOffset = buffer.byteOffset;
      this.byteLength = buffer.byteLength;
    } else {
      throw new TypeError('BinaryReader expects an ArrayBuffer or typed array.');
    }

    this.view = new DataView(this.buffer, this.byteOffset, this.byteLength);
    this.offset = 0;
  }

  clone(offset = this.offset) {
    const reader = new BinaryReader(new Uint8Array(this.buffer, this.byteOffset, this.byteLength));
    reader.offset = offset;
    return reader;
  }

  tell() {
    return this.offset;
  }

  seek(newOffset) {
    this.offset = newOffset;
  }

  skip(bytes) {
    this.offset += bytes;
  }

  remaining() {
    return this.byteLength - this.offset;
  }

  readUint8() {
    const value = this.view.getUint8(this.offset);
    this.offset += 1;
    return value;
  }

  readInt8() {
    const value = this.view.getInt8(this.offset);
    this.offset += 1;
    return value;
  }

  readUint16() {
    const value = this.view.getUint16(this.offset, true);
    this.offset += 2;
    return value;
  }

  readInt16() {
    const value = this.view.getInt16(this.offset, true);
    this.offset += 2;
    return value;
  }

  readUint32() {
    const value = this.view.getUint32(this.offset, true);
    this.offset += 4;
    return value;
  }

  readInt32() {
    const value = this.view.getInt32(this.offset, true);
    this.offset += 4;
    return value;
  }

  readFloat32() {
    const value = this.view.getFloat32(this.offset, true);
    this.offset += 4;
    return value;
  }

  readFloat32Array(length) {
    const values = new Float32Array(length);
    for (let i = 0; i < length; i += 1) {
      values[i] = this.view.getFloat32(this.offset, true);
      this.offset += 4;
    }
    return values;
  }

  readUint16Array(length) {
    const values = new Uint16Array(length);
    for (let i = 0; i < length; i += 1) {
      values[i] = this.view.getUint16(this.offset, true);
      this.offset += 2;
    }
    return values;
  }

  readUint8Array(length) {
    const bytes = length;
    const array = new Uint8Array(this.buffer, this.byteOffset + this.offset, length);
    const copy = Uint8Array.from(array);
    this.offset += bytes;
    return copy;
  }

  readLengthPrefixedString() {
    const length = this.readInt32();
    if (length === 0) {
      return '';
    }
    const bytes = new Uint8Array(this.buffer, this.byteOffset + this.offset, length);
    const text = decoder.decode(bytes);
    this.offset += length;
    return text;
  }

  readFixedString(length) {
    const bytes = new Uint8Array(this.buffer, this.byteOffset + this.offset, length);
    const text = decoder.decode(bytes).replace(/\0+$/, '');
    this.offset += length;
    return text;
  }

  readStruct(structDef) {
    const { value, offset } = structDef.read(this.view, this.offset);
    this.offset = offset;
    return value;
  }

  slice(byteLength) {
    const slice = new Uint8Array(this.buffer, this.byteOffset + this.offset, byteLength);
    this.offset += byteLength;
    return slice;
  }
}

export default BinaryReader;
