import { Graph } from "./Graph";
import { GraphNode } from "./node/GraphNode";
import { IPosition } from "./interfaces/IPosition";
import { Utils } from "./Utils";
import { IMouseEvent, MouseButton } from "./interfaces/IMouseEvent";

export class GraphSelection {
    private graph: Graph;
    private selectedNode: GraphNode;
    private selectedNodePositionOffset: IPosition;
    private mousePosition: IPosition;
    private isMouseDown: boolean;

    constructor(graph: Graph) {
        this.graph = graph;

        this.mousePosition = {x: 0, y: 0};
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        if (this.selectedNode) {
            ctx.strokeStyle = "#e74c3c";
            ctx.strokeRect(this.selectedNode.properties.position.x, this.selectedNode.properties.position.y, this.selectedNode.properties.size.w, this.selectedNode.properties.size.h);
        }
        ctx.restore();
    }

    private bringNodeToForeground(node: GraphNode) {
        const nodeIndex = this.graph.nodes.indexOf(node);
        if (nodeIndex != -1) {
            const foregroundNode = this.graph.nodes.splice(nodeIndex, 1)[0];
            this.graph.nodes.push(foregroundNode);
        }
    }

    public onMouseDown(event: IMouseEvent) {
        if (event.button == MouseButton.RIGHT) return;
        if (event.rawEvent instanceof TouchEvent && event.rawEvent.touches.length > 1) {
            this.selectedNode = null;
            return;
        }
        
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
                this.selectedNodePositionOffset = {x: event.position.x - this.selectedNode.properties.position.x, y: event.position.y - this.selectedNode.properties.position.y};
                this.bringNodeToForeground(this.selectedNode);
            }
        }
    }

    public onMouseUp(event: IMouseEvent) {
        this.mousePosition = event.position;
        this.isMouseDown = false;
    }

    public onMouseMove(event: IMouseEvent): boolean {
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
}