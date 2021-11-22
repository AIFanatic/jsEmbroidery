import { NodeProperties } from "../defaults/NodeProperties";
import { Graph } from "../Graph";
import { INodeProperties } from "../interfaces/INodeProperties";
import { IPosition } from "../interfaces/IPosition";
import { ISize } from "../interfaces/ISize";

import { IMouseEvent, MouseEventTypes } from "../interfaces/IMouseEvent";

export class GraphNode {
    public graph: Graph;
    
    public properties: INodeProperties;

    public onAdded() {};
    public onRemoved() {};
    public onSerialize() {};
    public onDeserialized() {};
    
    public onMouseUp(event: IMouseEvent) {};
    public onMouseDown(event: IMouseEvent) {};
    public onMouseMove(event: IMouseEvent) {};
    public onMouseWheel(event: IMouseEvent) {};

    constructor(graph: Graph, path: string, title?: string) {
        this.graph = graph;
        this.properties = NodeProperties.default();
        this.properties.path = path;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.fillStyle = this.properties.color;

        
        if (this.properties.image) {
            this.properties.size = {w: this.properties.image.width, h: this.properties.image.height}
            ctx.drawImage(this.properties.image, this.properties.position.x, this.properties.position.y);
        }
        ctx.strokeRect(this.properties.position.x, this.properties.position.y, this.properties.size.w, this.properties.size.h);
        
        ctx.restore();
    }

    public onMouseEvent = (event: IMouseEvent, type: MouseEventTypes) => {
        if (type == MouseEventTypes.UP && this.onMouseUp) this.onMouseUp(event);
        else if (type == MouseEventTypes.DOWN && this.onMouseDown) this.onMouseDown(event);
        else if (type == MouseEventTypes.MOVE && this.onMouseMove) this.onMouseMove(event);
        else if (type == MouseEventTypes.WHEEL && this.onMouseWheel) this.onMouseWheel(event);
    };
}