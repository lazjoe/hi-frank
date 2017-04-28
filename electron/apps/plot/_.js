const clipboard = require('electron').clipboard;
//const htmlparser = require('htmlparser2')

const { Plot, Axis } = require('./plot')

window.onload = function () {

    // get data from clipboard
    let data = parseClipboard()

    let plot = new Plot('plot')
    plot.addCurves(data)
    plot.render()
}

function parseHTML(html) {
    // var handler = new htmlparser.DomHandler(function (error, dom) {
    //     if (error) {

    //     } else {
    //         console.log(dom);
    //     }   
    // })

    // var parser = new htmlparser.Parser(handler)
    // parser.write(html);
    // parser.end();

    let div = document.createElement('div')
    div.innerHTML = html
    console.log(div)

    let data = []
    let table = div.querySelector('table')
    for(let row of table.querySelectorAll('tr')) {
        let d = []
        for (let col of row.querySelectorAll('td')) {
            d.push(col.textContent)
        }
        data.push(d)
    }

    console.log(data)
    return data
}

function parseClipboard() {
    var result = null

    var formats = clipboard.availableFormats()
    if (formats.includes('text/html')) {
        let html = clipboard.readHTML()
        //console.log(html)
        result = parseHTML(html)
    }

    return result
}