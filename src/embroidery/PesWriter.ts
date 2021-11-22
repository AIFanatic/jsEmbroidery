import { EmbPattern } from "./EmbPattern";
import { EmbConstant } from "./EmbConstant";
import { get_thread_set } from "./EmbThreadPec";
import { write_pec } from "./PecWriter";
import { StringHelpers } from "./StringHelpers";
import { write_string_utf8, write_int_32le, write_int_16le, write_int_8, write_float_32le } from "./WriteHelper";

const SEQUIN_CONTINGENCY = EmbConstant.CONTINGENCY_SEQUIN_JUMP
const FULL_JUMP = true
const MAX_JUMP_DISTANCE = 2047
const MAX_STITCH_DISTANCE = 2047

const VERSION_1 = 1
const VERSION_6 = 6

const PES_VERSION_1_SIGNATURE = "#PES0001"
const PES_VERSION_6_SIGNATURE = "#PES0060"

const EMB_ONE = "CEmbOne"
const EMB_SEG = "CSewSeg"


export function write(pattern, f, settings=null) {
    pattern = pattern.copy()
    pattern.convert_stop_to_color_change()

    let version = null;
    let truncated = null;
    if (settings !== null) {
        version = settings.get("pes version", VERSION_1)
        truncated = settings.get("truncated", false)
    }
    else {
        version = VERSION_1
        truncated = false
    }
    if (truncated) {
        if (version == VERSION_1)
            write_truncated_version_1(pattern, f)
        else if (version == VERSION_6)
            write_truncated_version_6(pattern, f)
    }
    else {
        if (version == VERSION_1)
            write_version_1(pattern, f)
        else if (version == VERSION_6)
            write_version_6(pattern, f)
    }
}


