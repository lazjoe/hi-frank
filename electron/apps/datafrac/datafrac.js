/*** d3 code to generate G plot. ***/

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.df = global.df || {})));
}(this, (function (exports) { 'use strict';


var t = 1;

function Axis(range, domain) {
	
}


function G_plot() {
	this.x=1;
	this.y0;
	this.y1;
}

G_plot.prototype = {
	render: function() {
		alert(this.x)
	}
}

exports.t = t;

Object.defineProperty(exports, '__esModule', { value: true });

})));