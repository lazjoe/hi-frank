class Util {
    loadScript(src, onload) {
        var script = document.createElement('script');
        script.src = src;
        script.onload = onload;
        document.head.appendChild(script);
    }
}
var util = new Util()

window.$ = window.jQuery = require('jquery')
//load local libraries here
util.loadScript("md5.js")
util.loadScript("robot.js")
util.loadScript("editor.js")
util.loadScript("translator.js")
util.loadScript("glossary.js")

