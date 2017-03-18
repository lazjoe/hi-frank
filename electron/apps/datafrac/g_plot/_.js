/*** d3 code to generate G plot. ***/

G_plot = {}

G_plot.svg = {}
G_plot.valueLine1 = null;
G_plot.valueLine2 = null;
G_plot.valueLine3 = null;

G_plot.pressure_vs_G = [];
G_plot.G_vs_GdpdG = [];

G_plot.PRESSURE = 1;
G_plot.DPDG = 2;
G_plot.GDPDG = 3;

G_plot.render = function (data, sdata, div_ID, d3) {
	// data: json data in dict records. Refer to d3 data format. Shown in dots
	// sdata: smoothed data for line curve. same format with data. Shown in lines
	// div_ID: the id of div where the graph will be injected
	// d3 object to render the plot
	// Parse data in the beginning to adjust all settings according to data.
		
	/* Prepare data */
	data.forEach(function(d) {
	    d.G = +d.G;
	    d.pressure = +d.pressure;
	    d.dpdG = +d.dpdG;
	    d.GdpdG = +d.GdpdG
	});


	//var pressure_smoother
	G_plot.pressure_vs_G = [];
	G_plot.G_vs_GdpdG = [];
	sdata.forEach(function(d) {
	    d.G = +d.G;
	    d.pressure = +d.pressure;
	    d.dpdG = +d.dpdG;
	    d.GdpdG = +d.GdpdG

	    G_plot.pressure_vs_G.push([d.pressure, d.G])
	    G_plot.G_vs_GdpdG.push([d.G,d.GdpdG])
	});

	G_plot.pressure_vs_G.sort(function(a,b) {return a[0]-b[0]}) 
	G_plot.G_vs_GdpdG.sort(function(a,b) {return a[0]-b[0]}) 
  	// smoothed_data = []
	// w = 15
	// for (i = w; i < data.length - w; i++) {
	// 	var sp=0, sdp=0, sgdp = 0;

	// 	for (j = -w; j < w+1; j++) {
	// 		sp += data[i+j].pressure
	// 		sdp += data[i+j].dpdG
	// 		sgdp += data[i+j].GdpdG
	// 	}		

	// 	var g = data[i].G
	// 	var pressure = sp/(2*w+1);
	// 	var dpdG = sdp/(2*w+1);
	// 	var GdpdG = sgdp/(2*w+1);
	// 	smoothed_data.push({G:g, pressure: pressure, dpdG:dpdG, GdpdG: GdpdG});
	// }

	/* Setup plot layout */

	// Width and height for the entire graph
	var total_width = 600,
		total_height = 520

	// margin, width and height for the plotting area (the border lines are axes)
	var margin = {top: 40, right: 70, bottom: 60, left: 70},
	    width = total_width - margin.left - margin.right,
	    height = total_height - margin.top - margin.bottom;

	// Define axies
	var x = d3.scaleLinear().range([0, width]);
	var y0 = d3.scaleLinear().range([height, 0]);
	var y1 = d3.scaleLinear().range([height, 0]);

	x.domain(d3.extent(data, function(d) { return d.G; })).nice();
	y0.domain(d3.extent(data, function(d) { return d.pressure; })).nice(); 
	max_dpdG = d3.max(data, function(d) { return d.dpdG; })
	max_GdpdG = d3.max(data, function(d) { return d.GdpdG; })
	y1.domain([0, d3.min([d3.max([max_dpdG, max_GdpdG]), 4000])]).nice();

	var xAxis = d3.axisBottom(x).ticks(5)
	var xAxisTop = d3.axisTop(x).ticks(0)  // only draw a line
	var yAxisLeft = d3.axisLeft(y0).ticks(5);
	var yAxisRight = d3.axisRight(y1).ticks(5); 

	// Define lines (Even dots without line should be plotted as lines)
	var valueline1 = d3.line()
	    .x(function(d) { return x(d.G); })
	    .y(function(d) { return y0(d.pressure); });
	G_plot.valueline1 = valueline1;
	console.log('G_plot.valueline1 ', G_plot.valueline1 );


	var valueline2 = d3.line()
		//.curve(d3.curveBasis)
	    .x(function(d) { return x(d.G); })
	    .y(function(d) { return y1(d.dpdG); });
	G_plot.valueline2 = valueline2;

	var valueline3 = d3.line()
	 	//.curve(d3.curveBasis)
	    .x(function(d) { return x(d.G); })
	    .y(function(d) { return y1(d.GdpdG); });
	G_plot.valueline3 = valueline3;

	/* Render graph */
	svg = d3.select("#"+div_ID).append("svg")
	    .attr("width", total_width)
	    .attr("height", total_height)
	G_plot.svg = svg;

	// Add the clip area (lines, dots outside the clip area will be invisible)
	var defs = svg.append("defs"); 

	var clip = defs.append("svg:clipPath")
	    .attr("id", "clip")
	    .append("svg:rect")
	    .attr("id", "clip-rect")
	    .attr("x", 0)
	    .attr("y", 0)
	    .attr('width', width)
	    .attr('height', height);

	plot = svg.append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

	plot_area = plot.append("g")
	    .attr("clip-path", "url(#clip)");

	// set the background, which will receive the mouse events
	// besides other objects in the plot
	plot_area.append("rect") 
		.attr("x", 0)
		.attr("y", 0)
	    .attr("width", width)
	    .attr("height", height)
	    .style("fill", "white")
	    .style("opacity", "0.1")

	// Add lines and/or dots
	plot_area.append("path")        // Add the valueline path.
		.attr("class", "line pressure")
	    .style("stroke","darkred")
	    .style("stroke-width", "1")
	    .attr("d", valueline1(sdata));

	plot_area.append("path")        // Add the valueline2 path.
		.attr("class", "line dpdG")
		.style("stroke", "steelblue")
	    .style("stroke-width", "1")
	    .attr("d", valueline2(sdata));

	plot_area.append("path")        // Add the valueline3 path.
		.attr("class", "line GdpdG")
	    .style("stroke", "green")
	    .style("stroke-width", "1")
	    .attr("d", valueline3(sdata));

	plot_area.append("g")
		.attr("class", "dots pressure")
		.style("fill", "red")
		.style("opacity", 0.15)
		.selectAll(".dot")
      	.data(data)
    	.enter().append("circle")
      	.attr("class", "dot pressure")
      	.attr("r", 2.5)
      	.attr("cx", function(d) { return x(d.G); })
      	.attr("cy", function(d) { return y0(d.pressure); })

	plot_area.append("g")
		.attr("class", "dots dpdG")
		.style("fill", "blue")
		.style("opacity", 0.15)
		.selectAll(".dot")
      	.data(data)
    	.enter().append("circle")
      	.attr("class", "dot dpdG")
      	.attr("r", 2.5)
      	.attr("cx", function(d) { return x(d.G); })
      	.attr("cy", function(d) { return y1(d.dpdG); })

	plot_area.append("g")
		.attr("class", "dots GdpdG")
		.style("fill", "green")
		.style("opacity", 0.15)
		.selectAll(".dot")
      	.data(data)
    	.enter().append("circle")
      	.attr("class", "dot GdpdG")
      	.attr("r", 2.5)
      	.attr("cx", function(d) { return x(d.G); })
      	.attr("cy", function(d) { return y1(d.GdpdG); })

	// Add axis and axis labels
	center_xAxis = (xAxis.scale().range()[0] + xAxis.scale().range()[1])/2;   
	center_yAxis = (yAxisLeft.scale().range()[0] + yAxisLeft.scale().range()[1])/2;   
	//    center_yAxisRight = (yAxisRight.scale().range()[0] + yAxisRight.scale().range()[1])/2;   

	g_xAxis = plot.append("g")            // Add the X Axis
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")
	    .style("font-size",11)
	    .call(xAxis)

	g_xAxis.append("text")
		.text("G, Dimensionless Time")
	    .attr("text-anchor","middle")
	    .attr("dy","40")
	    .attr("dx",center_xAxis)
	    .attr("font-size",12)
	    .attr("fill","black");

	    
	plot.append("g")            // Add the X Axis on the top
	    .attr("class", "x axis")
	    .attr("transform", "translate(0, 0)")
	    .style("font-size",11)
	    .call(xAxisTop)

	    
	g_yAxisLeft = plot.append("g")
	    .attr("class", "y axis")
	    //.style("fill", "red")
	    .style("font-size",11)
	    .call(yAxisLeft)

	g_yAxisLeft.append("text")
	    .text("Pressure, psi")
	    .attr("transform","rotate(-90)")
	    .attr("text-anchor","middle")
	    .attr("dy","-50")
	    .attr("dx",-center_yAxis)
	    .attr("font-size",12)
	    .attr("fill","black");
	       
	g_yAxisRight = plot.append("g")				
	    .attr("class", "y axis")	
	    .attr("transform", "translate(" + width +" ,0)")	
	    //.style("fill", "steelblue")		
	    .style("font-size",11)
	    .call(yAxisRight)

	g_yAxisRight.append("text")
	    .text("dpdG, GdpdG, psi")
	    .attr("transform","rotate(90)")
	    .attr("text-anchor","middle")
	    .attr("dy","-50")
	    .attr("dx",center_yAxis)
	    .attr("font-size",12)
	    .attr("fill","black");

	// ISIP Bar
	init_ISIP = data[0].pressure;
	init_ISIP_y = y0(init_ISIP);
	ISIP = init_ISIP;
	ISIP_y = init_ISIP_y;

	var ISIP_hBar_config = [{"y":0}];
                       //,{"key":"BH_PRESS","color":"darkred","x":0},
                       //{"key":"SLUR_RATE","color":"steelblue","x":0}];

    var ISIP_hBar = plot.selectAll(".hBar.ISIP")
        .data(ISIP_hBar_config) 
        .enter().append("g")
        .attr("class", "hBar ISIP");

    ISIP_hBar.append("rect")
	    .attr("y", function(d) {return d.y})
	    .attr("width", width)
	    .attr("height", 2)
	    .style("fill", "green")
	    .attr("transform", "translate(" + 0 + ", " + init_ISIP_y + ")")

	ISIP_hBar.append("rect")
	    .attr("class","dragbar")
	    .attr("y", function(d) {return d.y})
	    .attr("width", width)
	    .attr("height", 12)
	    .style("fill", "green")
	    .style("opacity", "0.0")
	    .attr("transform", "translate(" + 0 + ", " + (init_ISIP_y - 5) + ")")

	// Drag the bar
	function ISIP_bar_dragmove(d) {	
        var old_y = d.y;
        console.log('d.y', d.y);

        d.y = Math.min(Math.max(-init_ISIP_y, old_y + d3.event.dy), height-init_ISIP_y);
		ISIP_y = d.y + init_ISIP_y;
        
        if (Pc_y > ISIP_y + 3) {
			d3.select(this)
			  .attr("transform", "translate(0, " + d.y + ")");	

			ISIP = y0.invert(ISIP_y)  
			d3.select(".output.ISIP text")
			.text("ISIP: {0} {1}".format(Number(ISIP).toFixed(0),"psi"))

		}
	}
		
    ISIP_hBar.call(d3.drag().on("drag", ISIP_bar_dragmove));

	// d3.selectAll(".hBar.ISIP").on("mouseover.bar",function(d,i){  
 //    	d3.selectAll(".hBar.ISIP rect")
 //    	//.style("fill", "lightgreen") 
 //    	.style("cursor", "row-resize")

 //    	d3.selectAll(".hBar.ISIP .dragbar") 
 //      	.transition()  
 //      	.duration(500)  
 //      	.style("opacity","0.05")
	// })  
	// .on("mouseout.bar",function(d,i){  
 //    	d3.selectAll(".hBar.ISIP rect") 
 //      	.transition()  
 //      	.duration(500)  
 //      	.style("fill","green")
 //      	.style("cursor", "default")

	// 	d3.selectAll(".hBar.ISIP .dragbar") 
 //      	.transition()  
 //      	.duration(500)  
 //      	.style("opacity","0")
 //    })


    // Closure Bar
	init_Pc = data[0].pressure*0.95;
	init_Pc_y = y0(init_Pc);
	Pc = init_Pc;
	Pc_y = init_Pc_y;

	var Pc_hBar_config = [{"y":0}];
                       //,{"key":"BH_PRESS","color":"darkred","x":0},
                       //{"key":"SLUR_RATE","color":"steelblue","x":0}];

    var Pc_hBar = plot.selectAll(".hBar.Pc")
        .data(Pc_hBar_config) 
        .enter().append("g")
        .attr("class", "hBar Pc");

    Pc_hBar.append("rect")
    	.attr("class","shownbar")
	    //.attr("y", function(d) {return d.y})
	    .attr("width", width)
	    .attr("height", 2)
	    .style("fill", "green")
	    .attr("transform", "translate(" + 0 + ", " + init_Pc_y + ")")

	Pc_hBar.append("rect")
	    .attr("class","dragbar")
	    //.attr("y", function(d) {return d.y})
	    .attr("width", width)
	    .attr("height", 12)
	    .style("fill", "green")
	    .style("opacity", "0.0")
	    .attr("transform", "translate(" + 0 + ", " + (init_Pc_y - 5) + ")")


	// Drag the bar
        
    //dy = init_Pc_y;
	function Pc_bar_dragmove(d) {	
        var old_y = d.y;
        //console.log('d.y', d.y);

        d.y = Math.min(Math.max(-init_Pc_y, old_y + d3.event.dy), height-init_Pc_y);
        Pc_y = d.y + init_Pc_y; 

        if (Pc_y > ISIP_y + 3) {
			d3.select(this)
			  .attr("transform", "translate(0, " + d.y + ")");	

			Pc = y0.invert(Pc_y);
			//console.log('Pc_y', Pc_y);
			//console.log('Pc', Pc);
		    Pc_G = closestRecord(G_plot.pressure_vs_G, Pc, 0)[1];
		    //console.log('Pc_G', Pc_G);
		    Pc_x = x(Pc_G);
		    //console.log('Pc_x', Pc_x);

			G_plot.svg.selectAll(".vLine")
			  .attr("transform", "translate(" + (Pc_x-init_Pc_x) + ", 0)");	

			cross_x = Pc_x;
			cross_G = Pc_G;
			cross_y = y1(closestRecord(G_plot.G_vs_GdpdG, cross_G, 0)[1]);
			end_x = cross_x + 20*Math.cos(Math.atan((height-cross_y)/cross_x));
			end_y = height - (height-cross_y)/cross_x*end_x

			G_plot.svg.selectAll(".crossLine")
			.attr("d", "M" + 0 + "," + height + "L"+end_x+","+end_y);

			d3.select(".output.Pc text")
			.text("Pc: {0} {1}".format(Number(Pc).toFixed(0),"psi"))

			d3.select(".output.Pnet text")
			.text("Pnet: {0} {1}".format(Number(ISIP-Pc).toFixed(0),"psi"))			

		}
	}


    Pc_hBar.call(d3.drag().on("drag", Pc_bar_dragmove));

    // set for both horizontal bars
	d3.selectAll(".hBar").on("mouseover.bar",function(d,i){  

		bar = d3.select(this);
    	bar.selectAll("rect")
    	//.style("fill", "lightgreen") 
    	.style("cursor", "row-resize")

    	bar.selectAll(".dragbar") 
      	.transition()  
      	.duration(500)  
      	.style("opacity","0.1")
	})  
	.on("mouseout.bar",function(d,i){  
 		bar = d3.select(this);
    	//bar.selectAll("rect")
      	//.transition()  
      	//.duration(500)  
      	// .style("fill","green")
      	// .style("cursor", "default")
      	//bar.call("dragend")
		bar.selectAll(".dragbar") 
      	.transition()  
      	.duration(500)  
      	.style("opacity","0")


	})
		// .on("mousedown.bar",function(d,i){  
	 //    	d3.selectAll(".hBar.Pc rect").style("fill", "lightgreen");  
	 //    	console.log("mousedown")
		// })
		// .on("mouseup.bar",function(d,i){  
	 //    	d3.selectAll(".hBar.Pc rect") 
	 //      	.transition()  
	 //      	.duration(500)  
	 //      	.style("fill","green")
	 //      	console.log("mouseup")

		// })


    // vertical line
    init_Pc_G = closestRecord(G_plot.pressure_vs_G, init_Pc, 0)[1];
    init_Pc_x = x(init_Pc_G);

    var vLine = plot.append("path")        // Add the valueline3 path.
		.attr("class", "vLine")
	    .style("stroke-dasharray", ("3,3"))
	    .style("stroke-width", "2")
	    .style("stroke", "#363636")
	    .attr("d", "M" + init_Pc_x + "," + 0 + "L"+init_Pc_x+","+height);

	// GdpdG cross line
	init_cross_x = init_Pc_x;
	init_cross_G = init_Pc_G;
	init_cross_y = y1(closestRecord(G_plot.G_vs_GdpdG, init_cross_G, 0)[1]);
	init_end_x = init_cross_x + 20*Math.cos(Math.atan((height-init_cross_y)/init_cross_x));
	init_end_y = height - (height-init_cross_y)/init_cross_x*init_end_x

    var cLine = plot.append("path")        // Add the valueline3 path.
	.attr("class", "crossLine")
    //.style("stroke-dasharray", ("10,1"))
    .style("stroke-width", "2")
    .style("stroke", "darkgreen")
    .attr("d", "M" + 0 + "," + height + "L"+init_end_x+","+init_end_y);


    // Output box
    out_box_w = 120;
    out_box_h = 150;
    out_box_x = (width - out_box_w - 3);
    out_box_y = 5;

    out_box = plot.append("g")
    	.attr("class", "output_box")
	    .attr("transform", "translate(" + out_box_x + ", " + out_box_y + ")")

    out_box.append("rect")
	    //.attr("y", function(d) {return d.y})
	    .attr("width", out_box_w)
	    .attr("height", out_box_h)
	    .style("fill", "white")
   		.style("stroke-width", "0")
    	.style("stroke", "gray")
	    .style("fill-opacity", 1)

	var out_items_config =  [{"key":"ISIP","value":"","x":12,"y":20},
							 {"key":"Pc","value":"","x":12,"y":36},
							 {"key":"Pnet","value":"","x":12,"y":52},
	                         {"key":"P*","value":"789 psi","x":12,"y":68},
	                         {"key":"Tc","value":"5.6 min","x":12,"y":84},
	                         {"key":"Ct","value":"1.4 x10⁻⁵","x":12,"y":100},
	                         {"key":"Ef","value":"0.13","x":12,"y":116},
	                        ];

    var out_items = out_box.selectAll(".output")
        .data(out_items_config) 
        .enter().append("g")
        .attr("class", function(d) {return "output " + d.key })
        .attr("transform", function(d, i) { return "translate(" + d.x + "," + d.y + ")"; })
        .append("text")
        .style("text-anchor", "begin")
        .style("font-size",11)
        .attr("fill", "black")
        .text(function(d) { return d.key + ': ' + d.value;});


	//out_box.append()

	// drag the output box, will update its x,y  
	function out_box_dragmove() {	 
        var x = out_box_x + d3.event.dx;
        var y = out_box_y + d3.event.dy;
       
       	out_box_x = Math.max(Math.min(x, width-out_box_w), 0);
       	out_box_y = Math.max(Math.min(y, height-out_box_h), 0);

		d3.select(this)
		  .attr("transform", "translate(" + out_box_x + "," + out_box_y + ")");	  
	}

    out_box.call(d3.drag().on("drag", out_box_dragmove));

	d3.selectAll(".output_box").on("mouseover.bar",function(d,i){  
		d3.select(this)
    	.style("cursor", "move")
	});

	// put some shadow for the box...
	// var defs = svg.append("defs"); // Already defined before

	// height=130% so that the shadow is not clipped
	var filter = defs.append("filter")
	    .attr("id", "drop-shadow")
	    .attr("height", "120%");

	// SourceAlpha refers to opacity of graphic that this filter will be applied to
	// convolve that with a Gaussian with standard deviation 3 and store result
	// in blur
	filter.append("feGaussianBlur")
	    .attr("in", "SourceAlpha")
	    .attr("stdDeviation", 3)
	    .attr("result", "blur");

	// translate output of Gaussian blur to the right and downwards with 2px
	// store result in offsetBlur
	filter.append("feOffset")
	    .attr("in", "blur")
	    .attr("dx", 2)
	    .attr("dy", 2)
	    .attr("result", "offsetBlur");

	// overlay original SourceGraphic over translated blurred opacity by using
	// feMerge filter. Order of specifying inputs is important!
	var feMerge = filter.append("feMerge");

	feMerge.append("feMergeNode")
	    .attr("in", "offsetBlur")
	feMerge.append("feMergeNode")
	    .attr("in", "SourceGraphic");

	out_box.style("filter", "url(#drop-shadow)")

	// *** zoom ***
// 	var zoom = d3.zoom()
//     //.x(x)
// //    .y(y0)
//     .scaleExtent([1, 5])
//     .on("zoom", zoomed);

//     function zoomed() {
//     	var t = d3.event.transform;
//     	//console.log(t)
 
//     	g_xAxis.call(xAxis.scale(t.rescaleX(x)))
//     	g_yAxisLeft.call(yAxisLeft.scale(t.rescaleX(y0)))
//  		g_yAxisRight.call(yAxisRight.scale(t.rescaleX(y1)))

//     	//plot.attr("transform", "translate(" + t.x + "," + t.y + ") scale(" + t.k + ")"); // Apply to the whole plot, no domain transform
//   		//plot.attr("transform", t.toString()); // Apply to the whole plot, no domain transform
//   		//x.domain(t.rescaleX(x).domain());
//   		//plot.select(".").attr("d", area);

//   		//svg.select(".x.axis").call(xAxis);
//  		//svg.select(".y.axis").call(yAxis);
//  		//console.log(zoom)
// 	}

	//svg.call(zoom);

	/*** Manually zoom using rectangle/box selection! ***/

 //    var zoom = d3.zoom()
 //    		.x(x)
 //    		.y(y0)
 //            .extent([[x.range()[0]/2, y0.range()[0]/2], [x.range()[1], y0.range()[1]]])
 //            //.scaleExtent([[1, 10], [0, 15]])
 //            //.scaleRatio([0.5, 1])
 //            //.translateExtent([[x.range()[0], y.range()[0]], [x.range()[1], y(ymax)]])
 //            .on('zoom', zoomed);

	// function zoomed() {
	//   //  	var t = d3.event.transform;
	//   //  	//console.log(t)

	//   //  	g_xAxis.call(xAxis.scale(t.rescaleX(x)))
	//   //  	g_yAxisLeft.call(yAxisLeft.scale(t.rescaleX(y0)))
	// 		// g_yAxisRight.call(yAxisRight.scale(t.rescaleX(y1)))
	// 	svg.select(".x.axis").call(xAxis);
 //  		svg.select(".y.axis").call(yAxis);

	// }

	var zoom_box_x=0;
	var zoom_box_y=0;
	var zoom_box_w=0;
	var zoom_box_h=0;
	var zoom_box = plot_area.append("rect")
		.attr("x", 0)
		.attr("y", 0)
	    .attr("width", 10)
	    .attr("height", 10)
	    .style("stroke","gray")
	    .style("stroke-width", "0")
	    .style("stroke-dasharray", ("2,2"))
	    .style("fill-opacity", 0)


	function start_select_box_in_plot(){  
		var loc = d3.mouse(this);
		zoom_box_x = loc[0];
		zoom_box_y = loc[1];

		zoom_box_h = 0;
		zoom_box_w = 0;

		zoom_box
		.attr("transform", "translate(" + zoom_box_x + "," + zoom_box_y + ")")
	    .attr("width", zoom_box_w).attr("height", zoom_box_h) 
	    .style("stroke-width", "1")
	    .style("fill-opacity", 0.05)

		console.log("start drag")
	}

	function end_select_box_in_plot(){  
		zoom_box.style("stroke-width", "0").style("fill-opacity", 0)
		console.log("end drag")

		// *** zoom - manually set the axis range ***

	}

	function select_box_in_plot() {	 
        var w = zoom_box_w + d3.event.dx;
        var h = zoom_box_h + d3.event.dy;
       	
       	zoom_box_w = Math.max(Math.min(w, width-zoom_box_x), -zoom_box_x);
       	zoom_box_h = Math.max(Math.min(h, height-zoom_box_y), -zoom_box_y);

		zoom_box.attr("transform", "translate("
			+ ((w>0)?zoom_box_x:(zoom_box_x+zoom_box_w))
		  	+ ","  
		  	+ ((h>0)?zoom_box_y:(zoom_box_y+zoom_box_h))
		  	+ ")")

		zoom_box.attr("width", Math.abs(zoom_box_w)).attr("height", Math.abs(zoom_box_h)) 

		console.log("start drawing box")	  
	}

    plot_area.call(d3.drag()
    	.on("start.zoombox", start_select_box_in_plot)
    	.on("drag.zoombox", select_box_in_plot)
    	.on("end.zoombox", end_select_box_in_plot)
    );

} 

