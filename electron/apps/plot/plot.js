const d3 = require('d3')

class Axis {
	constructor(plot, orient) {
		this.plot = (plot instanceof Plot) ? plot : null

		this.title = null
		this.ticks = 0
		this.range = null
		this.domain = null
		this.scaleType = Axis.LINEAR

		this.zoom$range = null
		this.zoom$domain = null

		this.scale = null
		this.axis = null

		this.reverse = false
		this.orientType = orient || Axis.BOTTOM

		this.offset = null
	}

	/** axis type - linear scale */
	static get LINEAR() {
		return 'linear'
	}

	/** axis type - log scale */
	static get LOG() {
		return 'log'
	}

	/** axis type - square root scale */
	static get SQRT() {
		return 'sqrt'
	}

	/** axis position - top */
	static get TOP() {
		return 'top'
	}

	/** axis position - bottom */
	static get BOTTOM() {
		return 'bottom'
	}

	/** axis position - left */
	static get LEFT() {
		return 'left'
	}

	/** axis position - right */
	static get RIGHT() {
		return 'right'
	}

	get curves() {
		if (!this.plot || !this.plot.curves) {
			return []
		}

		let curves = []
		for (let curve of this.plot.curves) {
			if (curve.xAxis == this || curve.yAxis == this) {
				curves.push(curve)
			}	
		}

		return curves
	}

	render() {
		if (!this.plot || !this.plot.svg) { return false }

		//let axis = null
		//let scale = null
		if (this.scaleType == Axis.LOG) {
			this.scale = d3.scaleLog()
		} else if (this.scaleType == Axis.SQRT) {
			this.scale = d3.scaleSqrt()
		} else if (this.scaleType == Axis.TIME) {
			this.scale = d3.scaleTime()
		} else {
			this.scale = d3.scaleLinear()
		}

		let width = this.plot.width
		let height = this.plot.height

		if (!this.range) {
			if (this.orientType == Axis.BOTTOM || this.orientType == Axis.TOP) {
				this.range = this.reverse ? [width, 0] : [0, width]
			} else {
				this.range = this.reverse ? [height, 0] : [0, height] 
			}
		}

		if (!this.domain) {
			let domain = null
			for (let curve of this.curves) {
				let i = (this.orientType == Axis.BOTTOM || this.orientType == Axis.TOP) ? 0 : 1
				let extent = d3.extent(curve.data, d=>d[i])
				if (domain) {
					domain = [Math.min(extent[0], domain[0]), 
							Math.max(extent[1], domain[1])]
				} else {
					domain = extent
				}
			}
			if (domain) {
				this.domain = domain
				this.ticks = 5
			} else {
				this.domain = [0,0]
			}
		}
		this.scale.range(this.range).domain(this.domain).nice()

		if (this.orientType == Axis.BOTTOM) {
			this.axis = d3.axisBottom(this.scale)
		} else if (this.orientType == Axis.TOP) {
			this.axis = d3.axisTop(this.scale)
		} else if (this.orientType == Axis.LEFT) {
			this.axis = d3.axisLeft(this.scale)
		} else if (this.orientType == Axis.RIGHT) {
			this.axis = d3.axisRight(this.scale)
		}
		this.axis.ticks(this.ticks)

		if (!this.offset) {
			if (this.orientType == Axis.BOTTOM) {
				this.offset = {x:0,y:height}
			} else if (this.orientType == Axis.RIGHT) {
				this.offset = {x:width,y:0}		
			} else {
				this.offset = {x:0,y:0}
			}
		}

		this.plot.pad.append("g")      
	    .attr("class", "axis")
	    .attr("transform", `translate(${this.offset.x}, ${this.offset.y})`)
	    .style("font-size",11)
	    .call(this.axis)
	}
}

class Curve {
	constructor(plot, data, name, xAxis, yAxis) {
		this.plot = (plot instanceof Plot) ? plot : null

		this.name = name
		this.xAxis = xAxis || this.plot.axes.bottom
		this.yAxis = yAxis || this.plot.axes.left
		this.showDots = true
		this.showLine = true

		this.dotsColor = 'blue'
		this.dotsSize = '2.5'
		this.dotsOpacity = '0.7'
		this.lineColor = 'black'
		this.lineWidth = '1'
		this.lineOpacity = '1'

		this.data = data || [] // data is an array of [x,y]

		this.data.forEach(function(d) {
			d[0] = +d[0];
			d[1] = +d[1];
		});
	}

