import EdgeBase from './EdgeBase'

class ElbowEdgeBase extends EdgeBase {
    constructor(options, body, labelModule) {
	super(options, body, labelModule);
    }

    /**
     * This function uses binary search to look for the point where the bezier curve crosses the border of the node.
     *
     * @param nearNode
     * @param ctx
     * @param viaNode
     * @param nearNode
     * @param ctx
     * @param viaNode
     * @param nearNode
     * @param ctx
     * @param viaNode
     */
    _findBorderPositionElbow(nearNode, ctx, viaNode = this.via) {
	var maxIterations = 10;
	var iteration = 0;
	var low = 0;
	var high = 1;
	var pos, angle, distanceToBorder, distanceToPoint, difference;
	var threshold = 0.2;
	var node = this.to;
	var from = false;
	if (nearNode.id === this.from.id) {
	    node = this.from;
	    from = true;
	}

	while (low <= high && iteration < maxIterations) {
	    var middle = (low + high) * 0.5;

	    pos = this.getPoint(middle, viaNode);
	    angle = Math.atan2((node.y - pos.y), (node.x - pos.x));
	    distanceToBorder = node.distanceToBorder(ctx, angle);
	    distanceToPoint = Math.sqrt(Math.pow(pos.x - node.x, 2) + Math.pow(pos.y - node.y, 2));
	    difference = distanceToBorder - distanceToPoint;
	    if (Math.abs(difference) < threshold) {
		break; // found
	    }
	    else if (difference < 0) { // distance to nodes is larger than distance to border --> t needs to be bigger if we're looking at the to node.
		if (from === false) {
		    low = middle;
		}
		else {
		    high = middle;
		}
	    }
	    else {
		if (from === false) {
		    high = middle;
		}
		else {
		    low = middle;
		}
	    }

	    iteration++;
	}
	pos.t = middle;

	return pos;
    }
}

export default ElbowEdgeBase;
