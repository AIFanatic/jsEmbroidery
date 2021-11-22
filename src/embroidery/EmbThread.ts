import { StringHelpers } from "./StringHelpers"

function find_nearest_color_index(find_color, values: EmbThread[]) {
    if (typeof find_color === typeof EmbThread) {
        find_color = find_color.color
    }
    const red = (find_color >> 16) & 0xff
    const green = (find_color >> 8) & 0xff
    const blue = find_color & 0xff
    let closest_index = -1
    let current_index = -1
    let current_closest_value = Infinity
    for (let t of values) {
        current_index += 1
        if (!t)
            continue
        const dist = color_distance_red_mean(
            red,
            green,
            blue,
            t.get_red(),
            t.get_green(),
            t.get_blue())
        if (dist <= current_closest_value) {  // <= choose second if they tie.
            current_closest_value = dist
            closest_index = current_index
        }
    }
    return closest_index
}

function color_distance_red_mean(r1, g1, b1, r2, g2, b2) {
    let red_mean = Math.round((r1 + r2) / 2)
    const r = r1 - r2
    const g = g1 - g2
    const b = b1 - b2
    return (((512 + red_mean) * r * r) >> 8) + 4 * g * g + (((767 - red_mean) * b * b) >> 8)
    // See the very good color distance paper:
    // https://www.compuphase.com/cmetric.htm
}


export class EmbThread {
    public color: number;
    public description: string;
    public catalog_number: string;
    public details: string;
    public brand: string;
    public chart: string;
    public weight: string;

    constructor() {
        this.color = 0xFF000000
        // description, catalog_number, details, brand, chart, weight
    }

    set_color(r, g, b) {
        this.color = (r << 16) + (g << 8) + (b);
    }

    get_opaque_color() {
        return 0xFF000000 | this.color
    }

    get_red() {
        return (this.color >> 16) & 0xFF
    }

    get_green() {
        return (this.color >> 8) & 0xFF
    }

    get_blue() {
        return this.color & 0xFF
    }

    find_nearest_color_index(values) {
        return find_nearest_color_index(this.color, values)
    }

    hex_color() {
        // return "//%02x%02x%02x" % (this.get_red(), this.get_green(), this.get_blue())
        let color = this.color.toString(16);
        if (color.length < 6) color = "0" + color;
        return color
    }

    set_hex_color(hex_string: string) {
        // hex_string.lstrip('//')
        const h = StringHelpers.lstrip(hex_string, "//");
        const size = h.length;
        if (size == 6 || size == 8) {
            this.color = parseInt(h.substring(0,6), 16)
        }
        else if (size == 4 || size == 3) {
            this.color = parseInt(h[2] + h[2] + h[1] + h[1] + h[0] + h[0], 16)
        }
    }
}