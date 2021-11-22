// src/embroidery/EmbConstant.ts
var EmbConstant;
(function(EmbConstant2) {
  EmbConstant2[EmbConstant2["NO_COMMAND"] = -1] = "NO_COMMAND";
  EmbConstant2[EmbConstant2["STITCH"] = 0] = "STITCH";
  EmbConstant2[EmbConstant2["JUMP"] = 1] = "JUMP";
  EmbConstant2[EmbConstant2["TRIM"] = 2] = "TRIM";
  EmbConstant2[EmbConstant2["STOP"] = 3] = "STOP";
  EmbConstant2[EmbConstant2["END"] = 4] = "END";
  EmbConstant2[EmbConstant2["COLOR_CHANGE"] = 5] = "COLOR_CHANGE";
  EmbConstant2[EmbConstant2["SEQUIN_MODE"] = 6] = "SEQUIN_MODE";
  EmbConstant2[EmbConstant2["SEQUIN_EJECT"] = 7] = "SEQUIN_EJECT";
  EmbConstant2[EmbConstant2["SLOW"] = 11] = "SLOW";
  EmbConstant2[EmbConstant2["FAST"] = 12] = "FAST";
  EmbConstant2[EmbConstant2["SEW_TO"] = 176] = "SEW_TO";
  EmbConstant2[EmbConstant2["NEEDLE_AT"] = 177] = "NEEDLE_AT";
  EmbConstant2[EmbConstant2["STITCH_BREAK"] = 224] = "STITCH_BREAK";
  EmbConstant2[EmbConstant2["SEQUENCE_BREAK"] = 225] = "SEQUENCE_BREAK";
  EmbConstant2[EmbConstant2["COLOR_BREAK"] = 226] = "COLOR_BREAK";
  EmbConstant2[EmbConstant2["TIE_ON"] = 228] = "TIE_ON";
  EmbConstant2[EmbConstant2["TIE_OFF"] = 229] = "TIE_OFF";
  EmbConstant2[EmbConstant2["FRAME_EJECT"] = 233] = "FRAME_EJECT";
  EmbConstant2[EmbConstant2["MATRIX_TRANSLATE"] = 192] = "MATRIX_TRANSLATE";
  EmbConstant2[EmbConstant2["MATRIX_SCALE"] = 193] = "MATRIX_SCALE";
  EmbConstant2[EmbConstant2["MATRIX_ROTATE"] = 194] = "MATRIX_ROTATE";
  EmbConstant2[EmbConstant2["MATRIX_RESET"] = 195] = "MATRIX_RESET";
  EmbConstant2[EmbConstant2["OPTION_ENABLE_TIE_ON"] = 209] = "OPTION_ENABLE_TIE_ON";
  EmbConstant2[EmbConstant2["OPTION_ENABLE_TIE_OFF"] = 210] = "OPTION_ENABLE_TIE_OFF";
  EmbConstant2[EmbConstant2["OPTION_DISABLE_TIE_ON"] = 211] = "OPTION_DISABLE_TIE_ON";
  EmbConstant2[EmbConstant2["OPTION_DISABLE_TIE_OFF"] = 212] = "OPTION_DISABLE_TIE_OFF";
  EmbConstant2[EmbConstant2["OPTION_MAX_STITCH_LENGTH"] = 213] = "OPTION_MAX_STITCH_LENGTH";
  EmbConstant2[EmbConstant2["OPTION_MAX_JUMP_LENGTH"] = 214] = "OPTION_MAX_JUMP_LENGTH";
  EmbConstant2[EmbConstant2["OPTION_EXPLICIT_TRIM"] = 215] = "OPTION_EXPLICIT_TRIM";
  EmbConstant2[EmbConstant2["OPTION_IMPLICIT_TRIM"] = 216] = "OPTION_IMPLICIT_TRIM";
  EmbConstant2[EmbConstant2["CONTINGENCY_NONE"] = 240] = "CONTINGENCY_NONE";
  EmbConstant2[EmbConstant2["CONTINGENCY_JUMP_NEEDLE"] = 241] = "CONTINGENCY_JUMP_NEEDLE";
  EmbConstant2[EmbConstant2["CONTINGENCY_SEW_TO"] = 242] = "CONTINGENCY_SEW_TO";
  EmbConstant2[EmbConstant2["CONTINGENCY_SEQUIN_UTILIZE"] = 245] = "CONTINGENCY_SEQUIN_UTILIZE";
  EmbConstant2[EmbConstant2["CONTINGENCY_SEQUIN_JUMP"] = 246] = "CONTINGENCY_SEQUIN_JUMP";
  EmbConstant2[EmbConstant2["CONTINGENCY_SEQUIN_STITCH"] = 247] = "CONTINGENCY_SEQUIN_STITCH";
  EmbConstant2[EmbConstant2["CONTINGENCY_SEQUIN_REMOVE"] = 248] = "CONTINGENCY_SEQUIN_REMOVE";
  EmbConstant2[EmbConstant2["COMMAND_MASK"] = 255] = "COMMAND_MASK";
})(EmbConstant || (EmbConstant = {}));

// src/embroidery/StringHelpers.ts
var StringHelpers = class {
  static lstrip(x, characters) {
    var start = 0;
    while (characters.indexOf(x[start]) >= 0) {
      start += 1;
    }
    var end = x.length - 1;
    return x.substr(start);
  }
  static strip(x) {
    return x.replace(/^\s+|\s+$/gm, "");
  }
  static RandomRangeInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  static AsciiToBytes(str) {
    let out = [];
    for (let i = 0; i < str.length; i++) {
      out.push(str.charCodeAt(i));
    }
    return out;
  }
};

// src/embroidery/EmbThread.ts
function find_nearest_color_index(find_color, values) {
  if (typeof find_color === typeof EmbThread) {
    find_color = find_color.color;
  }
  const red = find_color >> 16 & 255;
  const green = find_color >> 8 & 255;
  const blue = find_color & 255;
  let closest_index = -1;
  let current_index = -1;
  let current_closest_value = Infinity;
  for (let t of values) {
    current_index += 1;
    if (!t)
      continue;
    const dist = color_distance_red_mean(red, green, blue, t.get_red(), t.get_green(), t.get_blue());
    if (dist <= current_closest_value) {
      current_closest_value = dist;
      closest_index = current_index;
    }
  }
  return closest_index;
}
function color_distance_red_mean(r1, g1, b1, r2, g2, b2) {
  let red_mean = Math.round((r1 + r2) / 2);
  const r = r1 - r2;
  const g = g1 - g2;
  const b = b1 - b2;
  return ((512 + red_mean) * r * r >> 8) + 4 * g * g + ((767 - red_mean) * b * b >> 8);
}
var EmbThread = class {
  constructor() {
    this.color = 4278190080;
  }
  set_color(r, g, b) {
    this.color = (r << 16) + (g << 8) + b;
  }
  get_opaque_color() {
    return 4278190080 | this.color;
  }
  get_red() {
    return this.color >> 16 & 255;
  }
  get_green() {
    return this.color >> 8 & 255;
  }
  get_blue() {
    return this.color & 255;
  }
  find_nearest_color_index(values) {
    return find_nearest_color_index(this.color, values);
  }
  hex_color() {
    let color = this.color.toString(16);
    if (color.length < 6)
      color = "0" + color;
    return color;
  }
  set_hex_color(hex_string) {
    const h = StringHelpers.lstrip(hex_string, "//");
    const size = h.length;
    if (size == 6 || size == 8) {
      this.color = parseInt(h.substring(0, 6), 16);
    } else if (size == 4 || size == 3) {
      this.color = parseInt(h[2] + h[2] + h[1] + h[1] + h[0] + h[0], 16);
    }
  }
};

