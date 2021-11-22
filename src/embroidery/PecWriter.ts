import { EmbPattern } from "./EmbPattern";
import { EmbConstant } from "./EmbConstant";
import { get_thread_set } from "./EmbThreadPec";
import { get_blank, draw_scaled } from "./PecGraphics";
import { StringHelpers } from "./StringHelpers";
import { write_int_8, write_int_16le, write_int_16be, write_int_24le, write_string_utf8 } from "./WriteHelper";

const SEQUIN_CONTINGENCY = EmbConstant.CONTINGENCY_SEQUIN_JUMP
const FULL_JUMP = true
const MAX_JUMP_DISTANCE = 2047
const MAX_STITCH_DISTANCE = 2047

const MASK_07_BIT = 0b01111111
const JUMP_CODE = 0b00010000
const TRIM_CODE = 0b00100000
const FLAG_LONG = 0b10000000
const PEC_ICON_WIDTH = 48
const PEC_ICON_HEIGHT = 38

function write(pattern, f, settings=null) {
    f.write(StringHelpers.AsciiToBytes("#PEC0001"))
    pattern = pattern.copy()
    pattern.convert_stop_to_color_change()
    write_pec(pattern, f)
}


export function write_pec(pattern, f, threadlist=null) {
    if (threadlist === null) {
        pattern.fix_color_count()
        threadlist = pattern.threadlist
    }
    const extents = pattern.extents()

    write_pec_header(pattern, f, threadlist)
    write_pec_block(pattern, f, extents)
    write_pec_graphics(pattern, f, extents)
}


function write_pec_header(pattern, f, threadlist) {
    const name = pattern.get_metadata("name", "Untitled")
    // write_string_utf8(f, "LA:%-16s\r" % name[:8])
    write_string_utf8(f, `LA:${name.substring(0,8)}        \r`);
    f.write([0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0xFF, 0x00])
    write_int_8(f, PEC_ICON_WIDTH / 8)  // PEC BYTE STRIDE
    write_int_8(f, PEC_ICON_HEIGHT)  // PEC ICON HEIGHT

    const thread_set = get_thread_set()

    if (thread_set.length <= threadlist.length) {
        threadlist = thread_set;
        // Data is corrupt. Cheat so it won't crash.
    }

    const chart = new Array(thread_set.length).fill(null);
    // for (let thread of set(threadlist)) {
    for (let thread of threadlist) {
        const index = thread.find_nearest_color_index(thread_set)
        thread_set[index] = null
        chart[index] = thread
    }

    const color_index_list = []
    for (let thread of threadlist) {
        color_index_list.push(thread.find_nearest_color_index(chart))
    }

    const current_thread_count = color_index_list.length;
    if (current_thread_count != 0) {
        f.write([0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20])
        const add_value = current_thread_count - 1
        // color_index_list.insert(0, add_value)
        color_index_list.splice(0, 0, add_value);
        f.write(color_index_list)
    }
    else {
        f.write([0x20, 0x20, 0x20, 0x20, 0x64, 0x20, 0x00, 0x20, 0x00, 0x20, 0x20, 0x20, 0xFF])
    }

    for (let i = current_thread_count; i < 463; i++) {
        f.write([0x20])  // 520
    }
}


function write_pec_block(pattern, f, extents) {
    const width = extents[2] - extents[0]
    const height = extents[3] - extents[1]

    const stitch_block_start_position = f.tell()
    f.write([0x00, 0x00])
    write_int_24le(f, 0)  // Space holder.
    f.write([0x31, 0xff, 0xf0])
    write_int_16le(f, Math.round(width))
    write_int_16le(f, Math.round(height))
    write_int_16le(f, 0x1E0)
    write_int_16le(f, 0x1B0)

    write_int_16be(f, 0x9000 | -Math.round(extents[0]))
    write_int_16be(f, 0x9000 | -Math.round(extents[1]))

    pec_encode(pattern, f)

    const stitch_block_length = f.tell() - stitch_block_start_position

    const current_position = f.tell()
    f.seek(stitch_block_start_position + 2, 0)
    write_int_24le(f, stitch_block_length)
    f.seek(current_position, 0)
}


function write_pec_graphics(pattern: EmbPattern, f, extents) {
    let blank = get_blank()
    for (let block of pattern.get_as_stitchblock()) {
        const stitches = block[0]
        draw_scaled(extents, stitches, blank, 6, 4)
    }
    f.write(blank)

    for (let block of pattern.get_as_colorblocks()) {
        // const stitches = [s for s in block[0] if s[2] == STITCH]
        let stitches = [];
        for (let s of block[0]) {
            if (s[2] === EmbConstant.STITCH) {
                stitches.push(s);
            }
        }
        const blank = get_blank()  // [ 0 ] * 6 * 38
        draw_scaled(extents, stitches, blank, 6)
        f.write(blank)
    }
}


function encode_long_form(value) {
    value &= 0b0000111111111111
    value |= 0b1000000000000000
    return value
}


function flag_jump(longForm) {
    return longForm | (JUMP_CODE << 8)
}


function flag_trim(longForm) {
    return longForm | (TRIM_CODE << 8)
}


function pec_encode(pattern, f) {
    let color_two = true
    let xx = 0
    let yy = 0
    for (let stitch of pattern.stitches) {
        const x = stitch[0]
        const y = stitch[1]
        let data = stitch[2]
        let dx = Math.round(x - xx)
        let dy = Math.round(y - yy)
        xx += dx
        yy += dy
        if (data === EmbConstant.STITCH || data === EmbConstant.JUMP || data === EmbConstant.TRIM) {
            // if (data == STITCH && -64 < dx < 63 && -64 < dy < 63) {
            if (data == EmbConstant.STITCH && ((-64 < dx) && (dx < 63)) && ((-64 < dy) && (dy < 63))) {
                f.write([dx & MASK_07_BIT, dy & MASK_07_BIT])
            }
            else {
                dx = encode_long_form(dx)
                dy = encode_long_form(dy)

                if (data == EmbConstant.JUMP) {
                    dx = flag_jump(dx)
                    dy = flag_jump(dy)
                }
                else if (data == EmbConstant.TRIM) {
                    dx = flag_trim(dx)
                    dy = flag_trim(dy)
                }

                data = [
                    (dx >> 8) & 0xFF,
                    dx & 0xFF,
                    (dy >> 8) & 0xFF,
                    dy & 0xFF]
                f.write(data)
            }
        }
        else if (data == EmbConstant.COLOR_CHANGE) {
            f.write([0xfe, 0xb0])
            if (color_two)
                f.write([0x02])
            else
                f.write([0x01])
            color_two = !color_two
        }
        else if (data == EmbConstant.STOP) {
            // This should never happen because we've converted each STOP into a
            // color change to the same color.
            console.warn("This should never happen because we've converted each STOP into a")
        }
        else if (data == EmbConstant.END)
            f.write([0xff])
    }
}