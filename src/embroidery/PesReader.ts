import { EmbPattern, PyFile } from '.';
import { EmbThread } from './EmbThread';
import { read_pec } from './PecReader';
import { read_string_8, read_int_8, read_int_32le, read_int_24be, read_int_16le } from './ReadHelper'


export function read(f: PyFile, out: EmbPattern, settings=null) {
    const loaded_thread_values = []
    const pes_string = read_string_8(f, 8)

    if (pes_string == "#PEC0001") {
        read_pec(f, out, loaded_thread_values)
        out.convert_duplicate_color_change_to_stop()
        return
    }

    const pec_block_position = read_int_32le(f);

    // Ignoring several known PES versions, just abort and read PEC block
    // All versions allow, abort and read PEC block.
    // Metadata started appearing in V4
    // Threads appeared in V5.
    // We quickly abort if there's any complex items in the header.
    // "#PES0100", "#PES0090" "#PES0080" "#PES0070", "#PES0040",
    // "#PES0030", "#PES0022", "#PES0020"
    if (pes_string == "#PES0060")
        read_pes_header_version_6(f, out, loaded_thread_values)
    else if (pes_string == "#PES0050")
        read_pes_header_version_5(f, out, loaded_thread_values)
    else if (pes_string == "#PES0055")
        read_pes_header_version_5(f, out, loaded_thread_values)
    else if (pes_string == "#PES0056")
        read_pes_header_version_5(f, out, loaded_thread_values)
    else if (pes_string == "#PES0040")
        read_pes_header_version_4(f, out)
    else if (pes_string == "#PES0001")
        read_pes_header_version_1(f, out)
    else
        console.error("Header is unrecognised.")
    f.seek(pec_block_position, 0)
    read_pec(f, out, loaded_thread_values)
    out.convert_duplicate_color_change_to_stop()
}


function read_pes_string(f) {
    const length = read_int_8(f)
    if (length == 0) {
        return null;
    }
    return read_string_8(f, length)
}


function read_pes_metadata(f, out) {
    let v = read_pes_string(f)
    if (v !== null && v.length > 0)
        out.metadata("name", v)
    v = read_pes_string(f)
    if (v !== null && v.length > 0)
        out.metadata("category", v)
    v = read_pes_string(f)
    if (v !== null && v.length > 0)
        out.metadata("author", v)
    v = read_pes_string(f)
    if (v !== null && v.length > 0)
        out.metadata("keywords", v)
    v = read_pes_string(f)
    if (v !== null && v.length > 0)
        out.metadata("comments", v)
}


function read_pes_thread(f, threadlist) {
    const thread = new EmbThread();
    thread.catalog_number = read_pes_string(f)
    thread.color = 0xFF000000 | read_int_24be(f)
    f.seek(5, 1)
    thread.description = read_pes_string(f)
    thread.brand = read_pes_string(f)
    thread.chart = read_pes_string(f)
    threadlist.push(thread)
}


function read_pes_header_version_1(f, out) {
    // Nothing I care about.
    console.warn("pass: read_pes_header_version_1")
}


function read_pes_header_version_4(f, out) {
    f.seek(4, 1)
    read_pes_metadata(f, out)
}


function read_pes_header_version_5(f, out, threadlist) {
    f.seek(4, 1)
    read_pes_metadata(f, out)
    f.seek(24, 1)  // this is 36 in version 6 and 24 in version 5
    const v = read_pes_string(f)
    if (v !== null && v.length > 0)
        out.metadata("image", v)
    f.seek(24, 1)
    const count_programmable_fills = read_int_16le(f)
    if (count_programmable_fills != 0)
        return
    const count_motifs = read_int_16le(f)
    if (count_motifs != 0)
        return
    const count_feather_patterns = read_int_16le(f)
    if (count_feather_patterns != 0)
        return
    const count_threads = read_int_16le(f)
    for (let i = 0; i < count_threads; i++) {
        read_pes_thread(f, threadlist)
    }
}


function read_pes_header_version_6(f, out, threadlist) {
    f.seek(4, 1)
    read_pes_metadata(f, out)
    f.seek(36, 1)  // this is 36 in version 6 and 24 in version 5
    const v = read_pes_string(f)
    if (v !== null && v.length > 0)
        out.metadata("image_file", v)
    f.seek(24, 1)
    const count_programmable_fills = read_int_16le(f)
    if (count_programmable_fills != 0)
        return
    const count_motifs = read_int_16le(f)
    if (count_motifs != 0)
        return
    const count_feather_patterns = read_int_16le(f)
    if (count_feather_patterns != 0)
        return
    const count_threads = read_int_16le(f)
    for (let i = 0; i < count_threads; i++) {
        read_pes_thread(f, threadlist)
    }
}