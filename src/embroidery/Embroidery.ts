import { EmbPattern } from "./EmbPattern";
import { PyFile } from "./PyFile";
import { read as read_pes } from "./PesReader";
import { write as write_pes } from "./PesWriter";

import { Graph } from "../Graph";
import { GraphNode } from "../node/GraphNode";
import { EmbConstant } from "./EmbConstant";

import * as ImageTracer from 'imagetracerjs';
import * as potrace from 'potrace';

export class Embroidery {
    private graph: Graph;

    private embroideryCanvas: HTMLCanvasElement;
    private fileInput: HTMLInputElement;
    private fileExport: HTMLButtonElement;

    private previousTranslation: number[];

    constructor(canvas: HTMLCanvasElement) {
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
            ⬇ Import PES
        </label>
        <input id="file-import-pes" type="file" accept=".pes"/>

        <button id="file-export-pes" class="custom-file-upload">⬆ Export PES</button>
        `
        document.body.appendChild(buttons);

        this.fileInput = buttons.querySelector("#file-import-pes");
        this.fileInput.addEventListener('change', () => {this.load_pes_file_from_input(this.fileInput)});

        this.fileExport = buttons.querySelector("#file-export-pes");
        this.fileExport.addEventListener("click", () => {this.onFileExportClicked()})

        this.embroideryCanvas = document.createElement("canvas");
        this.embroideryCanvas.style.display = "none";
        document.body.appendChild(this.embroideryCanvas);


        this.graph = new Graph(canvas);
        this.graph.registerNode("Embroidery", GraphNode);


        // const svgBox = document.createElement("div");
        // document.body.appendChild(svgBox)
        // // ImageTracer.imageToSVG(
        // //     "./data/smile-transparent.png",
        // //     (svg) => {
        // //         svgBox.innerHTML = svg;
        // //         console.log("svg", svg)
        // //     }
        // // )
        // // console.log("here", ImageTracer)

        // potrace.trace('./data/spiral.png', null, function(err, svg) {
        //     if (err) throw err;
        //     console.log(svg)
        //     svgBox.innerHTML = svg;
        // });

        // console.log(potrace)
    }

    private onFileExportClicked() {
        let outputFile = new PyFile([]);
        let outputPattern = new EmbPattern();
        
        let nodeCount = 0;
        for (let node of this.graph.nodes) {
            const pattern = node.properties.pattern;

            // If theres more than two patterns move the needle to the first stitch of this pattern
            const firstStitch = pattern.stitches[0];
            if (nodeCount > 0) {
                outputPattern.stitches.push([firstStitch[0], firstStitch[1], EmbConstant.JUMP]);
            }

            for (let thread of pattern.threadlist) {
                outputPattern.threadlist.push(thread);    
            }
            // outputPattern.threadlist.push(...pattern.threadlist);

            // Translate the stitches to the current node location
            const extents = node.properties.pattern.extents();
            const currentPositionOffset = [node.properties.position.x - extents[0], node.properties.position.y - extents[1]];

            for (let stitch of pattern.stitches) {
                outputPattern.stitches.push([
                    stitch[0] + currentPositionOffset[0],
                    stitch[1] + currentPositionOffset[1],
                    stitch[2]
                ])
            }

            // If not the last pattern, delete last stitch (END stitch)
            const lastStitch = outputPattern.stitches[outputPattern.stitches.length-1];
            if (lastStitch[2] == EmbConstant.END && nodeCount != this.graph.nodes.length-1) {
                outputPattern.stitches.splice(outputPattern.stitches.length-1);
            }

            nodeCount++;
        }

        write_pes(outputPattern, outputFile);

        this.saveByteArray([new Uint8Array(outputFile.data)], 'example.pes');
    }

    private saveByteArray(data, name) {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = "none";
        
        var blob = new Blob(data, {type: "octet/stream"});
        var url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Load PES file from input
    private load_pes_file_from_input(input: HTMLInputElement): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.onload = () => {
                const arrayBuffer = reader.result as ArrayBuffer;
                const array = new Uint8Array(arrayBuffer);

                try {
                    const pattern = this.load_pes_from_array(array);
                    this.add_pattern_to_scene(pattern);

                    resolve(array);
                } catch (error) {
                    reject(error);
                }
            }
            reader.onerror = () => {
                reject()
            }
            reader.readAsArrayBuffer(input.files[0]);
        })
    }

    private load_pes_from_array(array: Uint8Array) {
        const pesPyFile = new PyFile(array as any);
        let pattern = new EmbPattern();
        read_pes(pesPyFile, pattern);

        return pattern;
    }

    private convertCanvasToImage(canvas: HTMLCanvasElement): HTMLImageElement {
        let image = new Image();
        image.src = canvas.toDataURL();
        return image;
    }

    private draw_pes_pattern_extents(ctx, pattern, offset) {
        const extents = pattern.extents();

        ctx.strokeStyle = "blue"
        const posStart = [extents[0] + offset[0], extents[1] + offset[1]];
        const posEnd = [extents[2] + offset[0], extents[3] + offset[1]];

        ctx.strokeRect(
            posStart[0],
            posStart[1],
            posEnd[0] - posStart[0],
            posEnd[1] - posStart[1],
        )
    }

    private stitches_to_image(pattern: EmbPattern): HTMLImageElement {
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

    private add_pattern_to_scene(pattern: EmbPattern) {
        const extents = pattern.extents();
        console.log(extents)

        const image = this.stitches_to_image(pattern);

       
        const node = this.graph.createNode("Embroidery", "");
        node.properties.image = image;
        node.properties.position.x = extents[0];
        node.properties.position.y = extents[1];

        node.properties.pattern = pattern;

        setTimeout(() => {
            this.graph.dirtyCanvas = true;
        }, 100);
    }
}