/**
 * SVGTree - path
 *
 * @copyright Copyright 2019, Max Chodorowski
 * @license   MIT (https://opensource.org/licenses/MIT)
 * @link      https://maxwroc.github.io/SVGTree/
 */
module SVGTree {
    /**
     * Class for generating paths
     */
    export class Path {
        public path = "";
        private currentPos: ICoords = {
            x: 0,
            y: 0
        }

        private markers: { [id: number]: ICoords } = {};

        constructor(coords: ICoords);
        constructor(x: number, y: number);
        constructor(x: number | ICoords, y?: number) {
            if (this.isCoordsObject(x)) {
                this.moveTo(x as ICoords);
            }
            else {
                this.moveTo(x as number, y, false);
            }
        }

        /**
         * Draws the line from current point
         * @param coords - coordinates of target point
         */
        lineTo(coords: ICoords): Path;
        /**
         * Draws the line from current point
         * @param x - target x
         * @param y - target y
         * @param isRelative - whether x & y are relative (not absolute values)
         */
        lineTo(x: number, y: number, isRelative?: boolean): Path;
        lineTo(x: number | ICoords, y?: number, isRelative = true) {
            this.setCurrentPos(x, y, isRelative);
            this.path += `L ${this.currentPos.x} ${this.currentPos.y}`;
            return this;
        }

        /**
         * Draws arc from current point
         * @param coords - coordinates of target point (can be relative)
         */
        arcTo(coords: ICoords): Path;
        /**
         * Draws arc from current point
         * @param x - target x
         * @param y - target y
         * @param rx - radius x
         * @param ry - radius y
         * @param isRelative - whether x & y are relative (not absolute values)
         */
        arcTo(x: number, y: number, rx?: number, ry?: number, isRelative?: boolean): Path;
        arcTo(x: number | ICoords, y?: number, rx?: number, ry?: number, isRelative = true) {
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

        /**
         * Moves current point
         * @param coords - coordinates of target point
         */
        moveTo(coords: ICoords): Path;
        /**
         * Moves current point
         * @param x - target x
         * @param y - target y
         * @param isRelative - whether x & y are relative (not absolute values)
         */
        moveTo(x: number, y: number, isRelative?: boolean): Path;
        moveTo(x: number | ICoords, y?: number, isRelative = true) {
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
        setMarker(id: number) {
            this.markers[id] = Object.assign({} as ICoords, this.currentPos);
            return this;
        }

        /**
         * Moves current point to given (saved earlier) marker
         * @param id - id of the marker
         */
        moveToMarker(id: number) {
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
        private isCoordsObject(obj: any): boolean {
            return typeof obj === "object" && obj !== null && obj.x !== undefined && obj.y !== undefined;
        }

        /**
         * Sets current position based on given data (resolves relative values)
         * @param x - target x or ICoords object
         * @param y - target y
         * @param isRelative - whether x & y are relative (not absolute values)
         */
        private setCurrentPos(x: number | ICoords, y: number, isRelative: boolean) {
            if (this.isCoordsObject(x)) {
                let coords = x as ICoords;
                x = coords.x;
                y = coords.y;
                isRelative = coords.isRelative
            }

            if (x == null) {
                x = isRelative ? 0 : this.currentPos.x;
            }

            if (y == null) {
                y = isRelative ? 0 : this.currentPos.y;
            }

            if (isRelative) {
                this.currentPos.x += x as number;
                this.currentPos.y += y;
            }
            else {
                this.currentPos.x = x as number;
                this.currentPos.y = y;
            }
        }
    }
}