	render() {
		if (this.showLine) {
			var line = d3.line()
			.x(d => this.xAxis.scale(d[0])) // convert domain into pixels in plot
			.y(d => this.yAxis.scale(d[1]))

			this.plot.pad.append("path")        // Add the valueline path.
			.attr("class", `line ${this.name}`)
			.style("stroke",`${this.lineColor}`)
			.style("stroke-width", `${this.lineWidth}`)
			.style("opacity", `${this.lineOpacity}`)
			.attr("d", line(this.data));
		}

		if (this.showDots) {
			this.plot.pad.append("g")
			.attr("class", `dots ${this.name}`)
			.style("fill", `${this.dotsColor}`)
			.style("opacity", `${this.dotsOpacity}`)
			.selectAll(".dot")
			.data(this.data)
			.enter().append("circle")
			.attr("class", `dot ${this.name}`)
			.attr("r", `${this.dotsSize}`)
			.attr("cx", (d) => { return this.xAxis.scale(d[0]); })
			.attr("cy", (d) => { return this.yAxis.scale(d[1]); })
		}
	}

	setLineStyle(style) {

	}
}

class Plot {
    constructor (container) {
		this.div = container

        this.svg = null
    	this.pad = null;

    	this.curves = []

        this.height = 420
        this.width = 460

        this.top = 40
        this.bottom = 60
        this.left = 70
        this.right = 70

    	// create all axes when the plot is created
    	this.axes = {top: new Axis(this, Axis.TOP), 
					bottom: new Axis(this, Axis.BOTTOM), 
					left: new Axis(this, Axis.LEFT), 
					right: new Axis(this, Axis.RIGHT)}
    }

    get size() {
        return {height: this.height, width: this.width}
    }

    size(height, width) {
        this.height = height > 200 ? height : 200
        this.width = width > 200 ? width : 200
    }

    get margin() {
        return {top: this.top, bottom: this.bottom, left: this.left, right: this.right}
    }

    margin(top, bottom, left, right) {
        this.top = top
        this.bottom = bottom
        this.left = left
        this.right = right
    }

    get outerSize() {
        return { height: (this.height + this.top + this.bottom),
                 width: (this.width + this.left + this.right) }
    }

	addCurve(data, accessor, name, xAxis, yAxis) {
		if (!data) { return false }

		let points = []
		if (accessor instanceof Function) {
			for (let d of data) {
				points.push(accessor(d))
			}
		} else {
			points = data
		}

		let curve = new Curve(this,points, name, xAxis, yAxis)
		this.curves.push(curve)
	}

	addCurves(matrix) {
		if (!matrix || matrix.length < 1) { return false }
		
		let dim = matrix[0].length
		if (dim < 1) { return false	}

		for (let i=1;i<dim;i++) {
			this.addCurve(matrix, d => [d[0],d[i]])
		}
	}

    /** target is where this plot should be rendered, could be a div id in html,
        if null, the return svg element can be manually attached to document later
    */
    render() {
		if (typeof this.div == 'string') {
			this.div = document.getElementById(this.div);
		}

		if (!this.div || !(this.div instanceof Element)) {
			this.div = document.createElement('div'); // always create new svg dom
		} 

    	let svg = this.svg = d3.select(this.div).append("svg")
	    
	    // *** start to render ***

	    svg.attr("width", this.outerSize.width)
	        .attr("height", this.outerSize.height)

		var defs = svg.append("defs"); 

		var clip = defs.append("clipPath")
		    .attr("id", "clip")
		    .append("rect")
		    .attr("id", "clip-rect")
		    .attr("x", 0)
		    .attr("y", 0)
		    .attr('width', this.width)
		    .attr('height', this.height);

		this.pad = svg.append("g")
		    .attr("transform", "translate(" 
		    	+ this.left + "," + this.top + ")")

		this.pad.append("g")
		    .attr("clip-path", "url(#clip)");

		// set the background, which will receive the mouse events
		// besides other objects in the plot
		this.pad.append("rect") 
			.attr("x", 0)
			.attr("y", 0)
		    .attr("width", this.width)
		    .attr("height", this.height)
		    .style("fill", "green")
		    .style("opacity", "0")

		// *** axes ***
		this.axes.bottom.render()
		this.axes.left.render()
		this.axes.top.render()
		this.axes.right.render()

		// *** curves ***
		for (let curve of this.curves) {
			curve.render()
		}
    }
}

exports.Plot = Plot
exports.Axis = Axis