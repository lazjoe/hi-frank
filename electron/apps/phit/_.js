// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

// import external modules
const electron = require('electron')
const clipboard = electron.clipboard
const dialog = electron.remote.dialog
const fs = require("fs")
const AdmZip = require('adm-zip')

// import internal modules
const {Article, Paragraph, Sentence} = require('./article')
const editor = require('./editor')

// define names and variables
const testFilePath = `${__dirname}/test/2.docx`

var projectPath = '/Users/apple/Documents/translation/phit_project_1'
var phitPath = '/Users/apple/Documents/translation/phit' // TODO: get system document folder path
var glossaryPath = projectPath + '/glossary/corpus.txt'

var annotatedSourcePane;
var annotatedTargetPane;
var machineTranslationPane;
var glossaryPane;
var glossaryManager;
var article;
//var originalSource

$(document).ready( function () {

    // Initialize global variables
    article = new Article(document.querySelector('.article-container'))

    // set up UI
    setupSplitters()
    setupEditors()
    setupNavIcons()
    //originalSource = clipboard.readHTML()
    //annotatedSourcePane.setContent(originalSource)

    // Hook up events
    article.addEventListener('switch', sentenceSwitching)
})

// UI initialzation
function setupSplitters() {
    document.querySelectorAll('.splitter').forEach(function (element) {
        setupSplitter(element);
    })
}

function setupSplitter(element) {
    // initialzation with recording some original values before any drag
    var prev = element.previousElementSibling
    var next = element.nextElementSibling
    var parent = element.parentElement

    var original_height_parent = parent.clientHeight   
    var original_width_parent = parent.clientWidth

    var horizontal = parent.classList.contains('rows') || element.classList.contains('horizontal')
    var vertical = parent.classList.contains('cols') || element.classList.contains('vertical')

    if (horizontal) {
        prev.style.flex = prev.clientHeight
        next.style.flex = next.clientHeight 
    } else if (vertical) {
        prev.style.flex = prev.clientWidth
        next.style.flex = next.clientWidth
    }
      
    function mouseDownHandler(ev){ 
        var ev = ev || window.event;  

        var original_Y = ev.clientY
        var original_X = ev.clientX
        var original_flex_prev = parseInt(prev.style.flex.split(' ')[0])
        var original_flex_next = parseInt(next.style.flex.split(' ')[0])
        var height_parent = parent.clientHeight   
        var width_parent = parent.clientWidth

        // record style values set inline
        var background = element.style.background 
        var cursor = element.style.cursor 


        element.style.background = 'lightgreen'

        var pseudo_layer = document.createElement("div")
        // set a full window pseudo layer to stablize the cursor style while dragging
        // otherwise cursor are shaking when moving out the drag bar
        pseudo_layer.style.position = 'absolute'
        pseudo_layer.style.height = '100%'
        pseudo_layer.style.width = '100%'
        document.body.appendChild(pseudo_layer)

        if (horizontal) {
            element.style.cursor = 'row-resize'
            pseudo_layer.style.cursor = 'row-resize'
        } else if (vertical) {
            element.style.cursor = 'col-resize'
            pseudo_layer.style.cursor = 'col-resize'
        }

        function mouseMoveHandler(ev){  
            var ev = ev || window.event 
 
            var delta = 0
            if (horizontal) {
                delta = (ev.clientY - original_Y) * original_height_parent / height_parent
            } else if (vertical) {
                delta = (ev.clientX - original_X) * original_width_parent / width_parent
            }
            
            prev.style.flex = original_flex_prev + delta
            next.style.flex = original_flex_next - delta
        }

        function mouseUpHandler(){  // clean up everything
            pseudo_layer.removeEventListener('mousemove', mouseMoveHandler)
            pseudo_layer.removeEventListener('mouseup', mouseUpHandler) 

            element.style.background = background; 
            element.style.cursor = cursor;
            document.body.removeChild(pseudo_layer)
        }

        pseudo_layer.addEventListener('mousemove', mouseMoveHandler)           
        pseudo_layer.addEventListener('mouseup', mouseUpHandler)  

        return false;  
    };  

    //element.addEventListener('mousedown', mouseDownHandler)   
    element.onmousedown = mouseDownHandler // exclude other handlers to ensure the designed behavior
}