// src/embroidery/EmbPattern.ts
var EmbPattern = class {
  constructor() {
    this.stitches = [];
    this.threadlist = [];
    this.extras = {};
    this._previousX = 0;
    this._previousY = 0;
  }
  add_stitch_absolute(cmd, x = 0, y = 0) {
    this.stitches.push([x, y, cmd]);
    this._previousX = x;
    this._previousY = y;
  }
  add_stitch_relative(cmd, dx = 0, dy = 0) {
    const x = this._previousX + dx;
    const y = this._previousY + dy;
    this.add_stitch_absolute(cmd, x, y);
  }
  stitch(dx = 0, dy = 0) {
    this.add_stitch_relative(EmbConstant.STITCH, dx, dy);
  }
  move(dx = 0, dy = 0) {
    this.add_stitch_relative(EmbConstant.JUMP, dx, dy);
  }
  trim(dx = 0, dy = 0) {
    this.add_stitch_relative(EmbConstant.TRIM, dx, dy);
  }
  end(dx = 0, dy = 0) {
    this.add_stitch_relative(EmbConstant.END, dx, dy);
  }
  stop(dx = 0, dy = 0) {
    this.add_stitch_relative(EmbConstant.STOP, dx, dy);
  }
  color_change(dx = 0, dy = 0) {
    this.add_stitch_relative(EmbConstant.COLOR_CHANGE, dx, dy);
  }
  add_thread(thread) {
    let thread_object = null;
    if (thread instanceof EmbThread) {
      this.threadlist.push(thread);
    } else if (typeof thread === "number") {
      thread_object = new EmbThread();
      thread_object.color = thread;
      this.threadlist.push(thread_object);
    } else if (typeof thread === "object") {
      thread_object = new EmbThread();
      if (thread["name"])
        thread_object.description = thread["name"];
      if (thread["description"])
        thread_object.description = thread["description"];
      if (thread["desc"])
        thread_object.description = thread["desc"];
      if (thread["brand"])
        thread_object.brand = thread["brand"];
      if (thread["manufacturer"])
        thread_object.brand = thread["manufacturer"];
      if (thread["color"] || thread["rgb"]) {
        let color = null;
        try {
          color = thread["color"];
        } catch (e) {
          color = thread["rgb"];
        }
        if (typeof color === "number")
          thread_object.color = color;
        else if (typeof color === "string") {
          if (color == "random")
            thread_object.color = 4278190080 | StringHelpers.RandomRangeInt(0, 16777215);
          if (color[0] == "#")
            thread_object.set_hex_color(color.substring(1));
        } else if (typeof color === "object") {
          thread_object.color = (color[0] & 255) << 16 | (color[1] & 255) << 8 | color[2] & 255;
        }
      }
      if (thread["hex"])
        thread_object.set_hex_color(thread["hex"]);
      if (thread["id"])
        thread_object.catalog_number = thread["id"];
      if (thread["catalog"])
        thread_object.catalog_number = thread["catalog"];
      this.threadlist.push(thread_object);
    }
  }
  convert_duplicate_color_change_to_stop() {
    const new_pattern = new EmbPattern();
    new_pattern.add_thread(this.get_thread_or_filler(0));
    let thread_index = 0;
    for (const [x, y, command] of this.stitches) {
      if (command === EmbConstant.COLOR_CHANGE || command === EmbConstant.COLOR_BREAK) {
        thread_index += 1;
        let thread = this.get_thread_or_filler(thread_index);
        if (thread == new_pattern.threadlist[new_pattern.threadlist.length - 1]) {
          new_pattern.stop();
        } else {
          new_pattern.color_change();
          new_pattern.add_thread(thread);
        }
      } else {
        new_pattern.add_stitch_absolute(command, x, y);
      }
    }
    this.stitches = new_pattern.stitches;
    this.threadlist = new_pattern.threadlist;
  }
  static get_random_thread() {
    const thread = new EmbThread();
    thread.color = 4278190080 | StringHelpers.RandomRangeInt(0, 16777215);
    thread.description = "Random";
    return thread;
  }
  get_thread_or_filler(index) {
    if (this.threadlist.length <= index)
      return EmbPattern.get_random_thread();
    else
      return this.threadlist[index];
  }
  copy() {
    return this;
  }
  convert_stop_to_color_change() {
    const new_pattern = new EmbPattern();
    new_pattern.add_thread(this.get_thread_or_filler(0));
    let thread_index = 1;
    for (let [x, y, command] of this.stitches) {
      if (command === EmbConstant.COLOR_CHANGE || command === EmbConstant.COLOR_BREAK) {
        new_pattern.add_thread(this.get_thread_or_filler(thread_index));
        new_pattern.add_stitch_absolute(command, x, y);
        thread_index += 1;
      } else if (command == EmbConstant.STOP) {
        new_pattern.color_change();
        new_pattern.add_thread(this.get_thread_or_filler(thread_index));
      } else {
        new_pattern.add_stitch_absolute(command, x, y);
      }
    }
    this.stitches = new_pattern.stitches;
    this.threadlist = new_pattern.threadlist;
  }
  metadata(name, data) {
    this.extras[name] = data;
  }
  get_metadata(name, _default = null) {
    if (this.extras[name])
      return this.extras[name];
    else
      return _default;
  }
  extents() {
    let min_x = Infinity;
    let min_y = Infinity;
    let max_x = -Infinity;
    let max_y = -Infinity;
    for (let stitch of this.stitches) {
      if (stitch[0] > max_x)
        max_x = stitch[0];
      if (stitch[0] < min_x)
        min_x = stitch[0];
      if (stitch[1] > max_y)
        max_y = stitch[1];
      if (stitch[1] < min_y)
        min_y = stitch[1];
    }
    return [min_x, min_y, max_x, max_y];
  }
  fix_color_count() {
    let thread_index = 0;
    let init_color = true;
    for (const stitch of this.stitches) {
      const data = stitch[2] & EmbConstant.COMMAND_MASK;
      if (data == EmbConstant.STITCH || data == EmbConstant.SEW_TO || data == EmbConstant.NEEDLE_AT) {
        if (init_color) {
          thread_index += 1;
          init_color = false;
        }
      } else if (data == EmbConstant.COLOR_CHANGE || data == EmbConstant.COLOR_BREAK) {
        init_color = true;
      }
    }
    while (this.threadlist.length < thread_index) {
      this.add_thread(this.get_thread_or_filler(this.threadlist.length));
    }
  }
  *enumerate(it, start = 0) {
    let i = start;
    for (const x of it)
      yield [i++, x];
  }
  *get_as_command_blocks() {
    let last_pos = 0;
    let last_command = EmbConstant.NO_COMMAND;
    for (let [pos, stitch] of this.enumerate(this.stitches)) {
      const command = stitch[2];
      if (command == last_command || last_command == EmbConstant.NO_COMMAND) {
        last_command = command;
        continue;
      }
      last_command = command;
      yield this.stitches.slice(last_pos, pos);
      last_pos = pos;
    }
    yield this.stitches.slice(last_pos);
  }
  *get_as_stitchblock() {
    let stitchblock = [];
    let thread = this.get_thread_or_filler(0);
    let thread_index = 1;
    for (const stitch of this.stitches) {
      const flags = stitch[2];
      if (flags == EmbConstant.STITCH)
        stitchblock.push(stitch);
      else {
        if (stitchblock.length > 0) {
          yield [stitchblock, thread];
          stitchblock = [];
        }
        if (flags == EmbConstant.COLOR_CHANGE) {
          thread = this.get_thread_or_filler(thread_index);
          thread_index += 1;
        }
      }
    }
    if (stitchblock.length > 0)
      yield [stitchblock, thread];
  }
  *get_as_colorblocks() {
    let thread_index = 0;
    let last_pos = 0;
    let thread = null;
    for (const [pos, stitch] of this.enumerate(this.stitches)) {
      if (stitch[2] != EmbConstant.COLOR_CHANGE) {
        continue;
      }
      thread = this.get_thread_or_filler(thread_index);
      thread_index += 1;
      yield [this.stitches.slice(last_pos, pos), thread];
      last_pos = pos;
    }
    thread = this.get_thread_or_filler(thread_index);
    yield [this.stitches.slice(last_pos), thread];
  }
  append_translation(x, y) {
    this.add_stitch_relative(EmbConstant.MATRIX_TRANSLATE, x, y);
  }
  append_enable_tie_on(x = 0, y = 0) {
    this.add_stitch_relative(EmbConstant.OPTION_ENABLE_TIE_ON, x, y);
  }
  append_enable_tie_off(x = 0, y = 0) {
    this.add_stitch_relative(EmbConstant.OPTION_ENABLE_TIE_OFF, x, y);
  }
  append_disable_tie_on(x = 0, y = 0) {
    this.add_stitch_relative(EmbConstant.OPTION_DISABLE_TIE_ON, x, y);
  }
  append_disable_tie_off(x = 0, y = 0) {
    this.add_stitch_relative(EmbConstant.OPTION_DISABLE_TIE_OFF, x, y);
  }
};

// src/embroidery/PyFile.ts
var PyFile = class {
  constructor(data) {
    this.offset = 0;
    this.data = data;
  }
  tell() {
    return this.offset;
  }
  seek(offset, whence) {
    if (whence == 1) {
      this.offset += offset;
    } else if (whence == 2) {
      this.offset = this.data.length - offset;
    } else {
      this.offset = offset;
    }
  }
  read(length) {
    if (this.offset + length > this.data.length) {
      console.error("offset + length exceeds data length");
      return;
    }
    let out = [];
    for (let i = this.offset; i < this.offset + length; i++) {
      out.push(this.data[i]);
    }
    this.offset += length;
    return out;
  }
  write(data) {
    for (let b of data) {
      this.data[this.offset] = b;
      this.offset++;
    }
  }
};