G_plot.updateLines = function(uData, lines){

	if (G_plot.PRESSURE-1 in lines) {
 
		G_plot.pressure_vs_G = [];
		uData.forEach(function(d) {
		    d.G = +d.G;
		    d.pressure = +d.pressure;

		    G_plot.pressure_vs_G.push([d.pressure, d.G])
		});

		G_plot.pressure_vs_G.sort(function(a,b) {return a[0]-b[0]}) 
	 
    	G_plot.svg.selectAll(".line.pressure")
		.transition()
		.duration(750)
		.attr("d", G_plot.valueline1(uData));	     		

	}

	if (G_plot.DPDG-1 in lines) {
    	G_plot.svg.selectAll(".line.dpdG")
    		.transition()
    		.duration(750)
    		.attr("d", G_plot.valueline2(uData));	     		
	}

  	if (G_plot.GDPDG-1 in lines) {
 
		G_plot.G_vs_GdpdG = [];
		uData.forEach(function(d) {
		    d.G = +d.G;
		    d.GdpdG = +d.GdpdG

		    G_plot.G_vs_GdpdG.push([d.G,d.GdpdG])
		});

		G_plot.G_vs_GdpdG.sort(function(a,b) {return a[0]-b[0]}) 

	   	G_plot.svg.selectAll(".line.GdpdG")
    		.transition()
    		.duration(750)
    		.attr("d", G_plot.valueline3(uData));	     		
	}
}


