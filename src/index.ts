/**
 * SVGTree - index
 *
 * @copyright Copyright 2019, Max Chodorowski
 * @license   MIT (https://opensource.org/licenses/MIT)
 * @link      https://maxwroc.github.io/SVGTree/
 */
module SVGTree {

    // tree data
    let treeData: INodeData[] = [
        { id: 1, name: "A" },
        { id: 2, name: "B", parent: 1 },
        { id: 3, name: "C", parent: 1 },
        { id: 4, name: "D", parent: 1 },
        { id: 5, name: "E", parent: 4 },
        { id: 6, name: "F", parent: 4 },
        { id: 7, name: "G", parent: 4 },
        { id: 8, name: "H", parent: 2 },
        { id: 9, name: "I", parent: 2 },
    ];

    function processDataAndGetRootNode(treeData: INodeData[]): Node {
        let root: Node = null;
        // helper collectiont to store
        let childrenToAddLater: IMap<Node[]> = {};

        // create basic node obj
        treeData.reduce((idToNodeMap, nodeData) => {
            idToNodeMap[nodeData.id] = new Node(nodeData.name);

            // check if there were any children nodes initialized earlier
            if (childrenToAddLater[nodeData.id]) {
                childrenToAddLater[nodeData.id].forEach(child => idToNodeMap[nodeData.id].children.push(child));
                delete childrenToAddLater[nodeData.id];
            }

            // if there is no parent it is the root node
            if (!nodeData.parent) {
                root = idToNodeMap[nodeData.id];
            }
            else {
                // check if parent was initialized already
                if (idToNodeMap[nodeData.parent]) {
                    // add child to the parent
                    idToNodeMap[nodeData.parent].children.push(idToNodeMap[nodeData.id]);
                }
                else {
                    // since parent was not initialized yet we store new node in helper collection and we will add it later
                    childrenToAddLater[nodeData.parent] = childrenToAddLater[nodeData.parent] || [];
                    childrenToAddLater[nodeData.parent].push(idToNodeMap[nodeData.id]);
                }
            }
            return idToNodeMap;
        }, {} as IMap<Node>);

        return root;
    }

    window.addEventListener("load", () => {
        Canvas.drawTree(processDataAndGetRootNode(treeData));
    });
}