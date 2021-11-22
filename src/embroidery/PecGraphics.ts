const blank = [
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0xF0, 0xFF, 0xFF, 0xFF, 0xFF, 0x0F,
    0x08, 0x00, 0x00, 0x00, 0x00, 0x10,
    0x04, 0x00, 0x00, 0x00, 0x00, 0x20,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x40,
    0x04, 0x00, 0x00, 0x00, 0x00, 0x20,
    0x08, 0x00, 0x00, 0x00, 0x00, 0x10,
    0xF0, 0xFF, 0xFF, 0xFF, 0xFF, 0x0F,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00
]


export function get_blank() {
    let m = new Uint8Array(blank.length);
    for (let i = 0; i < blank.length; i++) {
        m[i] = blank[i];
    }
    return m;
}


export function create(width, height) {
    width /= 8
    return new Array(width * height).fill(0x00);
}


export function draw(points, graphic, stride=6) {
    for (let point of points) {
        try {
            graphic_mark_bit(graphic,
                parseInt(point.x),
                parseInt(point.y),
                stride)
        }
        catch(e) {
            graphic_mark_bit(graphic,
                parseInt(point[0]),
                parseInt(point[1]),
                stride)
        }
    }
}


export function draw_scaled(extents, points, graphic, stride, buffer=5) {
    if (extents === null) {
        draw(points, graphic, stride)
        return
    }
    let left = null;
    let top = null;
    let right = null;
    let bottom = null;
    // try {
    //     left = extents.left
    //     top = extents.top
    //     right = extents.right
    //     bottom = extents.bottom
    // }
    // catch (e) {
        left = extents[0]
        top = extents[1]
        right = extents[2]
        bottom = extents[3]
    // }

    let diagram_width = right - left
    let diagram_height = bottom - top

    const graphic_width = stride * 8
    const graphic_height = graphic.length / stride

    if (diagram_width == 0)
        diagram_width = 1
    if (diagram_height == 0)
        diagram_height = 1

    const scale_x = (graphic_width - buffer) / diagram_width
    const scale_y = (graphic_height - buffer) / diagram_height

    const scale = Math.min(scale_x, scale_y)

    const cx = (right + left) / 2
    const cy = (bottom + top) / 2

    let translate_x = -cx
    let translate_y = -cy

    translate_x *= scale
    translate_y *= scale

    translate_x += graphic_width / 2
    translate_y += graphic_height / 2

    for (let point of points) {
        // try {
        //     graphic_mark_bit(graphic,
        //         Math.floor((point.x * scale) + translate_x),
        //         Math.floor((point.y * scale) + translate_y),
        //         stride)
        // }
        // catch (e) {
            graphic_mark_bit(graphic,
                Math.floor((point[0] * scale) + translate_x),
                Math.floor((point[1] * scale) + translate_y),
                stride)
        // }
    }
}


export function clear(graphic) {
    for (let b of graphic) {
        b = 0
    }
}


export function graphic_mark_bit(graphic, x, y, stride=6) {
    // expressly sets the bit in the give graphic object"""
    graphic[(y * stride) + Math.floor(x / 8)] |= 1 << (x % 8)
}


export function graphic_unmark_bit(graphic, x, y, stride=6) {
    // expressly unsets the bit in the give graphic object"""
    graphic[(y * stride) + x / 8] &= ~(1 << (x % 8))
}


export function get_graphic_as_string(graphic, one="#", zero=" ") {
    console.error("NOT IMPLEMENTED: get_graphic_as_string")
    // // Prints graphic object in text."""
    // let stride = 6
    // if (typeof(graphic) === "object") {
    //     stride = graphic[1]
    //     graphic = graphic[0]
    // }

    // if (typeof(graphic) === "string") {
    //     console.warn("Maybe dodgy");
    //     graphic = Array.from(graphic);
    // }

    // const list_string = [
    //     one if (byte >> i) & 1 else zero
    //     for byte in graphic
    //     for i in range(0, 8)
    // ]
    // bit_stride = 8 * stride
    // bit_length = 8 * len(graphic)
    // return '\n'.join(
    //     ''.join(list_string[m:m + bit_stride])
    //     for m in range(0, bit_length, bit_stride))
}