function derive_superpose(XY, w) {
	if (typeof w !== 'number') { w=1 }

    var n = XY.length
    if (n < 2 * w + 1) {
    	return []; // raise exception
    }

    var result = []; 
	for (var i=0; i<n; i++) {
		var sum_x_1 = 0, sum_y_1 = 0;
		var sum_x_2 = 0, sum_y_2 = 0;

		for(j=0; j<w; j++) {
			if (i-1-j < 0 ) {
				sum_x_1 += XY[0][0];
				sum_y_1 += XY[0][1];
			} else {
				sum_x_1 += XY[i-1-j][0];
				sum_y_1 += XY[i-1-j][1];
			}

			if (i+1+j > n-1 ) {
				sum_x_2 += XY[n-1][0];
				sum_y_2 += XY[n-1][1];
			} else {
				sum_x_2 += XY[i+1+j][0];
				sum_y_2 += XY[i+1+j][1];
			}

		}

		var der = -(sum_y_2-sum_y_1)/(sum_x_2-sum_x_1);
		result.push([der, XY[i][0]*der]) 
	}

    return result
}

function derive2(X, Y, w) {
	if (typeof w !== 'number') { w=1 }

    var n = Math.min(X.length, Y.length)
    if (n < 2 * w + 1) {
    	return []; // raise exception
    }

    var result = []; 
	for (var i=0; i<n; i++) {
		var sum_x_1 = 0, sum_y_1 = 0;
		var sum_x_2 = 0, sum_y_2 = 0;

		for(j=0; j<w; j++) {
			if (i-1-j < 0 ) {
				sum_x_1 += X[0];
				sum_y_1 += Y[0];
			} else {
				sum_x_1 += X[i-1-j];
				sum_y_1 += Y[i-1-j];
			}

			if (i+1+j > n-1 ) {
				sum_x_2 += X[n-1];
				sum_y_2 += Y[n-1];
			} else {
				sum_x_2 += X[i+1+j];
				sum_y_2 += Y[i+1+j];
			}

		}

		result.push(-(sum_y_2-sum_y_1)/(sum_x_2-sum_x_1))
	}

    return result
}