function setupEditors() {
    annotatedSourcePane = new AnnotatedSource({ 
        'container': document.querySelector('.container.annotated.source')
    })
    annotatedSourcePane.initialize()
    annotatedSourcePane.addEventListener('submit', annotatedSourceSubmitted)
    
    glossaryPane = new GlossaryPane({ 
        'container': document.querySelector('.container.glossary')
    })
    glossaryManager = new GlossaryManager()
    glossaryManager.loadLocalFile(glossaryPath)   

}

function importFile(url, ready) {
    console.log(url)

    if (url.endsWith('.docx')) {
        const zip = new AdmZip(url); 
        let contentXml = zip.readAsText("word/document.xml");
        var xml = $.parseXML(contentXml)

        $(xml).find('p').each(function() {
            //let p_openxml = $(this).html()
            // convert paragragh in native openxml format to normal html, 
            // only support bold, italic, underline, supscript and superscript

            let html = ''

            $(this).find('r').each(function() {
                console.log(this)
                let run = $(this).find('t').text()
                let style = []

                $(this).find('b').each(() => {
                    style.push('b')
                })
                $(this).find('i').each(() => {
                    style.push('i')
                })
                $(this).find('u').each(() => {
                    style.push('u')
                })
                $(this).find('strike').each(() => {
                    style.push('strike')
                })
                $(this).find('vertAlign').each(function() {
                    if ($(this).attr('w:val') == 'subscript') { //don't know why attributes need namespace to be find but doms don't
                        style.push('sub')
                    }
                    if ($(this).attr('w:val') == 'superscript') {
                        style.push('sup')
                    }            
                })

                run = `<span class="${style.join(' ')}">${run}</span>`

                html = html + run
            })

            //console.log(html)
            let docNode = document.createElement('div')
            docNode.innerHTML = html
            mergeChildNodes(docNode)
            html = docNode.innerHTML

            // split the paragragh into sentences
            let regex = /([。？！])/
            let sentences = []
            let fragments = html.split(regex)

            if (fragments.length == 1) {
                sentences.push(fragments)
            } else {
                let lastTag = ''
                for(let i=1; i < fragments.length;i=i+2) {
                    let prev = fragments[i-1]
                    let next = fragments[i+1]
                    // find the last <span> tag with its attributes
                    let tags = prev.match(/<span.*?>/g)

                    if (tags) {
                        sentences.push(prev+fragments[i]+'</span>')
                        lastTag = tags[tags.length-1]

                    } else {
                        sentences.push(lastTag + prev + fragments[i] + '</span>')
                    }
                    
                    if (next.startsWith('</span>')) { // just remove the leading close tag if any to avoid blank <span></span> pair
                        fragments[i+1] = next.substring(7,next.length)
                    } else {                    
                        fragments[i+1] = lastTag + next 
                    }

                }
            }

            let paragraph = new Paragraph()

            for(let sentence of sentences) {
                let s = paragraph.addSentenceWithOrigin(sentence)
                s.addEventListener('click', () => {
                    article.setCurrentSentence(s)
                })
            }

            article.addParagraph(paragraph)
            console.log(html)
        });
       
    } else {
        alert('File type not supported yet!')
        return
    }

    ready = (typeof ready == 'function') ? ready : (()=>{})
    ready()

}

function setupNavIcons() {
    // bind UI navigator events, should only be called once
    $('.nav-import-file').parent().on('click', () => {
        let files = dialog.showOpenDialog({properties: ['openFile']})
        if (!files || !(files.length)) {
            return
        }
        // save previous project 
        // cleanup current project
        importFile(files[0], ()=>{
            $('.dialog.select-item').click(function() {
                $('.dialog.select-item').fadeOut(300)
            })
        })
            //

        $('.dialog.select-item').fadeIn(300)
    })
 
    $('.nav-nav-open-file').parent().on('click', () => {
        
    })

    $('.nav-setup-library').parent().on('click', () => {
        
    })

    $('.nav-export-file').parent().on('click', () => {
        
    })

    $('.nav-reset-item').parent().on('click', () => {
        
    })

    $('.nav-select-item').parent().on('click', () => {
        $('.dialog.select-item').fadeToggle(300)
    })

    $('.nav-next-item').parent().on('click', () => {
        
    })

    $('.nav-prev-item').parent().on('click', () => {
        
    })

    $('.nav-preferences').parent().on('click', () => {
        
    })

}

// UI event handlers
function sentenceSwitching(e) {
    console.log(e.from, e.to)
}

function annotatedSourceSubmitted() {
    alert('annotatedSourceSubmitted')
}

