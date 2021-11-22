export function signed8(b) {
    if (b > 127)
        return -256 + b
    else
        return b
}


export function signed16(v) {
    v &= 0xFFFF
    if (v > 0x7FFF)
        return - 0x10000 + v
    else
        return v
}


export function signed24(v) {
    v &= 0xFFFFFF
    if (v > 0x7FFFFF)
        return - 0x1000000 + v
    else
        return v
}


export function read_signed(stream, n) {
    const byte = new Uint8Array(stream.read(n))
    let signed_bytes = []
    for (let b of byte) {
        signed_bytes.push(signed8(b))
    }
    return signed_bytes;
}


export function read_sint_8(stream) {
    const byte = new Uint8Array(stream.read(1))
    if (byte.length == 1)
        return signed8(byte[0])
    return null;
}


export function read_int_8(stream) {
    const byte = new Uint8Array(stream.read(1))
    if (byte.length == 1)
        return byte[0]
    return null;
}


export function read_int_16le(stream) {
    const byte = new Uint8Array(stream.read(2))
    if (byte.length == 2)
        return (byte[0] & 0xFF) + ((byte[1] & 0xFF) << 8)
    return null;
}


export function read_int_16be(stream) {
    const byte = new Uint8Array(stream.read(2))
    if (byte.length == 2)
        return (byte[1] & 0xFF) + ((byte[0] & 0xFF) << 8)
    return null
}


export function read_int_24le(stream) {
    const b = new Uint8Array(stream.read(3))
    if (b.length == 3)
        return (b[0] & 0xFF) + ((b[1] & 0xFF) << 8) + ((b[2] & 0xFF) << 16)
    return null;
}


export function read_int_24be(stream) {
    const b = new Uint8Array(stream.read(3))
    if (b.length == 3)
        return (b[2] & 0xFF) + ((b[1] & 0xFF) << 8) + ((b[0] & 0xFF) << 16)
    return null;
}


export function read_int_32le(stream) {
    const b = new Uint8Array(stream.read(4))
    if (b.length == 4)
        return (b[0] & 0xFF) + ((b[1] & 0xFF) << 8) + ((b[2] & 0xFF) << 16) + ((b[3] & 0xFF) << 24)
    return null;
}


export function read_int_32be(stream) {
    const b = new Uint8Array(stream.read(4))
    if (b.length == 4)
        return (b[3] & 0xFF) + ((b[2] & 0xFF) << 8) + ((b[1] & 0xFF) << 16) + ((b[0] & 0xFF) << 24)
    return null;
}


export function read_string_8(stream, length) {
    const byte = stream.read(length)
    try {
        return String.fromCharCode(...byte);
    }
    catch(e) {
        console.error("read_string_8", e)
        return null;  // Must be > 128 chars.
    }
}


export function read_string_16(stream, length) {
    const byte = stream.read(length)
    try {
        return byte.decode('utf16')
    }
    catch {
        console.error("read_string_16")
        return null;
    }
}