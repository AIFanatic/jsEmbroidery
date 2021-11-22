import { get_thread_set } from "./EmbThreadPec";
import { read_string_8, read_int_8, read_int_24le } from './ReadHelper'
import { StringHelpers } from "./StringHelpers";

import { EmbThreadPec } from "./EmbThreadPec";
import { EmbPattern } from "./EmbPattern";

import { PyFile } from "./PyFile";

const JUMP_CODE = 0x10
const TRIM_CODE = 0x20
const FLAG_LONG = 0x80


export function read(f, out, settings=null) {
    const pec_string = read_string_8(f, 8)
    // pec_string must equal //PEC0001
    read_pec(f, out)
    out.convert_duplicate_color_change_to_stop()
}


export function read_pec(f, out, pes_chart=null) {
    f.seek(3, 1)  // LA:
    const label = read_string_8(f, 16)  // Label
    if (label != null) {
        out.metadata("Label", StringHelpers.strip(label))
    }
    f.seek(0xF, 1)  // Dunno, spaces then 0xFF 0x00
    const pec_graphic_byte_stride = read_int_8(f)
    const pec_graphic_icon_height = read_int_8(f)
    f.seek(0xC, 1)
    const color_changes = read_int_8(f)
    const count_colors = color_changes + 1  // PEC uses cc - 1, 0xFF means 0.
    const color_bytes = new Uint8Array(f.read(count_colors))
    const threads = []
    map_pec_colors(color_bytes, out, pes_chart, threads)
    f.seek(0x1D0 - color_changes, 1)
    const stitch_block_end = read_int_24le(f) - 5 + f.tell()
    // The end of this value is already 5 into the stitchblock.

    // 3 bytes, '\x31\xff\xf0', 6 2-byte shorts. 15 total.
    f.seek(0x0F, 1)
    read_pec_stitches(f, out)
    f.seek(stitch_block_end, 0)

    const byte_size = pec_graphic_byte_stride * pec_graphic_icon_height

    read_pec_graphics(f,
                      out,
                      byte_size,
                      pec_graphic_byte_stride,
                      count_colors + 1,
                      threads
                      )
}


function read_pec_graphics(f, out, size, stride, count, values: EmbThreadPec[]) {
    // const v = values[:]
    const v = values
    console.log(values)
    // v.insert(0, null)
    v.splice(0, 0, null);
    for (let i = 0; i < count; i++) {
        const graphic = new Uint8Array(f.read(size))
        if (f !== null) {
            out.metadata(i, [graphic, stride, v[i]])
        }
    }
}


function process_pec_colors(colorbytes, out, values: EmbThreadPec[]) {
    const thread_set = get_thread_set()
    const max_value = thread_set.length
    for (let byte of colorbytes) {
        const thread_value = thread_set[byte % max_value]
        out.add_thread(thread_value)
        values.push(thread_value)
    }
}


function process_pec_table(colorbytes, out, chart, values) {
    // This is how PEC actually allocates pre-defined threads to blocks.
    const thread_set = get_thread_set()
    const max_value = thread_set.length
    const thread_map = {}
    for (let i = 0; i < colorbytes.length; i++) {
        const color_index = colorbytes[i] % max_value
        let thread_value = thread_map[color_index] ? thread_map[color_index] : null;
        if (thread_value === null) {
            if (chart.length > 0)
                thread_value = chart.pop(0)
            else
                thread_value = thread_set[color_index]
            thread_map[color_index] = thread_value
        }
        out.add_thread(thread_value)
        values.append(thread_value)
    }
}


function map_pec_colors(colorbytes, out, chart, values) {
    if (chart === null || chart.length == 0) {
        // Reading pec colors.
        process_pec_colors(colorbytes, out, values)
    }
    else if (chart.length >= colorbytes.length) {
        // Reading threads in 1 : 1 mode.
        for (let thread of chart) {
            out.add_thread(thread)
            values.append(thread)
        }
    }
    else {
        // Reading tabled mode threads.
        process_pec_table(colorbytes, out, chart, values)
    }
}


function signed12(b) {
    b &= 0xFFF
    if (b > 0x7FF)
        return - 0x1000 + b
    else
        return b
}


function signed7(b) {
    if (b > 63)
        return - 128 + b
    else
        return b
}


function read_pec_stitches(f: PyFile, out: EmbPattern) {
    while (1) {
        let val1 = read_int_8(f)
        let val2 = read_int_8(f)
        let val3 = null;
        if ((val1 == 0xFF && val2 == 0x00) || val2 === null) {
            break
        }
        if (val1 == 0xFE && val2 == 0xB0) {
            f.seek(1, 1)
            out.color_change(0, 0)
            continue
        }
        let jump = false;
        let trim = false;
        let x = null;
        let y = null;
        let code = null;
        if ((val1 & FLAG_LONG) != 0) {
            if ((val1 & TRIM_CODE) != 0) {
                trim = true
            }
            if ((val1 & JUMP_CODE) != 0) {
                jump = true
            }
            code = (val1 << 8) | val2
            x = signed12(code)
            val2 = read_int_8(f)
            if (val2 === null) {
                break
            }
        }
        else {
            x = signed7(val1)
        }

        if ((val2 & FLAG_LONG) != 0) {
            if ((val2 & TRIM_CODE) != 0) {
                trim = true
            }
            if ((val2 & JUMP_CODE) != 0) {
                jump = true
            }
            val3 = read_int_8(f)
            if (val3 === null) {
                break
            }
            code = val2 << 8 | val3
            y = signed12(code)
        }
        else {
            y = signed7(val2)
        }
        if (jump) {
            out.move(x, y)
        }
        else if (trim) {
            out.trim()
            out.move(x, y)
        }
        else {
            out.stitch(x, y)
        }
    }
    out.end()
}