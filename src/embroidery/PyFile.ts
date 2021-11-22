export class PyFile {
    private offset: number = 0;
    private data: number[];

    constructor(data: []) {
        this.data = data;
    }

    public tell(): number {
        return this.offset;
    }

    public seek(offset: number, whence?: number) {
        if (whence == 1) {
            this.offset += offset;
        }
        else if (whence == 2) {
            this.offset = this.data.length - offset;
        }
        else {
            this.offset = offset;
        }
    }

    public read(length: number): number[] {
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

    public write(data) {
        for (let b of data) {
            // this.data.push(b);
            // this.offset++;
            this.data[this.offset] = b;
            this.offset++;
        }

        // const zeroPad = (num, places) => String(num).padStart(places, '0')

        // let str = "";
        // let c = 12;
        // for (let b of this.data) {
        //     str += "0x" + zeroPad(b.toString(16), 2) + ", ";
        //     c--;
        //     if (c == 0) {
        //         str += "\n";
        //         c = 12;
        //     }
        // }
        // console.warn("wrote", str)
    }
}