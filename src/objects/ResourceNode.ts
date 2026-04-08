import { type ResourceData } from "src/objects/ResourceData";

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export default class ResourceNode {
  #position: Position;
  #size: Size;
  #parent: ResourceNode | null;
  #children: ResourceNode[];
  #content: ResourceData;

  private constructor(
    position: Position,
    size: Size,
    content: ResourceData,
    parent: ResourceNode | null = null,
  ) {
    this.#position = position;
    this.#size = size;
    this.#content = content;
    this.#parent = parent;
    this.#children = [];
  }

  static create(
    position: Position,
    size: Size,
    content: ResourceData,
    parent?: ResourceNode,
  ): ResourceNode {
    const node = new ResourceNode(position, size, content, parent || null);
    if (parent) {
      parent.addChild(node);
    }
    return node;
  }

  get position(): Position {
    return { ...this.#position };
  }

  set position(position: Position) {
    this.#position = position;
  }

  get size(): Size {
    return { ...this.#size };
  }

  set size(size: Size) {
    this.#size = size;
  }

  get parent(): ResourceNode | null {
    return this.#parent;
  }

  get children(): readonly ResourceNode[] {
    return this.#children;
  }

  get content(): ResourceData {
    return this.#content;
  }

  set content(content: ResourceData) {
    this.#content = content;
  }

  addChild(child: ResourceNode): void {
    if (child.#parent !== null && child.#parent !== this) {
      throw new Error("Child already has a different parent");
    }
    if (!this.#children.includes(child)) {
      this.#children.push(child);
      child.#parent = this;
    }
  }

  removeChild(child: ResourceNode): void {
    const index = this.#children.indexOf(child);
    if (index !== -1) {
      this.#children.splice(index, 1);
      child.#parent = null;
    }
  }

  setParent(newParent: ResourceNode | null): void {
    if (this.#parent === newParent) {
      return;
    }

    // Remove from current parent
    if (this.#parent !== null) {
      this.#parent.removeChild(this);
    }

    // Set new parent
    this.#parent = newParent;

    // Add to new parent's children
    if (newParent !== null) {
      newParent.addChild(this);
    }
  }

  isRoot(): boolean {
    return this.#parent === null;
  }

  isLeaf(): boolean {
    return this.#children.length === 0;
  }

  findRoot(): ResourceNode {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let current: ResourceNode = this;
    while (current.#parent !== null) {
      current = current.#parent;
    }
    return current;
  }

  get depth(): number {
    let depth = 0;
    let current: ResourceNode | null = this.#parent;
    while (current !== null) {
      depth++;
      current = current.#parent;
    }
    return depth;
  }
}