// src/embroidery/EmbThreadPec.ts
function get_thread_set() {
  return [
    new EmbThreadPec(0, 0, 0, "Unknown", "0"),
    new EmbThreadPec(14, 31, 124, "Prussian Blue", "1"),
    new EmbThreadPec(10, 85, 163, "Blue", "2"),
    new EmbThreadPec(0, 135, 119, "Teal Green", "3"),
    new EmbThreadPec(75, 107, 175, "Cornflower Blue", "4"),
    new EmbThreadPec(237, 23, 31, "Red", "5"),
    new EmbThreadPec(209, 92, 0, "Reddish Brown", "6"),
    new EmbThreadPec(145, 54, 151, "Magenta", "7"),
    new EmbThreadPec(228, 154, 203, "Light Lilac", "8"),
    new EmbThreadPec(145, 95, 172, "Lilac", "9"),
    new EmbThreadPec(158, 214, 125, "Mint Green", "10"),
    new EmbThreadPec(232, 169, 0, "Deep Gold", "11"),
    new EmbThreadPec(254, 186, 53, "Orange", "12"),
    new EmbThreadPec(255, 255, 0, "Yellow", "13"),
    new EmbThreadPec(112, 188, 31, "Lime Green", "14"),
    new EmbThreadPec(186, 152, 0, "Brass", "15"),
    new EmbThreadPec(168, 168, 168, "Silver", "16"),
    new EmbThreadPec(125, 111, 0, "Russet Brown", "17"),
    new EmbThreadPec(255, 255, 179, "Cream Brown", "18"),
    new EmbThreadPec(79, 85, 86, "Pewter", "19"),
    new EmbThreadPec(0, 0, 0, "Black", "20"),
    new EmbThreadPec(11, 61, 145, "Ultramarine", "21"),
    new EmbThreadPec(119, 1, 118, "Royal Purple", "22"),
    new EmbThreadPec(41, 49, 51, "Dark Gray", "23"),
    new EmbThreadPec(42, 19, 1, "Dark Brown", "24"),
    new EmbThreadPec(246, 74, 138, "Deep Rose", "25"),
    new EmbThreadPec(178, 118, 36, "Light Brown", "26"),
    new EmbThreadPec(252, 187, 197, "Salmon Pink", "27"),
    new EmbThreadPec(254, 55, 15, "Vermilion", "28"),
    new EmbThreadPec(240, 240, 240, "White", "29"),
    new EmbThreadPec(106, 28, 138, "Violet", "30"),
    new EmbThreadPec(168, 221, 196, "Seacrest", "31"),
    new EmbThreadPec(37, 132, 187, "Sky Blue", "32"),
    new EmbThreadPec(254, 179, 67, "Pumpkin", "33"),
    new EmbThreadPec(255, 243, 107, "Cream Yellow", "34"),
    new EmbThreadPec(208, 166, 96, "Khaki", "35"),
    new EmbThreadPec(209, 84, 0, "Clay Brown", "36"),
    new EmbThreadPec(102, 186, 73, "Leaf Green", "37"),
    new EmbThreadPec(19, 74, 70, "Peacock Blue", "38"),
    new EmbThreadPec(135, 135, 135, "Gray", "39"),
    new EmbThreadPec(216, 204, 198, "Warm Gray", "40"),
    new EmbThreadPec(67, 86, 7, "Dark Olive", "41"),
    new EmbThreadPec(253, 217, 222, "Flesh Pink", "42"),
    new EmbThreadPec(249, 147, 188, "Pink", "43"),
    new EmbThreadPec(0, 56, 34, "Deep Green", "44"),
    new EmbThreadPec(178, 175, 212, "Lavender", "45"),
    new EmbThreadPec(104, 106, 176, "Wisteria Violet", "46"),
    new EmbThreadPec(239, 227, 185, "Beige", "47"),
    new EmbThreadPec(247, 56, 102, "Carmine", "48"),
    new EmbThreadPec(181, 75, 100, "Amber Red", "49"),
    new EmbThreadPec(19, 43, 26, "Olive Green", "50"),
    new EmbThreadPec(199, 1, 86, "Dark Fuchsia", "51"),
    new EmbThreadPec(254, 158, 50, "Tangerine", "52"),
    new EmbThreadPec(168, 222, 235, "Light Blue", "53"),
    new EmbThreadPec(0, 103, 62, "Emerald Green", "54"),
    new EmbThreadPec(78, 41, 144, "Purple", "55"),
    new EmbThreadPec(47, 126, 32, "Moss Green", "56"),
    new EmbThreadPec(255, 204, 204, "Flesh Pink", "57"),
    new EmbThreadPec(255, 217, 17, "Harvest Gold", "58"),
    new EmbThreadPec(9, 91, 166, "Electric Blue", "59"),
    new EmbThreadPec(240, 249, 112, "Lemon Yellow", "60"),
    new EmbThreadPec(227, 243, 91, "Fresh Green", "61"),
    new EmbThreadPec(255, 153, 0, "Orange", "62"),
    new EmbThreadPec(255, 240, 141, "Cream Yellow", "63"),
    new EmbThreadPec(255, 200, 200, "Applique", "64")
  ];
}
var EmbThreadPec = class extends EmbThread {
  constructor(red, green, blue, description, catalog_number) {
    super();
    this.set_color(red, green, blue);
    this.description = description;
    this.catalog_number = catalog_number;
    this.brand = "Brother";
    this.chart = "Brother";
  }
};

// src/embroidery/ReadHelper.ts
function read_int_8(stream) {
  const byte = new Uint8Array(stream.read(1));
  if (byte.length == 1)
    return byte[0];
  return null;
}
function read_int_16le(stream) {
  const byte = new Uint8Array(stream.read(2));
  if (byte.length == 2)
    return (byte[0] & 255) + ((byte[1] & 255) << 8);
  return null;
}
function read_int_24le(stream) {
  const b = new Uint8Array(stream.read(3));
  if (b.length == 3)
    return (b[0] & 255) + ((b[1] & 255) << 8) + ((b[2] & 255) << 16);
  return null;
}
function read_int_24be(stream) {
  const b = new Uint8Array(stream.read(3));
  if (b.length == 3)
    return (b[2] & 255) + ((b[1] & 255) << 8) + ((b[0] & 255) << 16);
  return null;
}
function read_int_32le(stream) {
  const b = new Uint8Array(stream.read(4));
  if (b.length == 4)
    return (b[0] & 255) + ((b[1] & 255) << 8) + ((b[2] & 255) << 16) + ((b[3] & 255) << 24);
  return null;
}
function read_string_8(stream, length) {
  const byte = stream.read(length);
  try {
    return String.fromCharCode(...byte);
  } catch (e) {
    console.error("read_string_8", e);
    return null;
  }
}

// src/embroidery/PecReader.ts
var JUMP_CODE = 16;
var TRIM_CODE = 32;
var FLAG_LONG = 128;
function read_pec(f, out, pes_chart = null) {
  f.seek(3, 1);
  const label = read_string_8(f, 16);
  if (label != null) {
    out.metadata("Label", StringHelpers.strip(label));
  }
  f.seek(15, 1);
  const pec_graphic_byte_stride = read_int_8(f);
  const pec_graphic_icon_height = read_int_8(f);
  f.seek(12, 1);
  const color_changes = read_int_8(f);
  const count_colors = color_changes + 1;
  const color_bytes = new Uint8Array(f.read(count_colors));
  const threads = [];
  map_pec_colors(color_bytes, out, pes_chart, threads);
  f.seek(464 - color_changes, 1);
  const stitch_block_end = read_int_24le(f) - 5 + f.tell();
  f.seek(15, 1);
  read_pec_stitches(f, out);
  f.seek(stitch_block_end, 0);
  const byte_size = pec_graphic_byte_stride * pec_graphic_icon_height;
  read_pec_graphics(f, out, byte_size, pec_graphic_byte_stride, count_colors + 1, threads);
}
function read_pec_graphics(f, out, size, stride, count, values) {
  const v = values;
  console.log(values);
  v.splice(0, 0, null);
  for (let i = 0; i < count; i++) {
    const graphic = new Uint8Array(f.read(size));
    if (f !== null) {
      out.metadata(i, [graphic, stride, v[i]]);
    }
  }
}
function process_pec_colors(colorbytes, out, values) {
  const thread_set = get_thread_set();
  const max_value = thread_set.length;
  for (let byte of colorbytes) {
    const thread_value = thread_set[byte % max_value];
    out.add_thread(thread_value);
    values.push(thread_value);
  }
}
function process_pec_table(colorbytes, out, chart, values) {
  const thread_set = get_thread_set();
  const max_value = thread_set.length;
  const thread_map = {};
  for (let i = 0; i < colorbytes.length; i++) {
    const color_index = colorbytes[i] % max_value;
    let thread_value = thread_map[color_index] ? thread_map[color_index] : null;
    if (thread_value === null) {
      if (chart.length > 0)
        thread_value = chart.pop(0);
      else
        thread_value = thread_set[color_index];
      thread_map[color_index] = thread_value;
    }
    out.add_thread(thread_value);
    values.append(thread_value);
  }
}
function map_pec_colors(colorbytes, out, chart, values) {
  if (chart === null || chart.length == 0) {
    process_pec_colors(colorbytes, out, values);
  } else if (chart.length >= colorbytes.length) {
    for (let thread of chart) {
      out.add_thread(thread);
      values.append(thread);
    }
  } else {
    process_pec_table(colorbytes, out, chart, values);
  }
}
function signed12(b) {
  b &= 4095;
  if (b > 2047)
    return -4096 + b;
  else
    return b;
}
function signed7(b) {
  if (b > 63)
    return -128 + b;
  else
    return b;
}
function read_pec_stitches(f, out) {
  while (1) {
    let val1 = read_int_8(f);
    let val2 = read_int_8(f);
    let val3 = null;
    if (val1 == 255 && val2 == 0 || val2 === null) {
      break;
    }
    if (val1 == 254 && val2 == 176) {
      f.seek(1, 1);
      out.color_change(0, 0);
      continue;
    }
    let jump = false;
    let trim = false;
    let x = null;
    let y = null;
    let code = null;
    if ((val1 & FLAG_LONG) != 0) {
      if ((val1 & TRIM_CODE) != 0) {
        trim = true;
      }
      if ((val1 & JUMP_CODE) != 0) {
        jump = true;
      }
      code = val1 << 8 | val2;
      x = signed12(code);
      val2 = read_int_8(f);
      if (val2 === null) {
        break;
      }
    } else {
      x = signed7(val1);
    }
    if ((val2 & FLAG_LONG) != 0) {
      if ((val2 & TRIM_CODE) != 0) {
        trim = true;
      }
      if ((val2 & JUMP_CODE) != 0) {
        jump = true;
      }
      val3 = read_int_8(f);
      if (val3 === null) {
        break;
      }
      code = val2 << 8 | val3;
      y = signed12(code);
    } else {
      y = signed7(val2);
    }
    if (jump) {
      out.move(x, y);
    } else if (trim) {
      out.trim();
      out.move(x, y);
    } else {
      out.stitch(x, y);
    }
  }
  out.end();
}

