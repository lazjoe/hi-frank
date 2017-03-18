function test_data(data, div_ID, d3) {

	data.forEach(function(d) {
	    d.G = +d.G;
	    d.pressure = +d.pressure;
	    d.dpdG = +d.dpdG;
	    d.GdpdG = +d.GdpdG
	});

	xvalues = [3,4,5]
	yvalues = [4,5,6]

	console.log('d3.extent(xvalues)', d3.extent(xvalues));


}