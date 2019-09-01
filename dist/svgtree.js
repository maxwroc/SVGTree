"use strict";
/**
 * SVGTree - index
 *
 * @copyright Copyright 2019, Max Chodorowski
 * @license   MIT (https://opensource.org/licenses/MIT)
 * @link      https://maxwroc.github.io/SVGTree/
 */
var SVGTree;
/**
 * SVGTree - index
 *
 * @copyright Copyright 2019, Max Chodorowski
 * @license   MIT (https://opensource.org/licenses/MIT)
 * @link      https://maxwroc.github.io/SVGTree/
 */
(function (SVGTree) {
    // tree data
    let treeData = [
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
    function processDataAndGetRootNode(treeData) {
        let root = null;
        // helper collectiont to store
        let childrenToAddLater = {};
        // create basic node obj
        treeData.reduce((idToNodeMap, nodeData) => {
            idToNodeMap[nodeData.id] = new SVGTree.Node(nodeData.name);
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
        }, {});
        return root;
    }
    window.addEventListener("load", () => {
        SVGTree.Canvas.drawTree(processDataAndGetRootNode(treeData));
    });
})(SVGTree || (SVGTree = {}));
/**
 * SVGTree - canvas
 *
 * @copyright Copyright 2019, Max Chodorowski
 * @license   MIT (https://opensource.org/licenses/MIT)
 * @link      https://maxwroc.github.io/SVGTree/
 */
var SVGTree;
/**
 * SVGTree - canvas
 *
 * @copyright Copyright 2019, Max Chodorowski
 * @license   MIT (https://opensource.org/licenses/MIT)
 * @link      https://maxwroc.github.io/SVGTree/
 */
(function (SVGTree) {
    var Canvas;
    (function (Canvas) {
        /**
         * Creates SVG and returns container for drawing the tree
         */
        function getContainer() {
            const svg = d3.select("body").append("svg")
                .attr("width", "100%")
                .attr("height", "100%");
            // background elem used for zooming and moving
            const background = svg.append("rect")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("fill", "#F2EEE4")
                .style("pointer-events", "all")
                .style("cursor", "grab");
            // main container where the tree is going to be drawn
            const container = svg.append("g")
                .style("vector-effect", "non-scaling-stroke");
            // create zoom event handler
            const zoom = d3.behavior.zoom()
                .scaleExtent([1, 10])
                .on("zoom", () => {
                let evt = d3.event;
                container.attr("transform", "translate(" + evt.translate + ")scale(" + evt.scale + ")");
            });
            // add zoom handler to the background
            background.call(zoom);
            return container;
        }
        /**
         * Walks over the tree (postorder) and draws the nodes starting from most left descendant.
         *
         * Nodes will be printed in the following order:
         *             12
         *      ┍------+-----┑
         *      6            11
         *   ┍--+--┑      ┍--+--┑
         *   1     5      7     10
         *      ┍--|--┑      ┍--+--┑
         *      2  3  4      8     9
         */
        function drawSubTree(node, x, depth, container) {
            for (const child of node.children) {
                x = drawSubTree(child, x, depth + 1, container);
            }
            node.setCoords(x, depth);
            node.print(container);
            return node.maxContainerX();
        }
        function drawTree(root) {
            drawSubTree(root, 80, // x - starting point od the tree
            1, // starting depth
            getContainer());
        }
        Canvas.drawTree = drawTree;
    })(Canvas = SVGTree.Canvas || (SVGTree.Canvas = {}));
})(SVGTree || (SVGTree = {}));
/**
 * SVGTree - node
 *
 * @copyright Copyright 2019, Max Chodorowski
 * @license   MIT (https://opensource.org/licenses/MIT)
 * @link      https://maxwroc.github.io/SVGTree/
 */
var SVGTree;
/**
 * SVGTree - node
 *
 * @copyright Copyright 2019, Max Chodorowski
 * @license   MIT (https://opensource.org/licenses/MIT)
 * @link      https://maxwroc.github.io/SVGTree/
 */
(function (SVGTree) {
    /**
     * Class representing single node in the tree
     */
    class Node {
        /**
         * Initializes class
         * @param name - text to print in the node
         */
        constructor(name) {
            this.name = name;
            // static appearance properties of node
            this.props = {
                width: 40,
                height: 40,
                rounded: 10,
                space: {
                    sibling: 10,
                    generation: 20
                }
            };
            // current node final/calculated coordinates
            this.coords = { x: 0, y: 0 };
            // children of current node
            this.children = [];
        }
        /**
         * Gets first child (throws when no children)
         */
        firstChild() {
            if (this.children.length == 0) {
                throw new Error("Node doesn't have children");
            }
            return this.children[0];
        }
        /**
         * Gets last child (throws when no children)
         */
        lastChild() {
            if (this.children.length == 0) {
                throw new Error("Node doesn't have children");
            }
            return this.children[this.children.length - 1];
        }
        /**
         * Sets final node coordinations
         *
         * This function must not be called before all children were drawn
         *
         * @param x - default x value (won't be used when more than 1 child)
         * @param depth - "level" number starting from root
         */
        setCoords(x, depth) {
            if (this.children.length < 2) {
                this.coords.x = x;
            }
            else {
                this.coords.x = Math.floor((this.firstChild().coords.x + this.lastChild().coords.x) / 2);
            }
            this.coords.y = depth * (this.props.height + this.props.space.generation);
        }
        /**
         * Returns minimal x value where next node on the same level can be drawn
         */
        maxContainerX() {
            // set default to end of the single box
            let maxx = this.coords.x + this.props.width;
            if (this.children.length > 1) {
                let mostRightDescendant = this.lastChild();
                while (mostRightDescendant.children.length) {
                    mostRightDescendant = mostRightDescendant.lastChild();
                }
                maxx = mostRightDescendant.coords.x + this.props.width;
            }
            return maxx + this.props.space.sibling;
        }
        /**
         * Draws node on given container
         * @param container - container where node should be drawn
         */
        print(container) {
            // since we want to render some elements in the node we create group to position them easier
            const boxGroup = container
                .append("g")
                .attr("transform", `translate(${this.coords.x},${this.coords.y})`);
            boxGroup.append("rect")
                .attrs({ x: 0, y: 0, width: this.props.width, height: this.props.height, fill: "rgb(159, 213, 235)" })
                .attr("rx", this.props.rounded)
                .attr("ry", this.props.rounded)
                .attr("stroke-width", 1.5)
                .attr("stroke", "rgb(142, 191, 211)");
            boxGroup.append("text")
                .attrs({
                x: Math.floor(this.props.width / 2),
                y: Math.floor(this.props.height / 2) + 2,
                "alignment-baseline": "middle",
                "text-anchor": "middle",
                textLength: this.props.width,
                style: "font-size: 24px; font-weight: bold; font-family: SANS-SERIF",
                fill: "rgb(77, 148, 177)"
            })
                .text(this.name);
            // draw connection line with children - since all of them should be rendered at this point
            this.connectChildren(container);
        }
        /**
         * Returns coordinates of center top point of the node
         */
        getMiddleTop() {
            return {
                x: this.coords.x + Math.floor(this.props.width / 2),
                y: this.coords.y,
                isRelative: false
            };
        }
        /**
         * Returns coordinates of center bottom point of the node
         */
        getMiddleBottom() {
            return {
                x: this.coords.x + Math.floor(this.props.width / 2),
                y: this.coords.y + this.props.height,
                isRelative: false
            };
        }
        /**
         * Draws connection lines between current node and its children
         * @param container - container where path should be added
         */
        connectChildren(container) {
            // if there is no children quit
            if (!this.children.length) {
                return;
            }
            // middle position between generations - depths
            let halfGenSpace = Math.floor(this.props.space.generation / 2);
            let path;
            if (this.children.length == 1) {
                // if there is only one child we just have to connecti it with streight line to the parent right above
                path = new SVGTree.Path(this.firstChild().getMiddleTop()).lineTo(0, -1 * this.props.space.generation);
            }
            else {
                // connecting first child with the last one
                path = new SVGTree.Path(this.firstChild().getMiddleTop())
                    .arcTo(halfGenSpace, -1 * halfGenSpace)
                    .lineTo(this.lastChild().getMiddleTop().x - halfGenSpace, null, false)
                    .arcTo(this.lastChild().getMiddleTop());
                // connectiong rest of children to the previously drawn line
                if (this.children.length > 2) {
                    for (let i = 1; i < this.children.length - 1; i++) {
                        path.moveTo(this.children[i].getMiddleTop()).lineTo(null, -1 * halfGenSpace);
                    }
                }
                // connect current node to the line
                path.moveTo(this.getMiddleBottom()).lineTo(0, halfGenSpace);
            }
            // render connection line
            container.append("path")
                .attr("d", path.getPath())
                .attr("stroke", "#000")
                .attr("stroke-width", 1)
                .attr("stroke-opacity", 0.3)
                .attr("fill", "none");
        }
    }
    SVGTree.Node = Node;
})(SVGTree || (SVGTree = {}));
/**
 * SVGTree - path
 *
 * @copyright Copyright 2019, Max Chodorowski
 * @license   MIT (https://opensource.org/licenses/MIT)
 * @link      https://maxwroc.github.io/SVGTree/
 */
var SVGTree;
/**
 * SVGTree - path
 *
 * @copyright Copyright 2019, Max Chodorowski
 * @license   MIT (https://opensource.org/licenses/MIT)
 * @link      https://maxwroc.github.io/SVGTree/
 */
(function (SVGTree) {
    /**
     * Class for generating paths
     */
    class Path {
        constructor(x, y) {
            this.path = "";
            this.currentPos = {
                x: 0,
                y: 0
            };
            this.markers = {};
            if (this.isCoordsObject(x)) {
                this.moveTo(x);
            }
            else {
                this.moveTo(x, y, false);
            }
        }
        lineTo(x, y, isRelative = true) {
            this.setCurrentPos(x, y, isRelative);
            this.path += `L ${this.currentPos.x} ${this.currentPos.y}`;
            return this;
        }
        arcTo(x, y, rx, ry, isRelative = true) {
            let oldPos = Object.assign({}, this.currentPos);
            this.setCurrentPos(x, y, isRelative);
            if (rx === undefined) {
                rx = Math.abs(oldPos.x - this.currentPos.x);
            }
            if (ry === undefined) {
                ry = Math.abs(oldPos.y - this.currentPos.y);
            }
            this.path += `A ${rx} ${ry} 0 0 1 ${this.currentPos.x} ${this.currentPos.y}`;
            return this;
        }
        moveTo(x, y, isRelative = true) {
            this.setCurrentPos(x, y, isRelative);
            this.path += `M ${this.currentPos.x} ${this.currentPos.y}`;
            return this;
        }
        /**
         * Sets marker with gived id
         *
         * You can mark current point if you'd like to start drawing from it later
         *
         * @param id - id of the marker
         */
        setMarker(id) {
            this.markers[id] = Object.assign({}, this.currentPos);
            return this;
        }
        /**
         * Moves current point to given (saved earlier) marker
         * @param id - id of the marker
         */
        moveToMarker(id) {
            return this.moveTo(this.markers[id].x, this.markers[id].y, false);
        }
        /**
         * Returns path data
         */
        getPath() {
            return this.path;
        }
        /**
         * Checks whether given variable is ICoords
         * @param obj - object to test
         */
        isCoordsObject(obj) {
            return typeof obj === "object" && obj !== null && obj.x !== undefined && obj.y !== undefined;
        }
        /**
         * Sets current position based on given data (resolves relative values)
         * @param x - target x or ICoords object
         * @param y - target y
         * @param isRelative - whether x & y are relative (not absolute values)
         */
        setCurrentPos(x, y, isRelative) {
            if (this.isCoordsObject(x)) {
                let coords = x;
                x = coords.x;
                y = coords.y;
                isRelative = coords.isRelative;
            }
            if (x == null) {
                x = isRelative ? 0 : this.currentPos.x;
            }
            if (y == null) {
                y = isRelative ? 0 : this.currentPos.y;
            }
            if (isRelative) {
                this.currentPos.x += x;
                this.currentPos.y += y;
            }
            else {
                this.currentPos.x = x;
                this.currentPos.y = y;
            }
        }
    }
    SVGTree.Path = Path;
})(SVGTree || (SVGTree = {}));