function translateSource() {
    let source = $('#annotated-source div').html().trim()

    baidu_translate(originalSource, (d)=>{ 
        $('#machine-translation').append('<div contenteditable=true>' + d.trans_result[0].dst + '</div>')
    })   

    // analyze annotated source
    let frame = ''; 
    let corpus = '';

    //let corpusName = 'A'; //$X:A";
    let lc = 0;

    let corpusList = [];
    
    for (let i = 0; i < source.length; i++) {
        
        let c = source.charAt(i);
        
        if (c=='[') {
            lc++;
        } else if (c==']') {
            lc--;
                                
            let corpusName = 'A'+ Math.floor(Math.random()*90000+10000)
            let corpusObj = { 'name': corpusName, 'value': corpus, 'lang': 'zh' };
            
            corpusList.push(corpusObj);
            
            frame = frame + ' ' + corpusName + ' ';
            
            //reset corpus name for next occurrence
            //corpusName = ''+(parseInt(corpusName.charAt(0)) + 1);
            
            corpus = ''; 
        } else {
            if (lc > 0) {
                corpus += c;
            } else {
                frame += c;
            }
        }
        
    }

    console.log('frame: ', frame)

    query = frame
    for (let i in corpusList) {
        console.log(corpusList[i])
        query = query + '\n' + corpusList[i].value
    }

    baidu_translate(query, (d)=>{ 
        console.log(d) //d.trans_result



    })     

    // baidu_translate(source, (d)=>{
    //     $('#annotated-target').val(d.trans_result[0].dst)
    // })  
}




// utilities
// String.prototype.trim=function()
// {
//      return this.replace(/(^\s*)|(\s*$)/g, '');
// }

/** Merge adjacent child nodes if they share same class */
function mergeChildNodes(node) {
    let nodes = []
    node.childNodes.forEach( (v) => {nodes.push(v)} ) // clone

    for (let i=0, j=i+1; j<nodes.length; ) {    
        for (; j<nodes.length; j++) {
            if (hasSameClass(nodes[i],nodes[j])) {
                nodes[i].innerHTML = nodes[i].innerHTML + nodes[j].innerHTML
                node.removeChild(nodes[j])
            } else {
                i = j++
                break
            }
        }
    }
}

function hasSameClass(node1, node2) {
    let c1 = node1.classList
    let c2 = node2.classList

    if (!c1.length && !c2.length) {return true}
    if (c1.length != c2.length) {return false}

    c1.forEach((value) => {
        if (!c2.contains(value)) {return false}
    })

    return true
}

/** Merge two nodes. The properties of node2 will be discarded while its innerHTML will be merged into node1 */
function mergeTwoNodes(node1, node2) {
    node1.innerHTML = node1.innerHTML + node2.innerHTML
    return node1
}

                
                // $(this).find('b').each(() => {
                //     run = '<b>' + run + '</b>'
                // })
                // $(this).find('i').each(() => {
                //     run = '<i>' + run + '</i>'
                // })
                // $(this).find('u').each(() => {
                //     run = '<u>' + run + '</u>'
                // })
                // $(this).find('strike').each(() => {
                //     run = '<strike>' + run + '</strike>'
                // })
                // $(this).find('vertAlign').each(function() {
                //     if ($(this).attr('w:val') == 'subscript') { //don't know why attributes need namespace to be find but doms don't
                //         run = '<sub>' + run + '</sub>'
                //     }
                //     if ($(this).attr('w:val') == 'superscript') {
                //         run = '<sup>' + run + '</sup>'
                //     }            
                // })

            // TODO: Rewrite this algorithm to support cross-sentence formatting. i.e. handle seperator breaking within tags
            // split the paragragh into sentences
            // let regex = /([。？！])/
            // let sentences = html.split(regex)

            // for (let i=0;i<sentences.length-1;i++) {
            //     let cur = sentences[i]
            //     let next = sentences[i+1]

            //     if (next.match(regex)) {
            //         cur = cur + next
            //         i++ // skip next as it has been already combined into current sentences
            //     }

            //     let node = itemlist.addItemWithNode(cur)
            //     document.querySelector(".article-container").appendChild(node)
            //     console.log(cur)
            // }

            // //handle last sentence
            // let cur = sentences[sentences.length-1]
            // if (!(cur.match(regex))) {
            //     let node = itemlist.addItemWithNode(cur)
            //     document.querySelector(".article-container").appendChild(node)
            //     console.log(cur)
            // }

            //$(".article-container").append(`<div>${html}</div>`)