/* arr - array of records (a record is an array) and sorted by record[index] already */
function closestRecord(arr, num, index){
	if (typeof index !== 'number') { index=0 }

	try {
		t = arr[0][index];
	} catch(Exception) {
		return null;
	}	

  	var left = 0;
  	var right = arr.length - 1;

  	while(left <= right){
    	var middle = Math.floor((right + left) / 2);
    	if(right - left <= 1){
      		break;
    	}
    	var val = arr[middle][index];
    	if(val === num){
      		return arr[middle];
    	}
    	else if(val > num){
      		right = middle;
    	}
    	else {
      		left = middle;
    	}
  	}

  	var leftValue = arr[left][index];
  	var rightValue = arr[right][index];
  	return rightValue - num > num - leftValue ? arr[left] : arr[right];
}

function closest(arr, num){
  var left = 0;
  var right = arr.length - 1;

  while(left <= right){
    var middle = Math.floor((right + left) / 2);
    if(right - left <= 1){
      break;
    }
    var val = arr[middle];
    if(val === num){
      return middle;
    }
    else if(val > num){
      right = middle;
    }
    else{
      left = middle;
    }
  }

  var leftValue = arr[left];
  var rightValue = arr[right];
  return rightValue - num > num - leftValue ? leftValue : rightValue;
}