// src/embroidery/PesReader.ts
function read(f, out, settings = null) {
  const loaded_thread_values = [];
  const pes_string = read_string_8(f, 8);
  if (pes_string == "#PEC0001") {
    read_pec(f, out, loaded_thread_values);
    out.convert_duplicate_color_change_to_stop();
    return;
  }
  const pec_block_position = read_int_32le(f);
  if (pes_string == "#PES0060")
    read_pes_header_version_6(f, out, loaded_thread_values);
  else if (pes_string == "#PES0050")
    read_pes_header_version_5(f, out, loaded_thread_values);
  else if (pes_string == "#PES0055")
    read_pes_header_version_5(f, out, loaded_thread_values);
  else if (pes_string == "#PES0056")
    read_pes_header_version_5(f, out, loaded_thread_values);
  else if (pes_string == "#PES0040")
    read_pes_header_version_4(f, out);
  else if (pes_string == "#PES0001")
    read_pes_header_version_1(f, out);
  else
    console.error("Header is unrecognised.");
  f.seek(pec_block_position, 0);
  read_pec(f, out, loaded_thread_values);
  out.convert_duplicate_color_change_to_stop();
}
function read_pes_string(f) {
  const length = read_int_8(f);
  if (length == 0) {
    return null;
  }
  return read_string_8(f, length);
}
function read_pes_metadata(f, out) {
  let v = read_pes_string(f);
  if (v !== null && v.length > 0)
    out.metadata("name", v);
  v = read_pes_string(f);
  if (v !== null && v.length > 0)
    out.metadata("category", v);
  v = read_pes_string(f);
  if (v !== null && v.length > 0)
    out.metadata("author", v);
  v = read_pes_string(f);
  if (v !== null && v.length > 0)
    out.metadata("keywords", v);
  v = read_pes_string(f);
  if (v !== null && v.length > 0)
    out.metadata("comments", v);
}
function read_pes_thread(f, threadlist) {
  const thread = new EmbThread();
  thread.catalog_number = read_pes_string(f);
  thread.color = 4278190080 | read_int_24be(f);
  f.seek(5, 1);
  thread.description = read_pes_string(f);
  thread.brand = read_pes_string(f);
  thread.chart = read_pes_string(f);
  threadlist.push(thread);
}
function read_pes_header_version_1(f, out) {
  console.warn("pass: read_pes_header_version_1");
}
function read_pes_header_version_4(f, out) {
  f.seek(4, 1);
  read_pes_metadata(f, out);
}
function read_pes_header_version_5(f, out, threadlist) {
  f.seek(4, 1);
  read_pes_metadata(f, out);
  f.seek(24, 1);
  const v = read_pes_string(f);
  if (v !== null && v.length > 0)
    out.metadata("image", v);
  f.seek(24, 1);
  const count_programmable_fills = read_int_16le(f);
  if (count_programmable_fills != 0)
    return;
  const count_motifs = read_int_16le(f);
  if (count_motifs != 0)
    return;
  const count_feather_patterns = read_int_16le(f);
  if (count_feather_patterns != 0)
    return;
  const count_threads = read_int_16le(f);
  for (let i = 0; i < count_threads; i++) {
    read_pes_thread(f, threadlist);
  }
}
function read_pes_header_version_6(f, out, threadlist) {
  f.seek(4, 1);
  read_pes_metadata(f, out);
  f.seek(36, 1);
  const v = read_pes_string(f);
  if (v !== null && v.length > 0)
    out.metadata("image_file", v);
  f.seek(24, 1);
  const count_programmable_fills = read_int_16le(f);
  if (count_programmable_fills != 0)
    return;
  const count_motifs = read_int_16le(f);
  if (count_motifs != 0)
    return;
  const count_feather_patterns = read_int_16le(f);
  if (count_feather_patterns != 0)
    return;
  const count_threads = read_int_16le(f);
  for (let i = 0; i < count_threads; i++) {
    read_pes_thread(f, threadlist);
  }
}

// src/embroidery/PecGraphics.ts
var blank = [
  0,
  0,
  0,
  0,
  0,
  0,
  240,
  255,
  255,
  255,
  255,
  15,
  8,
  0,
  0,
  0,
  0,
  16,
  4,
  0,
  0,
  0,
  0,
  32,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  2,
  0,
  0,
  0,
  0,
  64,
  4,
  0,
  0,
  0,
  0,
  32,
  8,
  0,
  0,
  0,
  0,
  16,
  240,
  255,
  255,
  255,
  255,
  15,
  0,
  0,
  0,
  0,
  0,
  0
];
function get_blank() {
  let m = new Uint8Array(blank.length);
  for (let i = 0; i < blank.length; i++) {
    m[i] = blank[i];
  }
  return m;
}
function draw(points, graphic, stride = 6) {
  for (let point of points) {
    try {
      graphic_mark_bit(graphic, parseInt(point.x), parseInt(point.y), stride);
    } catch (e) {
      graphic_mark_bit(graphic, parseInt(point[0]), parseInt(point[1]), stride);
    }
  }
}
function draw_scaled(extents, points, graphic, stride, buffer = 5) {
  if (extents === null) {
    draw(points, graphic, stride);
    return;
  }
  let left = null;
  let top = null;
  let right = null;
  let bottom = null;
  left = extents[0];
  top = extents[1];
  right = extents[2];
  bottom = extents[3];
  let diagram_width = right - left;
  let diagram_height = bottom - top;
  const graphic_width = stride * 8;
  const graphic_height = graphic.length / stride;
  if (diagram_width == 0)
    diagram_width = 1;
  if (diagram_height == 0)
    diagram_height = 1;
  const scale_x = (graphic_width - buffer) / diagram_width;
  const scale_y = (graphic_height - buffer) / diagram_height;
  const scale = Math.min(scale_x, scale_y);
  const cx = (right + left) / 2;
  const cy = (bottom + top) / 2;
  let translate_x = -cx;
  let translate_y = -cy;
  translate_x *= scale;
  translate_y *= scale;
  translate_x += graphic_width / 2;
  translate_y += graphic_height / 2;
  for (let point of points) {
    graphic_mark_bit(graphic, Math.floor(point[0] * scale + translate_x), Math.floor(point[1] * scale + translate_y), stride);
  }
}
function graphic_mark_bit(graphic, x, y, stride = 6) {
  graphic[y * stride + Math.floor(x / 8)] |= 1 << x % 8;
}

// src/embroidery/WriteHelper.ts
function write_int_8(stream, value) {
  stream.write([value & 255]);
}
function write_int_16le(stream, value) {
  stream.write([value >> 0 & 255, value >> 8 & 255]);
}
function write_int_16be(stream, value) {
  stream.write([value >> 8 & 255, value >> 0 & 255]);
}
function write_int_24le(stream, value) {
  stream.write([value >> 0 & 255, value >> 8 & 255, value >> 16 & 255]);
}
function write_int_32le(stream, value) {
  stream.write([value >> 0 & 255, value >> 8 & 255, value >> 16 & 255, value >> 24 & 255]);
}
function write_float_32le(stream, value) {
  stream.write(new Uint8Array(new Float32Array([value]).buffer));
}
function write_string_utf8(stream, string) {
  stream.write(StringHelpers.AsciiToBytes(string));
}

