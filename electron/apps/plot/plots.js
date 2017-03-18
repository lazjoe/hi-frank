/*** Code for Frank in frontend. ***/

/*** Dependency ***
	D3 version 4
*******************/

define(function (require, exports, module) {
    "use strict";
    //var d3 = require('./lib/d3');
    var d3 = require('../../../../lib/d3/d3');

    function create(type, data) {
    	if (type == 'G_plot') {
    		return new G_plot(data);
    	}
    }

    var SimpleEvents = function (caller) {
   		this.handlers = {}
   		this.caller = caller || null;
    }

    SimpleEvents.NAME_CHANGE = 'name_change';
    SimpleEvents.AXIS_CHANGE = 'axis_change';
    SimpleEvents.DATA_CHANGE = 'data_change';
    SimpleEvents.TYPE_CHANGE = 'type_change';


    SimpleEvents.prototype.addEvent = function(event_type) {
     	var handlers = this.handlers[event_type];
     	
     	if (!handlers || !(handlers instanceof Array)) {
     		this.handlers[event_type] = [];
     	}
   }

    // the owner instance will be passed to the handler as 'this'
    // no other arguments
    SimpleEvents.prototype.on = function(event_type, handler) {
    	var handlers = this.handlers[event_type];
    	if (handlers instanceof Array) {
    		handlers.push(handler);
    	}
    }

    SimpleEvents.prototype.fire = function(event_type) {
    	var handlers = this.handlers[event_type];
    	if (handlers instanceof Array) {
    		for (var i in handlers) {
    			try {
    				handlers[i].apply(this.caller, []);
    			} catch (e) {
    				console.error(e);
    			}
    		}
    	}
    }

    var Axis = function() {
    	var _title = null;
    	this.title = function(_) {
    		return _ ? (_title = _, this) : _title; 
    	}
	
		var _ticks = NaN;
    	this.ticks = function(_) {
    		return _ ? (_ticks = _, this) : _ticks; 
    	}

    	var _scale = d3.scaleLinear();
    	this.range = function(_) {
    		return _ ? (_scale.range(_), this) : _scale.range(); 
    	}
    	this.domain = function(_) {
    		return _ ? (_scale.domain(_), this) : _scale.domain(); 
    	}

    	var _type = 'linear'; // ['linear','log']
    	this.type = function(_) {
    		return _ ? (_type = _, this) : _type; 
    	}

    	var _reserse = false; 
    	this.reserse = function(_) {
    		return _ ? (_reserse = _, this) : _reserse; 
    	}

    	var _orient = null; // ['top', 'bottom', 'left', 'right']
    	this.orient = function(_) {
    		return _ ? (_orient = _, this) : _orient; 
    	}

    	var _curves = [];
    	this.curves = function(_) {
    		return _ ? (_curves = _, this) : _curves; 
    	}

    	var range$zoom = null;
    	var domain$zoom = null;
    	var scale

    	var zoom_by_range = function(range) {
    		range$zoom = range;
    	}

    	var zoom_by_domain = function(domain) {
    		domain$zoom = domain;

    	}

    	var no_zoom = function() {
    		range$zoom = null;
    		domain$zoom = null;
    	}

    }

    // *** accessor should return an array [x,y] ***
    var Curve = function(data, accessor) {
    	this.plot = null;  	
   		this.events = new SimpleEvents(this);
   		this.events.addEvent(SimpleEvents.NAME_CHANGE);
   		this.events.addEvent(SimpleEvents.AXIS_CHANGE);
   		this.events.addEvent(SimpleEvents.DATA_CHANGE);
   		this.events.addEvent(SimpleEvents.TYPE_CHANGE);


    	var _data = [];
		
		// the only entry where data can be modified
   		function set_data(data, accessor) {
   			_data = [];

		    if (!(data instanceof Array)) {
		    	throw new Error("arguments are not array");
	    	}

	    	if (accessor) {
		     	for (var d in data) {
		     		_data.push(accessor(d))
				}
	    	} else { // no accessor, using default
		     	for (var d in data) {
		     		if ((d instanceof Array) && (d.length > 1)) {
		     			_data.push([+d[0],+d[1]]);
		     		} else {
		     			// try to convert the first two properties of the d into x, y
		     			var props = Object.getOwnPropertyNames(d);
		     			if (props.length > 1) {
		     				_data.push([ +d[props[0]], +d[props[1]] ]);
		     			}
		     		}
		    	}   		
	    	}    

	    	this.events.fire(SimpleEvents.DATA_CHANGE);
   		}

   		set_data(data, accessor);

   		this.data = function(_, accessor) {
  	 		return _ ? (set_data(_, accessor), this) : _data;   		
    	}

    	this.x_extent = function() {
    		return d3.extent(_data, function(d) {return d[0]})
    	}

    	this.y_extent = function() {
    		return d3.extent(_data, function(d) {return d[1]})
    	}


    	var _x_axis = 'bottom'; // ['bottom', 'top']
    	this.x_axis = function(_) {
  	 		return _ ? (_x_axis = _, this) : _x_axis;   		
    	}

    	var _y_axis = 'left'; // ['left','right']
    	this.y_axis = function(_) {
  	 		return _ ? (_y_axis = _, this) : _y_axis;   		
    	}

    	var _type = 'dots'; // ['dots, line, dots+line, area?']
     	this.type = function(_) {
  	 		return _ ? (_type = _, this) : _type;   		
    	}

    	var _name = 'curve'; 
      	this.name = function(_) {
  	 		var that = this;
  	 		return _ ? (set(_), this) : _name;  

  	 		function set(_) {
  	 			_name = _;
  	 			that.events.fire(SimpleEvents.NAME_CHANGE)
  	 		} 		
    	}
    }


    var Legend = function() {

    }

    var Title = function() {

    }

    function plot() {

    	return new Plot();
    }

    var Plot = function() {

    	var _size = {height: 420, width: 460};
    	this.size = function(_) {
  	 		return _ ? (_size = _, this) : _size;   		
    	}
    	this.height = function(_) {
  	 		return _ ? (_size.height = _, this) : _size.height; 
  	 	}
  	 	this.width = function(_) {
  	 		return _ ? (_size.width = _, this) : _size.width; 
  	 	}

    	var _min_size = {height: 200, width: 200};

    	var _margin = {top: 40, bottom: 60, left: 70, right: 70};
     	this.margin = function(_) {
  	 		return _ ? (_margin = _, this) : _margin;   		
    	}
    	this.top = function(_) {
  	 		return _ ? (_margin.top = _, this) : _margin.top;   		
    	}
    	this.bottom = function(_) {
  	 		return _ ? (_margin.bottom = _, this) : _margin.bottom;   		
    	}
    	this.left = function(_) {
  	 		return _ ? (_margin.left = _, this) : _margin.left;   		
    	}
    	this.right = function(_) {
  	 		return _ ? (_margin.right = _, this) : _margin.right;   		
    	}

    	this.total_height = function() {
    		return _size.height + _margin.top + _margin.bottom;
    	}

    	this.total_width = function() {
    		return _size.width + _margin.left + _margin.right;
    	}

    	this.svg = null;
    	this.div = null;
    	this.pad = null;
    	var _curves = [];
    	this.curves = function() {return _curves; }

    	// create all axes when the plot is created

    	var _axes = {
    		bottom: null,
    		top: null,
    		left: null,
    		right: null
    	};
    	this.axes = function() {return _axes; }
    	// this.set_axis = function(type, ) {

    	// }
 
    }

    // target is where this plot should be rendered, could be a div id in html,
    // if null, the return svg element can be manually attached to document later
    Plot.prototype.render = function(div) {
    	//var svg = this.svg || document.createElement('svg');
    	//var plot_div = document.createElement('div'); // always create new svg dom
		//var plot_id = "plot" + d3.randomUniform(100000,999999)().toFixed(); // | 0 will return an integer number

		// *** initial svg container ***
		var plot_div = null;
		
		if (typeof div == 'string') {
			plot_div = document.getElementById(div);
		} else if (div instanceof Element) {
			plot_div = div;
		}

		if (!plot_div) {
			plot_div = document.createElement('div'); // always create new svg dom
		} 

    	var svg = d3.select(plot_div).append("svg")

	    this.svg = svg;
	    this.div = plot_div;
	    
	    // *** start to render ***
	    var margin = this.margin();
	    var height = this.height();
	    var width = this.width();

	    svg.attr("width", this.total_width())
	    	.attr("height", this.total_height())

		var defs = svg.append("defs"); 

		var clip = defs.append("clipPath")
		    .attr("id", "clip")
		    .append("rect")
		    .attr("id", "clip-rect")
		    .attr("x", 0)
		    .attr("y", 0)
		    .attr('width', width)
		    .attr('height', height);

		var plot = svg.append("g")
		    .attr("transform", "translate(" 
		    	+ margin.left + "," + margin.top + ")")

		this.pad = plot.append("g")
		    .attr("clip-path", "url(#clip)");

		// set the background, which will receive the mouse events
		// besides other objects in the plot
		this.pad.append("rect") 
			.attr("x", 0)
			.attr("y", 0)
		    .attr("width", width)
		    .attr("height", height)
		    .style("fill", "green")
		    .style("opacity", "0.1")

		// *** curves and axes ***



	    return plot_div;
    }

    Plot.prototype.data = function(d) {
    	//if (d) {};
    	return this;
    }

    Plot.prototype.curve = function(data) {
    	// set the default type to 'line' if no valid type specified
  //   	type = type || 'line';

  //   	types = ['line', 'dots'];
  //   	if (type.indexOf(types) <0) {
  //   		type = line; 
  //   	}
	    var height = this.height();
	    var width = this.width();

  		var curve = new Curve(data);
  		curve.plot = this;

  		// get a proper name for this curve
  		var names = [];
  		var curves = this.curves();
  		for (var c in curves) {
  			names.push(c.name());
  		}

  		var name = "Curve 0";
  		for (var i=1; i<curves.length+1; i++) {
  			name = "Curve " + i;
  			if (curves.indexOf(name) < 0) {
  				break;
  			}
  		}
  		curve.name(name);

  		// create/find axis for this curve
  		var axes = this.axes;
  		if (curve.x_axis = 'top') {
  			if (axes.top) {
  				var old_domain = axes.top.scale.domain();
  				var domain = curve.x_extent();
  				axes.top.scale.domain([
  					d3.min([domain[0],old_domain[0]]), 
  					d3.max([domain[1],old_domain[1]])
  				]).nice();
  			} else {
  				// TODO: support log scale here
  				var x = d3.scaleLinear().range([0, width]);
  				x.domain(d3.extent(data, function(d) { return d[0]; })).nice();

  				axes.top = d3.axisTop(x).ticks(5);
  			}
  		} else { // bottom by default
  			if (axes.bottom) {
  				var old_domain = axes.bottom.scale.domain();
  				var domain = curve.x_extent();
  				axes.bottom.scale.domain([
  					d3.min([domain[0],old_domain[0]]), 
  					d3.max([domain[1],old_domain[1]])
  				]).nice();
  			} else {
  				// TODO: support log scale here
  				var x = d3.scaleLinear().range([0, width]);
  				x.domain(d3.extent(data, function(d) { return d[0]; })).nice();

  				axes.bottom = d3.axisBottom(x).ticks(5);
  			}
  		}

  		if (curve.y_axis = 'right') {
  			if (axes.right) {
  				var old_domain = axes.right.scale.domain();
  				var domain = curve.y_extent();
  				axes.right.scale.domain([
  					d3.min([domain[0],old_domain[0]]), 
  					d3.max([domain[1],old_domain[1]])
  				]).nice();
  			} else {
  				// TODO: support log scale here
  				var y = d3.scaleLinear().range([height, 0]);
  				y.domain(d3.extent(data, function(d) { return d[1]; })).nice();

  				axes.right = d3.axisRight(y).ticks(5);
  			}
  		} else { // left by default
  			if (axes.left) {
  				var old_domain = axes.left.scale.domain();
  				var domain = curve.y_extent();
  				axes.left.scale.domain([
  					d3.min([domain[0],old_domain[0]]), 
  					d3.max([domain[1],old_domain[1]])
  				]).nice();
  			} else {
  				// TODO: support log scale here
  				var y = d3.scaleLinear().range([height, 0]);
  				y.domain(d3.extent(data, function(d) { return d[1]; })).nice();

  				axes.left = d3.axisLeft(x).ticks(5);
  			}
  		}

  		return curve;
    }

    var G_plot = function() {
    	return new G_Plot();
    }

    var G_Plot = function() {
    	Plot.apply(this, arguments);

    	console.log(this.size());
    }

    G_Plot.prototype.render = function(div) {
    	Plot.prototype.render.apply(this, arguments);

    	//console.log("start to render G plot")
	}



    return {
        plot: plot,
        G_plot: G_plot
    };
});
