import { EmbPattern } from "..";
import { IPosition } from "./IPosition";
import { ISize } from "./ISize";

export interface INodeProperties {
    uuid: string;
    path: string,
    color: string;
    position: IPosition;
    size: ISize;

    image: HTMLImageElement;
    pattern: EmbPattern;
}