// src/embroidery/PecWriter.ts
var SEQUIN_CONTINGENCY = EmbConstant.CONTINGENCY_SEQUIN_JUMP;
var MASK_07_BIT = 127;
var JUMP_CODE2 = 16;
var TRIM_CODE2 = 32;
var PEC_ICON_WIDTH = 48;
var PEC_ICON_HEIGHT = 38;
function write_pec(pattern, f, threadlist = null) {
  if (threadlist === null) {
    pattern.fix_color_count();
    threadlist = pattern.threadlist;
  }
  const extents = pattern.extents();
  write_pec_header(pattern, f, threadlist);
  write_pec_block(pattern, f, extents);
  write_pec_graphics(pattern, f, extents);
}
function write_pec_header(pattern, f, threadlist) {
  const name = pattern.get_metadata("name", "Untitled");
  write_string_utf8(f, `LA:${name.substring(0, 8)}        \r`);
  f.write([32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 255, 0]);
  write_int_8(f, PEC_ICON_WIDTH / 8);
  write_int_8(f, PEC_ICON_HEIGHT);
  const thread_set = get_thread_set();
  if (thread_set.length <= threadlist.length) {
    threadlist = thread_set;
  }
  const chart = new Array(thread_set.length).fill(null);
  for (let thread of threadlist) {
    const index = thread.find_nearest_color_index(thread_set);
    thread_set[index] = null;
    chart[index] = thread;
  }
  const color_index_list = [];
  for (let thread of threadlist) {
    color_index_list.push(thread.find_nearest_color_index(chart));
  }
  const current_thread_count = color_index_list.length;
  if (current_thread_count != 0) {
    f.write([32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32]);
    const add_value = current_thread_count - 1;
    color_index_list.splice(0, 0, add_value);
    f.write(color_index_list);
  } else {
    f.write([32, 32, 32, 32, 100, 32, 0, 32, 0, 32, 32, 32, 255]);
  }
  for (let i = current_thread_count; i < 463; i++) {
    f.write([32]);
  }
}
function write_pec_block(pattern, f, extents) {
  const width = extents[2] - extents[0];
  const height = extents[3] - extents[1];
  const stitch_block_start_position = f.tell();
  f.write([0, 0]);
  write_int_24le(f, 0);
  f.write([49, 255, 240]);
  write_int_16le(f, Math.round(width));
  write_int_16le(f, Math.round(height));
  write_int_16le(f, 480);
  write_int_16le(f, 432);
  write_int_16be(f, 36864 | -Math.round(extents[0]));
  write_int_16be(f, 36864 | -Math.round(extents[1]));
  pec_encode(pattern, f);
  const stitch_block_length = f.tell() - stitch_block_start_position;
  const current_position = f.tell();
  f.seek(stitch_block_start_position + 2, 0);
  write_int_24le(f, stitch_block_length);
  f.seek(current_position, 0);
}
function write_pec_graphics(pattern, f, extents) {
  let blank2 = get_blank();
  for (let block of pattern.get_as_stitchblock()) {
    const stitches = block[0];
    draw_scaled(extents, stitches, blank2, 6, 4);
  }
  f.write(blank2);
  for (let block of pattern.get_as_colorblocks()) {
    let stitches = [];
    for (let s of block[0]) {
      if (s[2] === EmbConstant.STITCH) {
        stitches.push(s);
      }
    }
    const blank3 = get_blank();
    draw_scaled(extents, stitches, blank3, 6);
    f.write(blank3);
  }
}
function encode_long_form(value) {
  value &= 4095;
  value |= 32768;
  return value;
}
function flag_jump(longForm) {
  return longForm | JUMP_CODE2 << 8;
}
function flag_trim(longForm) {
  return longForm | TRIM_CODE2 << 8;
}
function pec_encode(pattern, f) {
  let color_two = true;
  let xx = 0;
  let yy = 0;
  for (let stitch of pattern.stitches) {
    const x = stitch[0];
    const y = stitch[1];
    let data = stitch[2];
    let dx = Math.round(x - xx);
    let dy = Math.round(y - yy);
    xx += dx;
    yy += dy;
    if (data === EmbConstant.STITCH || data === EmbConstant.JUMP || data === EmbConstant.TRIM) {
      if (data == EmbConstant.STITCH && (-64 < dx && dx < 63) && (-64 < dy && dy < 63)) {
        f.write([dx & MASK_07_BIT, dy & MASK_07_BIT]);
      } else {
        dx = encode_long_form(dx);
        dy = encode_long_form(dy);
        if (data == EmbConstant.JUMP) {
          dx = flag_jump(dx);
          dy = flag_jump(dy);
        } else if (data == EmbConstant.TRIM) {
          dx = flag_trim(dx);
          dy = flag_trim(dy);
        }
        data = [
          dx >> 8 & 255,
          dx & 255,
          dy >> 8 & 255,
          dy & 255
        ];
        f.write(data);
      }
    } else if (data == EmbConstant.COLOR_CHANGE) {
      f.write([254, 176]);
      if (color_two)
        f.write([2]);
      else
        f.write([1]);
      color_two = !color_two;
    } else if (data == EmbConstant.STOP) {
      console.warn("This should never happen because we've converted each STOP into a");
    } else if (data == EmbConstant.END)
      f.write([255]);
  }
}

