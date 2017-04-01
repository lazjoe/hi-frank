// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
window.$ = window.jQuery = require('jquery')
const clipboard = require('electron').clipboard;

const fs = require("fs")
const AdmZip = require('adm-zip')

const filepath = `${__dirname}/test/2.docx`
console.log(filepath)

const zip = new AdmZip(filepath); 
let contentXml = zip.readAsText("word/document.xml");
//console.log(contentXml)

//var parseXml;

// if (typeof window.DOMParser != "undefined") {
//     parseXml = function(xmlStr) {
//         return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
//     }
// } else {
//     throw new Error("No XML parser found in Electron");
// }

var xml = $.parseXML(contentXml)
console.log(xml)

$(xml).find('p').each(function() {
    //let p_openxml = $(this).html()
    // convert paragragh in native openxml format to normal html, 
    // only support bold, italic, underline, supscript and superscript

    let html = ''

    $(this).find('r').each(function() {
        console.log(this)
        let run = $(this).find('t').text()
        $(this).find('b').each(() => {
            run = '<b>' + run + '</b>'
        })
        $(this).find('i').each(() => {
            run = '<i>' + run + '</i>'
        })
        $(this).find('u').each(() => {
            run = '<u>' + run + '</u>'
        })
        $(this).find('strike').each(() => {
            run = '<strike>' + run + '</strike>'
        })
        $(this).find('vertAlign').each(function() {
            if ($(this).attr('w:val') == 'subscript') { //don't know why attributes need namespace to be find but doms don't
                run = '<sub>' + run + '</sub>'
            }
            if ($(this).attr('w:val') == 'superscript') {
                run = '<sup>' + run + '</sup>'
            }            
        })

        html = html + run
    })

    // TODO: Rewrite this algorithm to support cross-sentence formatting. i.e. handle seperator breaking within tags
    // split the paragragh into sentences
    let regex = /([。？！])/
    let sentences = html.split(regex)

    for (let i=0;i<sentences.length-1;i++) {
        let cur = sentences[i]
        let next = sentences[i+1]

        if (next.match(regex)) {
            cur = cur + next
            i++ // skip next as it has been already combined into current sentences
        }
        $(".article-container").append('<div>' + cur + '</div>')
        console.log(cur)
    }

    //handle last sentence
    let cur = sentences[sentences.length-1]
    if (!(cur.match(regex))) {
        $(".article-container").append('<div>' + cur + '</div>')
        console.log(cur)
    }

    //$(".article-container").append(`<div>${html}</div>`)
});

$(".article-container div").click(function() {
    //clipboard.writeText($(this).html())
    clipboard.writeHTML($(this).html())
})