var superscript = "⁰¹²³⁴⁵⁶⁷⁸⁹",
    formatPower = function(d) { return (d + "").split("").map(function(c) { return superscript[c]; }).join(""); };
var superscript_signs = "⁻"
// ⁰ ¹ ² ³ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹ ⁺ ⁻ ⁼ ⁽ ⁾ ₀ ₁ ₂ ₃ ₄ ₅ ₆ ₇ ₈ ₉ ₊ ₋ ₌ ₍ ₎
// ᵃ ᵇ ᶜ ᵈ ᵉ ᶠ ᵍ ʰ ⁱ ʲ ᵏ ˡ ᵐ ⁿ ᵒ ᵖ ʳ ˢ ᵗ ᵘ ᵛ ʷ ˣ ʸ ᶻ 
// ᴬ ᴮ ᴰ ᴱ ᴳ ᴴ ᴵ ᴶ ᴷ ᴸ ᴹ ᴺ ᴼ ᴾ ᴿ ᵀ ᵁ ⱽ ᵂ 
// ₐ ₑ ₕ ᵢ ⱼ ₖ ₗ ₘ ₙ 
// ᵅ ᵝ ᵞ ᵟ ᵋ ᶿ ᶥ ᶲ ᵠ ᵡ ᵦ ᵧ ᵨ ᵩ ᵪ 

String.prototype.format = function(args) {
    var result = this;
    if (arguments.length > 0) {    
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if(args[key]!=undefined){
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    var reg = new RegExp("({[" + i + "]})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
}

// Number(1).toFixed(2); //1.00
// Number(1.3450001).toFixed(2); //1.34
 