// src/embroidery/PesWriter.ts
var SEQUIN_CONTINGENCY2 = EmbConstant.CONTINGENCY_SEQUIN_JUMP;
var VERSION_1 = 1;
var VERSION_6 = 6;
var PES_VERSION_1_SIGNATURE = "#PES0001";
var PES_VERSION_6_SIGNATURE = "#PES0060";
var EMB_ONE = "CEmbOne";
var EMB_SEG = "CSewSeg";
function write(pattern, f, settings = null) {
  pattern = pattern.copy();
  pattern.convert_stop_to_color_change();
  let version = null;
  let truncated = null;
  if (settings !== null) {
    version = settings.get("pes version", VERSION_1);
    truncated = settings.get("truncated", false);
  } else {
    version = VERSION_1;
    truncated = false;
  }
  if (truncated) {
    if (version == VERSION_1)
      write_truncated_version_1(pattern, f);
    else if (version == VERSION_6)
      write_truncated_version_6(pattern, f);
  } else {
    if (version == VERSION_1)
      write_version_1(pattern, f);
    else if (version == VERSION_6)
      write_version_6(pattern, f);
  }
}
function write_truncated_version_1(pattern, f) {
  write_string_utf8(f, PES_VERSION_1_SIGNATURE);
  f.write([22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  write_pec(pattern, f);
}
function write_truncated_version_6(pattern, f) {
  const chart = pattern.threadlist;
  write_string_utf8(f, PES_VERSION_6_SIGNATURE);
  const placeholder_pec_block = f.tell();
  write_int_32le(f, 0);
  write_pes_header_v6(pattern, f, chart, 0);
  write_int_16le(f, 0);
  write_int_16le(f, 0);
  const current_position = f.tell();
  f.seek(placeholder_pec_block, 0);
  write_int_32le(f, current_position);
  f.seek(current_position, 0);
  write_pec(pattern, f);
}
function write_version_1(pattern, f) {
  const chart = get_thread_set();
  write_string_utf8(f, PES_VERSION_1_SIGNATURE);
  const extents = pattern.extents();
  const cx = (extents[2] + extents[0]) / 2;
  const cy = (extents[3] + extents[1]) / 2;
  const left = extents[0] - cx;
  const top = extents[1] - cy;
  const right = extents[2] - cx;
  const bottom = extents[3] - cy;
  const placeholder_pec_block = f.tell();
  write_int_32le(f, 0);
  if (pattern.stitches.length == 0) {
    write_pes_header_v1(f, 0);
    write_int_16le(f, 0);
    write_int_16le(f, 0);
  } else {
    write_pes_header_v1(f, 1);
    write_int_16le(f, 65535);
    write_int_16le(f, 0);
    write_pes_blocks(f, pattern, chart, left, top, right, bottom, cx, cy);
  }
  const current_position = f.tell();
  f.seek(placeholder_pec_block, 0);
  write_int_32le(f, current_position);
  f.seek(current_position, 0);
  write_pec(pattern, f);
}
function write_version_6(pattern, f) {
  pattern.fix_color_count();
  const chart = pattern.threadlist;
  write_string_utf8(f, PES_VERSION_6_SIGNATURE);
  const extents = pattern.extents();
  const cx = (extents[2] + extents[0]) / 2;
  const cy = (extents[3] + extents[1]) / 2;
  const left = extents[0] - cx;
  const top = extents[1] - cy;
  const right = extents[2] - cx;
  const bottom = extents[3] - cy;
  const placeholder_pec_block = f.tell();
  write_int_32le(f, 0);
  if (pattern.stitches.length == 0) {
    write_pes_header_v6(pattern, f, chart, 0);
    write_int_16le(f, 0);
    write_int_16le(f, 0);
  } else {
    write_pes_header_v6(pattern, f, chart, 1);
    write_int_16le(f, 65535);
    write_int_16le(f, 0);
    const log = write_pes_blocks(f, pattern, chart, left, top, right, bottom, cx, cy);
    write_int_32le(f, 0);
    write_int_32le(f, 0);
    for (let i = 0; i < log.length; i++) {
      write_int_32le(f, i);
      write_int_32le(f, 0);
    }
  }
  const current_position = f.tell();
  f.seek(placeholder_pec_block, 0);
  write_int_32le(f, current_position);
  f.seek(current_position, 0);
  write_pec(pattern, f);
}
function write_pes_header_v1(f, distinct_block_objects) {
  write_int_16le(f, 1);
  write_int_16le(f, 1);
  write_int_16le(f, distinct_block_objects);
}
function write_pes_header_v6(pattern, f, chart, distinct_block_objects) {
  write_int_16le(f, 1);
  f.write([2]);
  write_pes_string_8(f, pattern.get_metadata("name", null));
  write_pes_string_8(f, pattern.get_metadata("category", null));
  write_pes_string_8(f, pattern.get_metadata("author", null));
  write_pes_string_8(f, pattern.get_metadata("keywords", null));
  write_pes_string_8(f, pattern.get_metadata("comments", null));
  write_int_16le(f, 0);
  write_int_16le(f, 0);
  write_int_16le(f, 100);
  write_int_16le(f, 100);
  write_int_16le(f, 0);
  write_int_16le(f, 200);
  write_int_16le(f, 200);
  write_int_16le(f, 100);
  write_int_16le(f, 100);
  write_int_16le(f, 100);
  write_int_16le(f, 7);
  write_int_16le(f, 19);
  write_int_16le(f, 1);
  write_int_16le(f, 1);
  write_int_16le(f, 0);
  write_int_16le(f, 100);
  write_int_16le(f, 1);
  write_int_16le(f, 0);
  write_int_8(f, 0);
  write_float_32le(f, 1);
  write_float_32le(f, 0);
  write_float_32le(f, 0);
  write_float_32le(f, 1);
  write_float_32le(f, 0);
  write_float_32le(f, 0);
  write_int_16le(f, 0);
  write_int_16le(f, 0);
  write_int_16le(f, 0);
  const count_thread = chart.length;
  write_int_16le(f, count_thread);
  for (let thread of chart) {
    write_pes_thread(f, thread);
  }
  write_int_16le(f, distinct_block_objects);
}
function write_pes_string_8(f, string) {
  if (string === null) {
    write_int_8(f, 0);
    return;
  }
  if (string.length > 255) {
    string = string.substring(0, 255);
  }
  write_int_8(f, string.length);
  write_string_utf8(f, string);
}
function write_pes_string_16(f, string) {
  if (string === null) {
    write_int_16le(f, 0);
    return;
  }
  write_int_16le(f, string.length);
  write_string_utf8(f, string);
}
function write_pes_thread(f, thread) {
  write_pes_string_8(f, thread.catalog_number);
  write_int_8(f, thread.get_red());
  write_int_8(f, thread.get_green());
  write_int_8(f, thread.get_blue());
  write_int_8(f, 0);
  write_int_32le(f, 10);
  write_pes_string_8(f, thread.description);
  write_pes_string_8(f, thread.brand);
  write_pes_string_8(f, thread.chart);
}
function write_pes_blocks(f, pattern, chart, left, top, right, bottom, cx, cy) {
  if (pattern.stitches.length == 0) {
    return;
  }
  write_pes_string_16(f, EMB_ONE);
  const placeholder = write_pes_sewsegheader(f, left, top, right, bottom);
  write_int_16le(f, 65535);
  write_int_16le(f, 0);
  write_pes_string_16(f, EMB_SEG);
  const data = write_pes_embsewseg_segments(f, pattern, chart, left, bottom, cx, cy);
  const sections = data[0];
  const colorlog = data[1];
  const current_position = f.tell();
  f.seek(placeholder, 0);
  write_int_16le(f, sections);
  f.seek(current_position, 0);
  write_int_16le(f, 0);
  write_int_16le(f, 0);
  return colorlog;
}
function write_pes_sewsegheader(f, left, top, right, bottom) {
  const width = right - left;
  const height = bottom - top;
  const hoop_height = 1800;
  const hoop_width = 1300;
  write_int_16le(f, 0);
  write_int_16le(f, 0);
  write_int_16le(f, 0);
  write_int_16le(f, 0);
  write_int_16le(f, 0);
  write_int_16le(f, 0);
  write_int_16le(f, 0);
  write_int_16le(f, 0);
  let trans_x = 0;
  let trans_y = 0;
  trans_x += 350;
  trans_y += 100 + height;
  trans_x += hoop_width / 2;
  trans_y += hoop_height / 2;
  trans_x += -width / 2;
  trans_y += -height / 2;
  write_float_32le(f, 1);
  write_float_32le(f, 0);
  write_float_32le(f, 0);
  write_float_32le(f, 1);
  write_float_32le(f, trans_x);
  write_float_32le(f, trans_y);
  write_int_16le(f, 1);
  write_int_16le(f, 0);
  write_int_16le(f, 0);
  write_int_16le(f, width);
  write_int_16le(f, height);
  f.write([0, 0, 0, 0, 0, 0, 0, 0]);
  const placeholder_needs_section_data = f.tell();
  write_int_16le(f, 0);
  return placeholder_needs_section_data;
}
function* get_as_segments_blocks(pattern, chart, adjust_x, adjust_y) {
  let color_index = 0;
  let flag = null;
  let current_thread = pattern.get_thread_or_filler(color_index);
  color_index += 1;
  let color_code = current_thread.find_nearest_color_index(chart);
  let stitched_x = 0;
  let stitched_y = 0;
  for (let command_block of pattern.get_as_command_blocks()) {
    let block = [];
    const command = command_block[0][2];
    if (command == EmbConstant.JUMP) {
      block.push([stitched_x - adjust_x, stitched_y - adjust_y]);
      const last_pos = command_block[command_block.length - 1];
      block.push([last_pos[0] - adjust_x, last_pos[1] - adjust_y]);
      flag = 1;
    } else if (command == EmbConstant.COLOR_CHANGE) {
      current_thread = pattern.get_thread_or_filler(color_index);
      color_index += 1;
      color_code = current_thread.find_nearest_color_index(chart);
      flag = 1;
      continue;
    } else if (command == EmbConstant.STITCH) {
      for (let stitch of command_block) {
        stitched_x = stitch[0];
        stitched_y = stitch[1];
        block.push([stitched_x - adjust_x, stitched_y - adjust_y]);
      }
      flag = 0;
    } else {
      continue;
    }
    yield [block, color_code, flag];
  }
}
function write_pes_embsewseg_segments(f, pattern, chart, left, bottom, cx, cy) {
  let section = 0;
  let colorlog = [];
  let previous_color_code = -1;
  let flag = -1;
  const adjust_x = left + cx;
  const adjust_y = bottom + cy;
  const se = get_as_segments_blocks(pattern, chart, adjust_x, adjust_y);
  for (let segs of get_as_segments_blocks(pattern, chart, adjust_x, adjust_y)) {
    if (flag != -1) {
      write_int_16le(f, 32771);
    }
    const segments = segs[0];
    const color_code = segs[1];
    flag = segs[2];
    if (previous_color_code != color_code) {
      colorlog.push([section, color_code]);
      previous_color_code = color_code;
    }
    write_int_16le(f, flag);
    write_int_16le(f, color_code);
    write_int_16le(f, segments.length);
    for (let segs2 of segments) {
      write_int_16le(f, segs2[0]);
      write_int_16le(f, segs2[1]);
    }
    section += 1;
  }
  write_int_16le(f, colorlog.length);
  for (let log_item of colorlog) {
    write_int_16le(f, log_item[0]);
    write_int_16le(f, log_item[1]);
  }
  return [section, colorlog];
}

// src/Utils.ts
var Utils = class {
  static isPointInsideRect(position, size, point) {
    return point.x > position.x && point.x < position.x + size.w && point.y > position.y && point.y < position.y + size.h;
  }
  static isPointInsideCircle(point, center, radius) {
    return Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2) <= radius * radius;
  }
  static pointsDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }
  static pointsMidPoint(p1, p2) {
    return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  }
  static lerp(a, b, t) {
    return a * (1 - t) + b * t;
  }
  static scaleCanvas(canvas, context, width, height) {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
    const ratio = devicePixelRatio / backingStoreRatio;
    if (devicePixelRatio !== backingStoreRatio) {
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
    } else {
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = "";
      canvas.style.height = "";
    }
    context.scale(ratio, ratio);
    return ratio;
  }
  static uuid() {
    return "xxxxxxxx".replace(/[x]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
};

// src/interfaces/IMouseEvent.ts
var MouseEventTypes;
(function(MouseEventTypes2) {
  MouseEventTypes2[MouseEventTypes2["DOWN"] = 0] = "DOWN";
  MouseEventTypes2[MouseEventTypes2["UP"] = 1] = "UP";
  MouseEventTypes2[MouseEventTypes2["MOVE"] = 2] = "MOVE";
  MouseEventTypes2[MouseEventTypes2["WHEEL"] = 3] = "WHEEL";
})(MouseEventTypes || (MouseEventTypes = {}));
var MouseButton;
(function(MouseButton2) {
  MouseButton2[MouseButton2["LEFT"] = 0] = "LEFT";
  MouseButton2[MouseButton2["MIDDLE"] = 1] = "MIDDLE";
  MouseButton2[MouseButton2["RIGHT"] = 2] = "RIGHT";
  MouseButton2[MouseButton2["BACK"] = 3] = "BACK";
  MouseButton2[MouseButton2["FORWARD"] = 4] = "FORWARD";
})(MouseButton || (MouseButton = {}));

// src/GraphPanAndZoom.ts
var GraphPanAndZoom = class {
  constructor(ctx, scaleFactor = 1.1) {
    this.ctx = ctx;
    this.scaleFactor = scaleFactor;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.transform = svg.createSVGMatrix();
    this._point = svg.createSVGPoint();
  }
  transformedPoint(x, y) {
    this._point.x = x;
    this._point.y = y;
    this._point = this._point.matrixTransform(this.transform.inverse());
    return { x: this._point.x, y: this._point.y };
  }
  onMouseDown(event) {
    if (event.button == MouseButton.RIGHT)
      return;
    this.dragStart = event.position;
  }
  onMouseUp(event) {
    this.dragStart = null;
    this.lastTouchDistance = null;
  }
  onMouseMove(event) {
    if (event.rawEvent instanceof TouchEvent && event.rawEvent.touches.length == 2) {
      if (!this.lastTouchDistance) {
        const touch12 = { x: event.rawEvent.touches[0].clientX, y: event.rawEvent.touches[0].clientY };
        const touch22 = { x: event.rawEvent.touches[1].clientX, y: event.rawEvent.touches[1].clientY };
        this.lastTouchDistance = Math.sqrt(Math.pow(touch22.x - touch12.x, 2) + Math.pow(touch22.y - touch12.y, 2));
        return;
      }
      const touch1 = { x: event.rawEvent.touches[0].clientX, y: event.rawEvent.touches[0].clientY };
      const touch2 = { x: event.rawEvent.touches[1].clientX, y: event.rawEvent.touches[1].clientY };
      const pointsMiddle = Utils.pointsMidPoint({ x: touch1.x, y: touch1.y }, { x: touch2.x, y: touch2.y });
      const currentDistance = Math.sqrt(Math.pow(touch2.x - touch1.x, 2) + Math.pow(touch2.y - touch1.y, 2));
      const distanceDelta = this.lastTouchDistance - currentDistance;
      event.wheelDelta = distanceDelta;
      event.position = this.transformedPoint(pointsMiddle.x, pointsMiddle.y);
      this.onMouseWheel(event);
      this.lastTouchDistance = currentDistance;
    } else {
      if (this.dragStart) {
        const dx = event.position.x - this.dragStart.x;
        const dy = event.position.y - this.dragStart.y;
        this.transform = this.transform.translate(dx, dy);
        this.ctx.translate(dx, dy);
      }
    }
  }
  onMouseWheel(event) {
    var delta = -event.wheelDelta / 40;
    if (delta) {
      const factor = Math.pow(this.scaleFactor, delta);
      const pt = event.position;
      this.ctx.translate(pt.x, pt.y);
      this.ctx.scale(factor, factor);
      this.ctx.translate(-pt.x, -pt.y);
      this.transform = this.transform.translate(pt.x, pt.y);
      this.transform = this.transform.scaleNonUniform(factor, factor);
      this.transform = this.transform.translate(-pt.x, -pt.y);
    }
  }
};

// src/GraphSelection.ts
var GraphSelection = class {
  constructor(graph) {
    this.graph = graph;
    this.mousePosition = { x: 0, y: 0 };
  }
  draw(ctx) {
    ctx.save();
    if (this.selectedNode) {
      ctx.strokeStyle = "#e74c3c";
      ctx.strokeRect(this.selectedNode.properties.position.x, this.selectedNode.properties.position.y, this.selectedNode.properties.size.w, this.selectedNode.properties.size.h);
    }
    ctx.restore();
  }
  bringNodeToForeground(node) {
    const nodeIndex = this.graph.nodes.indexOf(node);
    if (nodeIndex != -1) {
      const foregroundNode = this.graph.nodes.splice(nodeIndex, 1)[0];
      this.graph.nodes.push(foregroundNode);
    }
  }
  onMouseDown(event) {
    if (event.button == MouseButton.RIGHT)
      return;
    this.mousePosition = event.position;
    this.isMouseDown = true;
    if (this.selectedNode) {
      if (!Utils.isPointInsideRect(this.selectedNode.properties.position, this.selectedNode.properties.size, event.position)) {
        this.selectedNode = null;
      }
    }
    for (let node of this.graph.nodes) {
      if (Utils.isPointInsideRect(node.properties.position, node.properties.size, event.position)) {
        this.selectedNode = node;
        this.selectedNodePositionOffset = { x: event.position.x - this.selectedNode.properties.position.x, y: event.position.y - this.selectedNode.properties.position.y };
        this.bringNodeToForeground(this.selectedNode);
      }
    }
  }
  onMouseUp(event) {
    this.mousePosition = event.position;
    this.isMouseDown = false;
  }
  onMouseMove(event) {
    this.mousePosition = event.position;
    if (this.selectedNode && this.isMouseDown) {
      this.selectedNode.properties.position.x = event.position.x - this.selectedNodePositionOffset.x;
      this.selectedNode.properties.position.y = event.position.y - this.selectedNodePositionOffset.y;
    }
    if (this.selectedNode) {
      return false;
    }
    return true;
  }
};

// src/GraphSerializer.ts
var GraphSerializer = class {
  static serializeNodeInputs(inputs) {
    let json = [];
    for (let input of inputs) {
      json.push(input.properties);
    }
    return json;
  }
  static serializeNodeOutputs(outputs) {
    let json = [];
    for (let output of outputs) {
      let obj = { properties: output.properties, connections: [] };
      for (let connection of output.connections) {
        obj.connections.push(connection.properties);
      }
      json.push(obj);
    }
    return json;
  }
  static serializeWidgets(widgets) {
    let json = [];
    for (let widget of widgets)
      json.push(widget.properties);
    return json;
  }
  static serializeNode(node) {
    return {
      node: node.properties,
      header: node.header.properties,
      inputs: this.serializeNodeInputs(node.inputs),
      outputs: this.serializeNodeOutputs(node.outputs),
      widgets: this.serializeWidgets(node.widgets)
    };
  }
  static toJSON(graph) {
    let json = [];
    for (let node of graph.nodes) {
      node.onSerialize();
      json.push(GraphSerializer.serializeNode(node));
    }
    return JSON.parse(JSON.stringify(json));
  }
  static fromJSON(graph, serialized) {
    graph.clearNodes();
    let nodes = new Map();
    let inputs = new Map();
    let outputs = new Map();
    for (let nodeEntry of serialized) {
      const nodeInstance = graph.createNode(nodeEntry.node.path);
      if (nodeInstance) {
        nodeInstance.properties = nodeEntry.node;
        nodeInstance.header.properties = nodeEntry.header;
        for (let i = 0; i < nodeEntry.inputs.length; i++) {
          const inputEntry = nodeEntry.inputs[i];
          const inputInstance = nodeInstance.inputs[i] ? nodeInstance.inputs[i] : nodeInstance.addInput(inputEntry.name, inputEntry.type);
          inputInstance.properties = inputEntry;
          inputs.set(inputInstance.properties.uuid, inputInstance);
        }
        for (let i = 0; i < nodeEntry.outputs.length; i++) {
          const outputEntry = nodeEntry.outputs[i];
          const outputInstance = nodeInstance.outputs[i] ? nodeInstance.outputs[i] : nodeInstance.addOutput(outputEntry.properties.name, outputEntry.properties.type);
          outputInstance.properties = outputEntry.properties;
          outputs.set(outputInstance.properties.uuid, outputInstance);
        }
        nodes.set(nodeInstance.properties.uuid, nodeInstance);
      }
    }
    for (let nodeEntry of serialized) {
      const nodeInstance = nodes.get(nodeEntry.node.uuid);
      for (let output of nodeEntry.outputs) {
        for (let connection of output.connections) {
          const inputInstance = inputs.get(connection.to_slot);
          const outputInstance = outputs.get(connection.from_slot);
          nodeInstance.connectInputToOutput(outputInstance, inputInstance);
        }
      }
      nodeInstance.onDeserialized();
    }
  }
};

// src/Graph.ts
var Graph = class {
  constructor(canvas) {
    this.nodes = [];
    this.dirtyCanvas = true;
    this.panAndZoomEnabled = true;
    this.nodeSelectionEnabled = true;
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    canvas.addEventListener("mousedown", (event) => this.onMouseOrTouchDown(event));
    canvas.addEventListener("mouseup", (event) => this.onMouseOrTouchUp(event));
    canvas.addEventListener("mousemove", (event) => this.onMouseOrTouchMove(event));
    canvas.addEventListener("wheel", (event) => this.onMouseWheel(event));
    canvas.addEventListener("touchstart", (event) => this.onMouseOrTouchDown(event));
    canvas.addEventListener("touchend", (event) => this.onMouseOrTouchUp(event));
    canvas.addEventListener("touchmove", (event) => this.onMouseOrTouchMove(event));
    window.addEventListener("resize", (event) => this.onResize(event));
    this.graphPanAndZoom = new GraphPanAndZoom(this.ctx);
    this.graphSelection = new GraphSelection(this);
    this.nodeTypes = new Map();
    requestAnimationFrame(() => {
      this.draw(this.ctx);
    });
    this.onResize(null);
  }
  registerNode(path, node) {
    this.nodeTypes.set(path, node);
  }
  unregisterNode(path) {
    this.nodeTypes.delete(path);
  }
  clearNodes() {
    for (let node of this.nodes) {
      node.onRemoved();
    }
    this.nodes = [];
    this.dirtyCanvas = true;
  }
  createNode(path, title = "") {
    if (this.nodeTypes.has(path)) {
      const Node = this.nodeTypes.get(path);
      const nodeInstance = new Node(this, path, title);
      this.nodes.push(nodeInstance);
      nodeInstance.onAdded();
      return nodeInstance;
    }
    return null;
  }
  draw(ctx) {
    if (this.dirtyCanvas) {
      this.dirtyCanvas = false;
      var p1 = this.graphPanAndZoom.transformedPoint(0, 0);
      var p2 = this.graphPanAndZoom.transformedPoint(ctx.canvas.width, ctx.canvas.height);
      ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      for (let node of this.nodes) {
        node.draw(ctx);
      }
      this.graphSelection.draw(ctx);
    }
    requestAnimationFrame(() => {
      this.draw(this.ctx);
    });
  }
  processMouseOrTouchEvent(event, type) {
    let mouseEvent = { position: { x: 0, y: 0 }, button: 0, rawEvent: event };
    if (event instanceof MouseEvent) {
      mouseEvent.position = this.graphPanAndZoom.transformedPoint(event.offsetX, event.offsetY);
      mouseEvent.button = event.button;
    }
    if (event instanceof TouchEvent) {
      const canvasBoundingRect = this.canvas.getBoundingClientRect();
      mouseEvent.position = this.graphPanAndZoom.transformedPoint(event.changedTouches[0].clientX - canvasBoundingRect.x, event.changedTouches[0].clientY - canvasBoundingRect.y);
    }
    if (event instanceof WheelEvent) {
      mouseEvent.position = this.graphPanAndZoom.transformedPoint(event.offsetX, event.offsetY);
      mouseEvent.button = event.button;
      mouseEvent.wheelDelta = event.deltaY;
    }
    this.dirtyCanvas = true;
    for (let node of this.nodes) {
      node.onMouseEvent(mouseEvent, type);
    }
    return mouseEvent;
  }
  onMouseWheel(event) {
    const mouseEvent = this.processMouseOrTouchEvent(event, MouseEventTypes.WHEEL);
    if (this.panAndZoomEnabled)
      this.graphPanAndZoom.onMouseWheel(mouseEvent);
    event.preventDefault();
  }
  onMouseOrTouchUp(event) {
    const mouseEvent = this.processMouseOrTouchEvent(event, MouseEventTypes.UP);
    this.graphPanAndZoom.onMouseUp(mouseEvent);
    this.graphSelection.onMouseUp(mouseEvent);
    event.preventDefault();
  }
  onMouseOrTouchDown(event) {
    const mouseEvent = this.processMouseOrTouchEvent(event, MouseEventTypes.DOWN);
    if (this.panAndZoomEnabled)
      this.graphPanAndZoom.onMouseDown(mouseEvent);
    if (this.nodeSelectionEnabled)
      this.graphSelection.onMouseDown(mouseEvent);
    event.preventDefault();
  }
  onMouseOrTouchMove(event) {
    const mouseEvent = this.processMouseOrTouchEvent(event, MouseEventTypes.MOVE);
    const graphSelectionBubble = this.graphSelection.onMouseMove(mouseEvent);
    if (graphSelectionBubble) {
      this.graphPanAndZoom.onMouseMove(mouseEvent);
    }
    event.preventDefault();
  }
  onResize(event) {
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = this.canvas.parentElement.clientHeight;
    Utils.scaleCanvas(this.canvas, this.ctx, this.canvas.width, this.canvas.height);
    this.graphPanAndZoom = new GraphPanAndZoom(this.ctx);
    this.dirtyCanvas = true;
  }
  toJSON() {
    return GraphSerializer.toJSON(this);
  }
  fromJSON(serialized) {
    GraphSerializer.fromJSON(this, serialized);
  }
};

// src/defaults/NodeProperties.ts
var NodeProperties = class {
  static default() {
    return {
      uuid: Utils.uuid(),
      path: "",
      color: "#353535",
      position: { x: 0, y: 0 },
      size: { w: 200, h: 50 },
      image: null,
      pattern: null
    };
  }
};

// src/node/GraphNode.ts
var GraphNode = class {
  constructor(graph, path, title) {
    this.onMouseEvent = (event, type) => {
      if (type == MouseEventTypes.UP && this.onMouseUp)
        this.onMouseUp(event);
      else if (type == MouseEventTypes.DOWN && this.onMouseDown)
        this.onMouseDown(event);
      else if (type == MouseEventTypes.MOVE && this.onMouseMove)
        this.onMouseMove(event);
      else if (type == MouseEventTypes.WHEEL && this.onMouseWheel)
        this.onMouseWheel(event);
    };
    this.graph = graph;
    this.properties = NodeProperties.default();
    this.properties.path = path;
  }
  onAdded() {
  }
  onRemoved() {
  }
  onSerialize() {
  }
  onDeserialized() {
  }
  onMouseUp(event) {
  }
  onMouseDown(event) {
  }
  onMouseMove(event) {
  }
  onMouseWheel(event) {
  }
  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.properties.color;
    if (this.properties.image) {
      this.properties.size = { w: this.properties.image.width, h: this.properties.image.height };
      ctx.drawImage(this.properties.image, this.properties.position.x, this.properties.position.y);
    }
    ctx.strokeRect(this.properties.position.x, this.properties.position.y, this.properties.size.w, this.properties.size.h);
    ctx.restore();
  }
};

// src/embroidery/Embroidery.ts
var Embroidery = class {
  constructor(canvas) {
    const buttons = document.createElement("div");
    buttons.classList.add("buttons-box");
    buttons.innerHTML = `
        <style>
            .buttons-box {
                position: absolute;
                top: 0px;
                left: 0px;
                width: 100%;
                font-family: sans-serif;
                display: flex;
            }

            input[type="file"] {
                display: none;
            }

            .custom-file-upload {
                border: 1px solid #ccc;
                display: inline-block;
                padding: 6px 12px;
                cursor: pointer;
                text-align: center;
                width: 50%;
                background-color: aliceblue;
                font-size: 16px;
                color: black;
                margin: 0px;
            }

            .custom-file-export {
                border: 1px solid #ccc;
                display: inline-block;
                padding: 6px 12px;
                cursor: pointer;
                text-align: center;
                width: 50%;
                background-color: aliceblue
            }
        </style>
        <label for="file-import-pes" class="custom-file-upload">
            \u2B07 Import PES
        </label>
        <input id="file-import-pes" type="file" accept=".pes"/>

        <button id="file-export-pes" class="custom-file-upload">\u2B06 Export PES</button>
        `;
    document.body.appendChild(buttons);
    this.fileInput = buttons.querySelector("#file-import-pes");
    this.fileInput.addEventListener("change", () => {
      this.load_pes_file_from_input(this.fileInput);
    });
    this.fileExport = buttons.querySelector("#file-export-pes");
    this.fileExport.addEventListener("click", () => {
      this.onFileExportClicked();
    });
    this.embroideryCanvas = document.createElement("canvas");
    this.embroideryCanvas.style.display = "none";
    document.body.appendChild(this.embroideryCanvas);
    this.graph = new Graph(canvas);
    this.graph.registerNode("Embroidery", GraphNode);
  }
  onFileExportClicked() {
    let outputFile = new PyFile([]);
    let outputPattern = new EmbPattern();
    let nodeCount = 0;
    for (let node of this.graph.nodes) {
      const pattern = node.properties.pattern;
      const firstStitch = pattern.stitches[0];
      if (nodeCount > 0) {
        outputPattern.stitches.push([firstStitch[0], firstStitch[1], EmbConstant.JUMP]);
      }
      for (let thread of pattern.threadlist) {
        outputPattern.threadlist.push(thread);
      }
      const extents = node.properties.pattern.extents();
      const currentPositionOffset = [node.properties.position.x - extents[0], node.properties.position.y - extents[1]];
      for (let stitch of pattern.stitches) {
        outputPattern.stitches.push([
          stitch[0] + currentPositionOffset[0],
          stitch[1] + currentPositionOffset[1],
          stitch[2]
        ]);
      }
      const lastStitch = outputPattern.stitches[outputPattern.stitches.length - 1];
      if (lastStitch[2] == EmbConstant.END && nodeCount != this.graph.nodes.length - 1) {
        outputPattern.stitches.splice(outputPattern.stitches.length - 1);
      }
      nodeCount++;
    }
    write(outputPattern, outputFile);
    this.saveByteArray([new Uint8Array(outputFile.data)], "example.pes");
  }
  saveByteArray(data, name) {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    var blob = new Blob(data, { type: "octet/stream" });
    var url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
  }
  load_pes_file_from_input(input) {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result;
        const array = new Uint8Array(arrayBuffer);
        try {
          const pattern = this.load_pes_from_array(array);
          this.add_pattern_to_scene(pattern);
          resolve(array);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => {
        reject();
      };
      reader.readAsArrayBuffer(input.files[0]);
    });
  }
  load_pes_from_array(array) {
    const pesPyFile = new PyFile(array);
    let pattern = new EmbPattern();
    read(pesPyFile, pattern);
    return pattern;
  }
  convertCanvasToImage(canvas) {
    let image = new Image();
    image.src = canvas.toDataURL();
    return image;
  }
  draw_pes_pattern_extents(ctx, pattern, offset) {
    const extents = pattern.extents();
    ctx.strokeStyle = "blue";
    const posStart = [extents[0] + offset[0], extents[1] + offset[1]];
    const posEnd = [extents[2] + offset[0], extents[3] + offset[1]];
    ctx.strokeRect(posStart[0], posStart[1], posEnd[0] - posStart[0], posEnd[1] - posStart[1]);
  }
  stitches_to_image(pattern) {
    const extents = pattern.extents();
    const width = extents[2] - extents[0];
    const height = extents[3] - extents[1];
    this.embroideryCanvas.width = width;
    this.embroideryCanvas.height = height;
    const ctx = this.embroideryCanvas.getContext("2d");
    ctx.beginPath();
    const offset = [-extents[0], -extents[1]];
    let currentThreadIndex = 0;
    ctx.strokeStyle = "#" + pattern.threadlist[currentThreadIndex].hex_color();
    for (let stitch of pattern.stitches) {
      const [x, y, cmd] = stitch;
      if (cmd === 5) {
        ctx.closePath();
        ctx.beginPath();
        currentThreadIndex++;
        ctx.strokeStyle = "#" + pattern.threadlist[currentThreadIndex].color.toString(16);
      }
      ctx.lineTo(x + offset[0], y + offset[1]);
      ctx.stroke();
    }
    ctx.closePath();
    return this.convertCanvasToImage(this.embroideryCanvas);
  }
  add_pattern_to_scene(pattern) {
    const extents = pattern.extents();
    console.log(extents);
    const image = this.stitches_to_image(pattern);
    const node = this.graph.createNode("Embroidery", "");
    node.properties.image = image;
    node.properties.position.x = extents[0];
    node.properties.position.y = extents[1];
    node.properties.pattern = pattern;
    this.graph.dirtyCanvas = true;
  }
};
export {
  EmbPattern,
  Embroidery,
  PyFile,
  read as read_pes
};
