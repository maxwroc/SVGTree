/**
 * SVGTree - node
 *
 * @copyright Copyright 2019, Max Chodorowski
 * @license   MIT (https://opensource.org/licenses/MIT)
 * @link      https://maxwroc.github.io/SVGTree/
 */
module SVGTree {
    /**
     * Class representing single node in the tree
     */
    export class Node {
        // static appearance properties of node
        private props = {
            width: 40,
            height: 40,
            rounded: 10,
            space: {
                sibling: 10,
                generation: 20
            }
        }

        // current node final/calculated coordinates
        private coords: ICoords = { x: 0, y: 0 };

        // children of current node
        public children: Node[] = [];

        /**
         * Initializes class
         * @param name - text to print in the node
         */
        constructor(private name: string) {

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
        setCoords(x: number, depth: number) {
            if (this.children.length < 2) {
                this.coords.x = x;
            }
            else {
                this.coords.x = Math.floor((this.firstChild().coords.x + this.lastChild().coords.x) / 2)
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
        print(container: any) {

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
        getMiddleTop(): ICoords {
            return {
                x: this.coords.x + Math.floor(this.props.width / 2),
                y: this.coords.y,
                isRelative: false
            }
        }

        /**
         * Returns coordinates of center bottom point of the node
         */
        getMiddleBottom(): ICoords {
            return {
                x: this.coords.x + Math.floor(this.props.width / 2),
                y: this.coords.y + this.props.height,
                isRelative: false
            }
        }

        /**
         * Draws connection lines between current node and its children
         * @param container - container where path should be added
         */
        private connectChildren(container: d3.Selection<"g">) {
            // if there is no children quit
            if (!this.children.length) {
                return;
            }

            // middle position between generations - depths
            let halfGenSpace = Math.floor(this.props.space.generation / 2);

            let path: Path;
            if (this.children.length == 1) {
                // if there is only one child we just have to connecti it with streight line to the parent right above
                path = new Path(this.firstChild().getMiddleTop()).lineTo(0, -1 * this.props.space.generation);
            }
            else {
                // connecting first child with the last one
                path = new Path(this.firstChild().getMiddleTop())
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
}