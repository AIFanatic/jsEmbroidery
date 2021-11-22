import { EmbConstant } from "./EmbConstant";
import { EmbThread } from "./EmbThread";
import { StringHelpers } from "./StringHelpers";

export class EmbPattern {
    public stitches: number[][] = [];
    public threadlist: EmbThread[] = [];
    private extras: {} = {};
    private _previousX: number = 0;
    private _previousY: number = 0;

    constructor() {
    }

    public add_stitch_absolute(cmd, x=0, y=0) {
        // Add a command at the absolute location: x, y"""
        this.stitches.push([x, y, cmd])
        this._previousX = x
        this._previousY = y
    }
        
    public add_stitch_relative(cmd, dx=0, dy=0) {
        // Add a command relative to the previous location"""
        const x = this._previousX + dx;
        const y = this._previousY + dy;
        this.add_stitch_absolute(cmd, x, y);
    }
        
    public stitch(dx=0, dy=0) {
        // Stitch dx, dy"""
        this.add_stitch_relative(EmbConstant.STITCH, dx, dy)
    }

    public move(dx=0, dy=0) {
        // Move dx, dy"""
        this.add_stitch_relative(EmbConstant.JUMP, dx, dy)
    }

    public trim(dx=0, dy=0) {
        // Trim dx, dy"""
        this.add_stitch_relative(EmbConstant.TRIM, dx, dy)
    }

    public end(dx=0, dy=0) {
        // End Design dx, dy"""
        this.add_stitch_relative(EmbConstant.END, dx, dy)
    }

    public stop(dx=0, dy=0) {
        // Stop dx, dy"""
        this.add_stitch_relative(EmbConstant.STOP, dx, dy)
    }

    public color_change(dx=0, dy=0) {
        // Color Change dx, dy"""
        this.add_stitch_relative(EmbConstant.COLOR_CHANGE, dx, dy)
    }

    public add_thread(thread: EmbThread) {
        // Adds thread to design.
        // Note: this has no effect on stitching and can be done at any point.
        let thread_object = null;
        if (thread instanceof EmbThread) {
            this.threadlist.push(thread)
        }
        else if (typeof(thread) === "number") {
            thread_object = new EmbThread()
            thread_object.color = thread
            this.threadlist.push(thread_object)
        }
        else if (typeof(thread) === "object") {
            thread_object = new EmbThread()
            if (thread["name"])
                thread_object.description = thread["name"]
            if (thread["description"])
                thread_object.description = thread["description"]
            if (thread["desc"])
                thread_object.description = thread["desc"]
            if (thread["brand"])
                thread_object.brand = thread["brand"]
            if (thread["manufacturer"])
                thread_object.brand = thread["manufacturer"]
            if (thread["color"] || thread["rgb"]) {
                let color = null;
                try {
                    color = thread["color"]
                }
                catch (e) {
                    color = thread["rgb"]
                }
                if (typeof(color) === "number")
                    thread_object.color = color
                else if (typeof(color) === "string") {
                    if (color == "random")
                        thread_object.color = 0xFF000000 | StringHelpers.RandomRangeInt(0, 0xFFFFFF)
                    if (color[0] == "#")
                        thread_object.set_hex_color(color.substring(1))
                }
                else if (typeof(color) === "object") {
                    thread_object.color = (color[0] & 0xFF) << 16 | 
                                        (color[1] & 0xFF) << 8 | 
                                        (color[2] & 0xFF)
                }
            }
            if (thread["hex"])
                thread_object.set_hex_color(thread["hex"])
            if (thread["id"])
                thread_object.catalog_number = thread["id"]
            if (thread["catalog"])
                thread_object.catalog_number = thread["catalog"]
            this.threadlist.push(thread_object)
        }
    }

    public convert_duplicate_color_change_to_stop() {
        // Converts color change to same thread into a STOP."""

        const new_pattern = new EmbPattern()
        new_pattern.add_thread(this.get_thread_or_filler(0))
        
        let thread_index = 0
        for (const [x, y, command] of this.stitches) {
            if (command === EmbConstant.COLOR_CHANGE || command === EmbConstant.COLOR_BREAK) {// command in (COLOR_CHANGE, COLOR_BREAK):
                thread_index += 1
                let thread = this.get_thread_or_filler(thread_index)
                if (thread == new_pattern.threadlist[new_pattern.threadlist.length-1]) {
                    new_pattern.stop()
                }
                else {
                    new_pattern.color_change()
                    new_pattern.add_thread(thread)
                }
            }
            else {
                new_pattern.add_stitch_absolute(command, x, y)
            }
        }

        this.stitches = new_pattern.stitches
        this.threadlist = new_pattern.threadlist
    }

    public static get_random_thread() {
        const thread = new EmbThread()
        thread.color = 0xFF000000 | StringHelpers.RandomRangeInt(0, 0xFFFFFF)
        thread.description = "Random"
        return thread
    }

        
    public get_thread_or_filler(index) {
        if (this.threadlist.length <= index)
            return EmbPattern.get_random_thread()
        else
            return this.threadlist[index]
    }

    public copy() {
        return this;
        // return JSON.parse(JSON.stringify(this));
    }

