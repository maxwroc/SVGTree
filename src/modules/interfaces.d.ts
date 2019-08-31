interface IMap<T> {
    [key: number]: T
}

interface ICoords {
    x: number,
    y: number,
    // whether x & y values are relative (not absolute)
    isRelative?: boolean
}

interface INodeData {
    id: number,
    name: string,
    parent?: number
}