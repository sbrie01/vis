import ElbowEdgeBase from './util/ElbowEdgeBase'

class ElbowEdge extends ElbowEdgeBase {
    constructor(options, body, labelModule) {
	super(options, body, labelModule);
	this._boundFunction = () => {this.positionElbowNodes();};
	this.body.emitter.on("_repositionElbowNodes", this._boundFunction);
    }

    setOptions(options) {
	// check if the physics has changed
	let physicsChange = false;
	if (this.options.physics !== options.physics) {
	    physicsChange = true;
	}

	// set the options and the to and from nodes
	this.options = options;
	this.id = this.options.id;
	this.from = this.body.nodes[this.options.from];
	this.to = this.body.nodes[this.options.to];

	// setup the support node and connect
	this.setupSupportNode();
	this.connect();

	if (physicsChange === true) {
	    this.via.setOptions({physics: this.options.physics});
	    this.positionElbowNodes();
	}
    }

    connect() {
	this.from = this.body.nodes[this.options.from];
	this.to = this.body.nodes[this.options.to];

	// more to come here
	if (this.from === undefined || this.to === undefined || this.options.physics === false) {
	    this.via.setOptions({physics: false});
	} else {
	    // fix weird behavior where a self refrencing node has physics enabled
	    if (this.from.id === this.to.id) {
		this.via.setOptions({physics: false});
	    } else {
		this.via.setOptions({physics: true});
	    }
	}
    }

    /**
     * remove the support nodes
     * @returns {boolean}
     */
    cleanup() {
	this.body.emitter.off("_repositionElbowNodes", this._boundFunction);
	if (this.via !== undefined) {
	    delete this.body.nodes[this.via.id];
	    this.via = undefined;
	    return true;
	}
	
	return false
    }

    /**
     * Create invisible node to be used as anchor point for 
     * lines between nodes
     * 
     * @private
     */
    setupSupportNode() {
	if (this.via === undefined) {
	    var nodeId = "edgeId:" + this.id;
	    var node = this.body.functions.createNode({
		id: nodeId,
		shape: 'dot',
		size: 3,
		physics: true,
		hidden: false
	    });

	    this.body.nodes[nodeId] = node;
	    this.via = node;
	    this.via.parentEdgeId = this.id;

	    // position the hidden node 
	    this.positionElbowNodes();
	}
    }
    /**
     * Find the coordinates of the hidden node between the existing nodes
     * 
     * @returns {Object}
     */
    _getHiddenCoords(fromNode, toNode) {
	// get equation for line between nodes
	var slope = ( (fromNode.y - toNode.y) / (fromNode.x - toNode.x) );
	var b = (fromNode.y - (slope * fromNode.x));
	
	// get length of straight line between nodes
	var length = 5;
	// var length = Math.sqrt(
	//     Math.pow((fromNode.x - toNode.x), 2) + Math.pow((fromNode.y - toNode.y), 2)
	// ); 			

	// get middle point on that line
	var coords = {
	    x: ((fromNode.x + toNode.x) / 2),
	    y: ((fromNode.y + toNode.y) / 2)
	}

	return coords;
	// return ({x: (coords.x * (length / 2)), y: (coords.y * (length / 2))}); 
    }
    
    positionElbowNodes() {
	if (this.via !== undefined && this.from !== undefined && this.to !== undefined){
	    var coords = this._getHiddenCoords(this.from, this.to);
	    
	    this.via.x = coords.x;
	    this.via.y = coords.y;
	} else if (this.via !== undefined) {
	    this.via.x = 0;
	    this.via.y = 0;
	}
    }
    
    /**
     * Draw a line between two nodes
     * @param {CanvasRenderingContext2D} ctx
     * @private
     */
    _line(ctx, values, viaNode) {
	// this._elbowLine(ctx, values, viaNode);
	console.log(this.fromPoint.x + "," + this.fromPoint.y + " => " + viaNode.x + "," + viaNode.y + " => " + this.toPoint.x + "," + this.toPoint.y)
	
	// draw first half of line
	ctx.beginPath();
	ctx.moveTo(this.fromPoint.x, this.fromPoint.y);
	ctx.lineTo(viaNode.x, viaNode.y);

	// draw second half of line
	ctx.moveTo(viaNode.x, viaNode.y);
	ctx.lineTo(this.toPoint.x, this.toPoint.y);

	// draw shadow if enabled
	this.enableShadow(ctx, values);
	ctx.stroke();
	this.disableShadow(ctx,values);
    }

    getViaNode() {
	return this.via;
    }

    _findBorderPosition(nearNode, ctx) {
	let node1 = this.to;
	let node2 = this.from;
	if (nearNode.id === this.from.id) {
	    node1 = this.from;
	    node2 = this.to;
	}

	let angle = Math.atan2((node1.y - node2.y), (node1.x - node2.x));
	let dx = (node1.x - node2.x);
	let dy = (node1.y - node2.y);
	let edgeSegmentLength = Math.sqrt(dx * dx + dy * dy);
	let toBorderDist = nearNode.distanceToBorder(ctx, angle);
	let toBorderPoint = (edgeSegmentLength - toBorderDist) / edgeSegmentLength;

	let borderPos = {};
	borderPos.x = (1 - toBorderPoint) * node2.x + toBorderPoint * node1.x;
	borderPos.y = (1 - toBorderPoint) * node2.y + toBorderPoint * node1.y;

	return borderPos;
    }

    
    _getDistanceToEdge(x1, y1, x2, y2, x3, y3) { // x3,y3 is the point
	return this._getDistanceToLine(x1, y1, x2, y2, x3, y3);
    }
}

export default ElbowEdge;