    public convert_stop_to_color_change() {
        // Convert stops to a color change to the same color."""

        const new_pattern = new EmbPattern()
        new_pattern.add_thread(this.get_thread_or_filler(0))
        let thread_index = 1

        for (let [x, y, command] of this.stitches) {
            if (command === EmbConstant.COLOR_CHANGE || command === EmbConstant.COLOR_BREAK) {
                new_pattern.add_thread(this.get_thread_or_filler(thread_index))
                new_pattern.add_stitch_absolute(command, x, y)
                thread_index += 1
            }
            else if (command == EmbConstant.STOP) {
                new_pattern.color_change()
                new_pattern.add_thread(this.get_thread_or_filler(thread_index))
            }
            else {
                new_pattern.add_stitch_absolute(command, x, y)
            }
        }

        this.stitches = new_pattern.stitches
        this.threadlist = new_pattern.threadlist
    }

    public metadata(name, data) {
        // Adds select metadata to design.
        // Note: this has no effect on stitching and can be done at any point.
        this.extras[name] = data;
    }

    public get_metadata(name, _default=null) {
        if (this.extras[name]) return this.extras[name];
        else return _default
    }

    public extents() {
        let min_x = Infinity
        let min_y = Infinity
        let max_x = -Infinity
        let max_y = -Infinity

        for (let stitch of this.stitches) {
            if (stitch[0] > max_x)
                max_x = stitch[0]
            if (stitch[0] < min_x)
                min_x = stitch[0]
            if (stitch[1] > max_y)
                max_y = stitch[1]
            if (stitch[1] < min_y)
                min_y = stitch[1]
        }
        return [min_x, min_y, max_x, max_y]
    }

    public fix_color_count() {
        // Ensure that there are threads for all color blocks."""
        let thread_index = 0
        let init_color = true
        for (const stitch of this.stitches) {
            const data = stitch[2] & EmbConstant.COMMAND_MASK
            if (data == EmbConstant.STITCH || data == EmbConstant.SEW_TO || data == EmbConstant.NEEDLE_AT) {
                if (init_color) {
                    thread_index += 1
                    init_color = false
                }
            }
            else if (data == EmbConstant.COLOR_CHANGE || data == EmbConstant.COLOR_BREAK) {
                init_color = true
            }
        }
        while (this.threadlist.length < thread_index) {
            this.add_thread(this.get_thread_or_filler(this.threadlist.length))
        }
    }

    // legacy compatibility for typo
    // extends = extents

    * enumerate (it, start = 0) {
        let i = start
        for (const x of it)
            yield [i++, x]
    }

    public *get_as_command_blocks() {
        let last_pos = 0
        let last_command = EmbConstant.NO_COMMAND
        for (let [pos, stitch] of this.enumerate(this.stitches)) {
            const command = stitch[2]
            if (command == last_command || last_command == EmbConstant.NO_COMMAND) {
                last_command = command
                continue
            }
            last_command = command
            yield this.stitches.slice(last_pos,pos);
            last_pos = pos
        }
        yield this.stitches.slice(last_pos);
    }

    public* get_as_stitchblock() {
        let stitchblock = []
        let thread = this.get_thread_or_filler(0)
        let thread_index = 1
        for (const stitch of this.stitches) {
            const flags = stitch[2]
            if (flags == EmbConstant.STITCH)
                stitchblock.push(stitch)
            else {
                if (stitchblock.length > 0) {
                    yield [stitchblock, thread]
                    stitchblock = []
                }
                if (flags == EmbConstant.COLOR_CHANGE) {
                    thread = this.get_thread_or_filler(thread_index)
                    thread_index += 1
                }
            }
        }
        if (stitchblock.length > 0)
            yield [stitchblock, thread]
    }

    public* get_as_colorblocks() {
        let thread_index = 0
        let last_pos = 0
        let thread = null;
        for (const [pos, stitch] of this.enumerate(this.stitches)) {
            if (stitch[2] != EmbConstant.COLOR_CHANGE) {
                continue
            }
            thread = this.get_thread_or_filler(thread_index)
            thread_index += 1
            yield [this.stitches.slice(last_pos,pos), thread]
            last_pos = pos
        }
        thread = this.get_thread_or_filler(thread_index)
        yield [this.stitches.slice(last_pos), thread]
    }

    public append_translation(x: number, y: number) {
        // Appends translation to the pattern.
        // All commands will be translated by the given amount,
        // including absolute location commands."""
        this.add_stitch_relative(EmbConstant.MATRIX_TRANSLATE, x, y);
    }

    public append_enable_tie_on(x=0, y=0) {
        // Appends enable tie on.
        // All starts of new stitching will be tied on"""
        this.add_stitch_relative(EmbConstant.OPTION_ENABLE_TIE_ON, x, y)
    }

    public append_enable_tie_off(x=0, y=0) {
        // Appends enable tie off.
        // All ends of stitching will be tied off"""
        this.add_stitch_relative(EmbConstant.OPTION_ENABLE_TIE_OFF, x, y)
    }

    public append_disable_tie_on(x=0, y=0) {
        // """Appends disable tie on.
        // New stitching will no longer be tied on"""
        this.add_stitch_relative(EmbConstant.OPTION_DISABLE_TIE_ON, x, y)
    }

    public append_disable_tie_off(x=0, y=0) {
        // """Appends enable tie off.
        // Ends of stitching will no longer be tied off"""
        this.add_stitch_relative(EmbConstant.OPTION_DISABLE_TIE_OFF, x, y)
    }
}