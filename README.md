# SVG Tree printer
Simple tree drawing logic generating SVG image using D3 library.
## Algorithm
We use extremally simple recoursive function to print the tree. It walks and prints the tree in postorder traversal mode and it's complexity is **O(n)**.

This way we first print the children so then we know where to print the parent (exactly in the middle of them).

Printing order:

```
              12
       ┍------+-----┑
       6            11
    ┍--+--┑      ┍--+--┑
    1     5      7     10
       ┍--|--┑      ┍--+--┑
       2  3  4      8     9
```

Steps:
1. If it has children draw them first
    * pass current `x` and incremented depth to the recursive call
    * set the value of `x` based on returned result (shifted x if children were printed)
2. Set final coordinates based on passed `x` and current `depth`
3. Draw the node
    * it draws connection lines to all the children (as they were drawn already)
4. Return new `x` value - the minimal value where the next node can be drawn. It has to be the end of the most right descendant incremented by the space (which we want to have between the nodes)


## Listing
```typescript
function drawSubTree(node: Node, x: number, depth: number, container: d3.Selection<"g">) {
    for (const child of node.children) {
        x = drawSubTree(child, x, depth + 1, container);
    }

    node.setCoords(x, depth);

    node.print(container);

    return node.maxContainerX();
}
```

## Result
![Screenshot](https://github.com/maxwroc/SVGTree/blob/master/screen.png)