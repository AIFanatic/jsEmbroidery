import { StringHelpers } from "./StringHelpers"

export function write_int_array_8(stream, int_array) {
    for (let value of int_array) {
        // const v = bytes(bytearray([
        //     value & 0xFF,
        // ]))
        // stream.write(v)
        stream.write ([value & 0xFF])
    }
}


export function write_int_8(stream, value) {
    // const v = bytes(bytearray([
    //     value & 0xFF,
    // ]))
    // stream.write(v)
    stream.write ([value & 0xFF])
}


export function write_int_16le(stream, value) {
    // const v = bytes(bytearray([
    //     (value >> 0) & 0xFF,
    //     (value >> 8) & 0xFF,
    // ]))
    // stream.write(v)
    stream.write ([(value >> 0) & 0xFF, (value >> 8) & 0xFF])
}


export function write_int_16be(stream, value) {
    // const v = bytes(bytearray([
    //     (value >> 8) & 0xFF,
    //     (value >> 0) & 0xFF,
    // ]))
    // stream.write(v)
    stream.write ([(value >> 8) & 0xFF, (value >> 0) & 0xFF])
}


export function write_int_24le(stream, value) {
    // const v = bytes(bytearray([
    //     (value >> 0) & 0xFF,
    //     (value >> 8) & 0xFF,
    //     (value >> 16) & 0xFF,
    // ]))
    // stream.write(v)
    stream.write ([(value >> 0) & 0xFF, (value >> 8) & 0xFF, (value >> 16) & 0xFF])
}


export function write_int_24be(stream, value) {
    // const v = bytes(bytearray([
    //     (value >> 16) & 0xFF,
    //     (value >> 8) & 0xFF,
    //     (value >> 0) & 0xFF,
    // ]))
    // stream.write(v)
    stream.write ([(value >> 16) & 0xFF, (value >> 8) & 0xFF, (value >> 0) & 0xFF])
}


export function write_int_32le(stream, value) {
    // const v = bytes(bytearray([
    //     (value >> 0) & 0xFF,
    //     (value >> 8) & 0xFF,
    //     (value >> 16) & 0xFF,
    //     (value >> 24) & 0xFF
    // ]))
    // stream.write(v)
    stream.write ([(value >> 0) & 0xFF, (value >> 8) & 0xFF, (value >> 16) & 0xFF, (value >> 24) & 0xFF])
}


export function write_int_32be(stream, value) {
    // const v = bytes(bytearray([
    //     (value >> 24) & 0xFF,
    //     (value >> 16) & 0xFF,
    //     (value >> 8) & 0xFF,
    //     (value >> 0) & 0xFF
    // ]))
    // stream.write(v)
    stream.write ([(value >> 24) & 0xFF, (value >> 16) & 0xFF, (value >> 8) & 0xFF, (value >> 0) & 0xFF])
}


export function write_float_32le(stream, value) {
    stream.write(new Uint8Array(new Float32Array([value]).buffer))
    // stream.write(struct.pack("<f", float(value)))
}


export function write_string(stream, string, encoding='utf8') {
    console.error("NOT IMPLEMENTED: write_string");
    // // python 2,3 code
    // try {
    //     stream.write(bytes(string).encode(encoding))
    // }
    // catch (e) {
    //     stream.write(bytes(string, encoding))
    // }
}


export function write_string_utf8(stream, string) {
    stream.write(StringHelpers.AsciiToBytes(string));
    // // python 2,3 code
    // try {
    //     stream.write(bytes(string).encode('utf8'))
    // }
    // catch (e) {
    //     stream.write(bytes(string, 'utf8'))
    // }
}