function write_truncated_version_1(pattern, f) {
    write_string_utf8(f, PES_VERSION_1_SIGNATURE)
    f.write([0x16, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
    write_pec(pattern, f)
}


function write_truncated_version_6(pattern, f) {
    const chart = pattern.threadlist
    write_string_utf8(f, PES_VERSION_6_SIGNATURE)
    const placeholder_pec_block = f.tell()
    write_int_32le(f, 0)  // Placeholder for PEC BLOCK
    write_pes_header_v6(pattern, f, chart, 0)
    write_int_16le(f, 0x0000)
    write_int_16le(f, 0x0000)
    const current_position = f.tell()
    f.seek(placeholder_pec_block, 0)
    write_int_32le(f, current_position)
    f.seek(current_position, 0)
    // this might need that node table thing.
    write_pec(pattern, f)
}


function write_version_1(pattern, f) {
    const chart = get_thread_set()
    write_string_utf8(f, PES_VERSION_1_SIGNATURE)

    const extents = pattern.extents()
    const cx = (extents[2] + extents[0]) / 2.0
    const cy = (extents[3] + extents[1]) / 2.0

    const left = extents[0] - cx
    const top = extents[1] - cy
    const right = extents[2] - cx
    const bottom = extents[3] - cy

    const placeholder_pec_block = f.tell()
    write_int_32le(f, 0)  // Placeholder for PEC BLOCK

    if (pattern.stitches.length == 0) {
        write_pes_header_v1(f, 0)
        write_int_16le(f, 0x0000)
        write_int_16le(f, 0x0000)
    }
    else {
        write_pes_header_v1(f, 1)
        write_int_16le(f, 0xFFFF)
        write_int_16le(f, 0x0000)
        write_pes_blocks(f, pattern, chart, left, top, right, bottom, cx, cy)
    }

    const current_position = f.tell()
    f.seek(placeholder_pec_block, 0)
    write_int_32le(f, current_position)
    f.seek(current_position, 0)

    write_pec(pattern, f)
}


function write_version_6(pattern, f) {
    pattern.fix_color_count()
    const chart = pattern.threadlist
    write_string_utf8(f, PES_VERSION_6_SIGNATURE)

    const extents = pattern.extents()
    const cx = (extents[2] + extents[0]) / 2.0
    const cy = (extents[3] + extents[1]) / 2.0

    const left = extents[0] - cx
    const top = extents[1] - cy
    const right = extents[2] - cx
    const bottom = extents[3] - cy

    const placeholder_pec_block = f.tell()
    write_int_32le(f, 0)  // Placeholder for PEC BLOCK

    if (pattern.stitches.length == 0) {
        write_pes_header_v6(pattern, f, chart, 0)
        write_int_16le(f, 0x0000)
        write_int_16le(f, 0x0000)
    }
    else {
        write_pes_header_v6(pattern, f, chart, 1)
        write_int_16le(f, 0xFFFF)
        write_int_16le(f, 0x0000)
        const log = write_pes_blocks(f, pattern, chart, left, top, right, bottom, cx, cy)
        // In version 6 there is some node, tree, order thing.
        write_int_32le(f, 0)
        write_int_32le(f, 0)
        for (let i = 0; i < log.length; i++) {
            write_int_32le(f, i)
            write_int_32le(f, 0)
        }
    }

    const current_position = f.tell()
    f.seek(placeholder_pec_block, 0)
    write_int_32le(f, current_position)
    f.seek(current_position, 0)
    write_pec(pattern, f)
}


function write_pes_header_v1(f, distinct_block_objects) {
    write_int_16le(f, 0x01)  // scale to fit
    write_int_16le(f, 0x01)  // 0 = 100x100, 130x180 hoop
    write_int_16le(f, distinct_block_objects)
}


function write_pes_header_v6(pattern, f, chart, distinct_block_objects) {
    write_int_16le(f, 0x01)  // 0 = 100x100, 130x180 hoop
    f.write([0x02])  // This is an 2-digit ascii number.
    write_pes_string_8(f, pattern.get_metadata("name", null))
    write_pes_string_8(f, pattern.get_metadata("category", null))
    write_pes_string_8(f, pattern.get_metadata("author", null))
    write_pes_string_8(f, pattern.get_metadata("keywords", null))
    write_pes_string_8(f, pattern.get_metadata("comments", null))
    write_int_16le(f, 0)  // OptimizeHoopChange = False
    write_int_16le(f, 0)  // Design Page Is Custom = False
    write_int_16le(f, 0x64)  // Hoop Width
    write_int_16le(f, 0x64)  // Hoop Height
    write_int_16le(f, 0)  // Use Existing Design Area = False
    write_int_16le(f, 0xC8)  // designWidth
    write_int_16le(f, 0xC8)  // designHeight
    write_int_16le(f, 0x64)  // designPageSectionWidth
    write_int_16le(f, 0x64)  // designPageSectionHeight
    write_int_16le(f, 0x64)  // p6 // 100
    write_int_16le(f, 0x07)  // designPageBackgroundColor
    write_int_16le(f, 0x13)  // designPageForegroundColor
    write_int_16le(f, 0x01)  // ShowGrid
    write_int_16le(f, 0x01)  // WithAxes
    write_int_16le(f, 0x00)  // SnapToGrid
    write_int_16le(f, 100)  // GridInterval
    write_int_16le(f, 0x01)  // p9 curves?
    write_int_16le(f, 0x00)  // OptimizeEntryExitPoints
    write_int_8(f, 0)  // fromImageStringLength
    //  String FromImageFilename
    write_float_32le(f, 1)
    write_float_32le(f, 0)
    write_float_32le(f, 0)
    write_float_32le(f, 1)
    write_float_32le(f, 0)
    write_float_32le(f, 0)
    write_int_16le(f, 0)  // numberOfProgrammableFillPatterns
    write_int_16le(f, 0)  // numberOfMotifPatterns
    write_int_16le(f, 0)  // featherPatternCount
    const count_thread = chart.length;
    write_int_16le(f, count_thread)  // numberOfColors
    for (let thread of chart) {
        write_pes_thread(f, thread)
    }
    write_int_16le(f, distinct_block_objects)  // number ofdistinct blocks
}


function write_pes_string_8(f, string) {
    if (string === null) {
        write_int_8(f, 0)
        return
    }
    if (string.length > 255) {
        string = string.substring(0,255)
    }
    write_int_8(f, string.length)
    write_string_utf8(f, string)
}


function write_pes_string_16(f, string) {
    if (string === null) {
        write_int_16le(f, 0)
        return
    }
    write_int_16le(f, string.length)
    // 16 refers to the size write not the string encoding.
    write_string_utf8(f, string)
}


function write_pes_thread(f, thread) {
    write_pes_string_8(f, thread.catalog_number)
    write_int_8(f, thread.get_red())
    write_int_8(f, thread.get_green())
    write_int_8(f, thread.get_blue())
    write_int_8(f, 0)  // unknown
    write_int_32le(f, 0xA)  // A is custom color
    write_pes_string_8(f, thread.description)
    write_pes_string_8(f, thread.brand)
    write_pes_string_8(f, thread.chart)
}


function write_pes_blocks(f, pattern, chart, left, top, right, bottom, cx, cy): number[] {
    if (pattern.stitches.length == 0) {
        return
    }

    write_pes_string_16(f, EMB_ONE)
    const placeholder = write_pes_sewsegheader(f, left, top, right, bottom)
    write_int_16le(f, 0xFFFF)
    write_int_16le(f, 0x0000)  // FFFF0000 means more blocks exist
    
    write_pes_string_16(f, EMB_SEG)
    const data = write_pes_embsewseg_segments(f, pattern, chart, left, bottom, cx, cy)
    
    const sections = data[0]
    const colorlog = data[1]
    
    const current_position = f.tell()
    f.seek(placeholder, 0)
    write_int_16le(f, sections)
    f.seek(current_position, 0)  // patch final section count.
    
    // If there were addition embsewsegheaders or segments they would go here.
    
    write_int_16le(f, 0x0000)
    write_int_16le(f, 0x0000)  // 00000000 means no more blocks.
    
    return colorlog as number[]
}



function write_pes_sewsegheader(f, left, top, right, bottom) {
    const width = right - left
    const height = bottom - top
    const hoop_height = 1800
    const hoop_width = 1300
    write_int_16le(f, 0)  // left
    write_int_16le(f, 0)  // top
    write_int_16le(f, 0)  // right
    write_int_16le(f, 0)  // bottom
    write_int_16le(f, 0)  // left
    write_int_16le(f, 0)  // top
    write_int_16le(f, 0)  // right
    write_int_16le(f, 0)  // bottom
    let trans_x = 0
    let trans_y = 0
    trans_x += 350
    trans_y += 100 + height
    trans_x += hoop_width / 2
    trans_y += hoop_height / 2
    trans_x += -width / 2
    trans_y += -height / 2
    write_float_32le(f, 1)
    write_float_32le(f, 0)
    write_float_32le(f, 0)
    write_float_32le(f, 1)
    write_float_32le(f, trans_x)
    write_float_32le(f, trans_y)

    write_int_16le(f, 1)
    write_int_16le(f, 0)
    write_int_16le(f, 0)
    write_int_16le(f, width)
    write_int_16le(f, height)
    f.write([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])

    const placeholder_needs_section_data = f.tell()
    // sections
    write_int_16le(f, 0)
    return placeholder_needs_section_data
}


function* get_as_segments_blocks(pattern: EmbPattern, chart, adjust_x, adjust_y) {
    let color_index = 0
    let flag = null
    let current_thread = pattern.get_thread_or_filler(color_index)
    color_index += 1
    let  color_code = current_thread.find_nearest_color_index(chart)
    let stitched_x = 0
    let stitched_y = 0
    for (let command_block of pattern.get_as_command_blocks()) {
        // throw Error("Done")
        let block = []
        const command = command_block[0][2]
        if (command == EmbConstant.JUMP) {
            block.push([stitched_x - adjust_x, stitched_y - adjust_y])
            const last_pos = command_block[command_block.length-1]
            block.push([last_pos[0] - adjust_x, last_pos[1] - adjust_y])
            flag = 1
        }
        else if (command == EmbConstant.COLOR_CHANGE) {
            current_thread = pattern.get_thread_or_filler(color_index)
            color_index += 1
            color_code = current_thread.find_nearest_color_index(chart)
            flag = 1
            continue
        }
        else if (command == EmbConstant.STITCH) {
            for (let stitch of command_block) {
                stitched_x = stitch[0]
                stitched_y = stitch[1]
                block.push([stitched_x - adjust_x, stitched_y - adjust_y])
            }
            flag = 0
        }
        else {
            continue
        }
        yield [block, color_code, flag]
    }
}


function write_pes_embsewseg_segments(f, pattern, chart, left, bottom, cx, cy) {
    let section = 0
    let colorlog = []

    let previous_color_code = -1
    let flag = -1
    const adjust_x = left + cx
    const adjust_y = bottom + cy
    const se = get_as_segments_blocks(pattern, chart, adjust_x, adjust_y);
    for (let segs of get_as_segments_blocks(pattern, chart, adjust_x, adjust_y)) {
        if (flag != -1) {
            write_int_16le(f, 0x8003)  // section end.
        }
        const segments = segs[0]
        const color_code = segs[1]
        flag = segs[2]

        if (previous_color_code != color_code) {
            colorlog.push([section, color_code])
            previous_color_code = color_code
        }
            // This must trigger first segment.
        write_int_16le(f, flag)
        write_int_16le(f, color_code)
        write_int_16le(f, segments.length)
        for (let segs of segments) {
            write_int_16le(f, segs[0])
            write_int_16le(f, segs[1])
        }
        section += 1
    }

    write_int_16le(f, colorlog.length)
    for (let log_item of colorlog) {
        write_int_16le(f, log_item[0])
        write_int_16le(f, log_item[1])
    }

    return [section, colorlog]  // how many sections, how color transitions.
}