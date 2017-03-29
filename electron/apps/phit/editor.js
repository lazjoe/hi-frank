               
               
               /*<div class="simple-box header">ANNOTATED SOURCE</div>
                <div class="simple-box content" id="annotated-source" > 
             
                </div>
 
                 <div class="simple-box header">ANNOTATED TARGET</div>
                <div class="simple-box content" id="annotated-target">

                </div>
             
                <div class="simple-box header">MACHINE TRANSLATION</div>
                <div class="simple-box content" id="machine-translation">

                </div>*/

// function createEditor(args) {
//     var editor = null
//     if (args.container) {
//         editor = new Editor(args);
//         $(args.container).append(editor.outerBox)
//     }
//     return editor
// }

//  npm rebuild --runtime=electron --target=1.6.2 --disturl=https://atom.io/download/atom-shell --abi=51


// Podium = {};
// Podium.keydown = function(k) {
//     var oEvent = document.createEvent('KeyboardEvent');

//     // Chromium Hack
//     Object.defineProperty(oEvent, 'keyCode', {
//                 get : function() {
//                     return this.keyCodeVal;
//                 }
//     });     
//     Object.defineProperty(oEvent, 'which', {
//                 get : function() {
//                     return this.keyCodeVal;
//                 }
//     });     

//     if (oEvent.initKeyboardEvent) {
//         oEvent.initKeyboardEvent("keydown", true, true, document.defaultView, k, k, "", "", false, "");
//         //oEvent.initKeyboardEvent("keydown", true, true, document.defaultView, false, false, false, false, k, k);
//     } else {
//         oEvent.initKeyEvent("keydown", true, true, document.defaultView, false, false, false, false, k, 0);
//     }

//     oEvent.keyCodeVal = k;

//     if (oEvent.keyCode !== k) {
//         alert("keyCode mismatch " + oEvent.keyCode + "(" + oEvent.which + ")");
//     }

//     document.activeElement.dispatchEvent(oEvent);
// }
function getPreviousSiblings(node) {
    if (!node) {
        return []
    }
    if (!node.parentElement) {
        return [node]
    }

    let previous_siblings = []
    for (let n of node.parentElement.childNodes) {
        if (n==node) {
            break
        }
        previous_siblings.push(n)
    }
  
    return previous_siblings
}
// given a node, return its ancestor's previous siblings and its own siblings in order
function getPreviousNodes(node, root) {
    if (!node) {
        return []
    }
    root = root || node.parentElement

    let list_root2node = []
    let pre_nodes = []
    let node1 = node
    while (true) {
        if (node1 == document || node1 == root || !node1.parentElement) {
            break
        }

        node1 = node1.parentElement
        list_root2node.unshift(node1)
    }

    for (let m of list_root2node) {
        for (let n of getPreviousSiblings(m)) {
            pre_nodes.push(n)
        }
    }

    console.log(node)
    console.log(pre_nodes)
    return pre_nodes
}

function getPreviousText() {
    
}

class Editor {
    constructor(args) {
        var args = args || {}
        this.container = args.container //|| document.createElement('div')
        this.id = args.id || 'editor' + Math.floor(Math.random()*10000+1000)
        this.title = args.title || 'EDITOR'
        this.editable = args.editable || true

        this.outerBox = document.createElement('div')
        this.outerBox.setAttribute('class', 'simple-box')
        this.outerBox.setAttribute('id', this.id)

        this.headerBox = document.createElement('div')
        this.headerBox.setAttribute('class', 'simple-box-header')
        this.headerBox.innerText = this.title

        this.contentBox = document.createElement('div')
        this.contentBox.setAttribute('class', 'simple-box-content')

        this.innerBox = document.createElement('div')
        this.innerBox.setAttribute('contenteditable', this.editable)

        this.contentBox.appendChild(this.innerBox)
        this.outerBox.appendChild(this.headerBox)
        this.outerBox.appendChild(this.contentBox)

        if (this.container) {
            this.container.appendChild(this.outerBox)
        }
        //$(this.outerBox).append(`<div class="simple-box-header">${this.title}</div>`)
        //$(this.outerBox).append(`<div class="simple-box-content"></div>`) 
        //$(this.outerBox).find('.simple-box-content').append(`<div contenteditable=true></div>`) 
    }
}

/** Usage **
 * 
 * The format of bold, italic, underline, strike-through and superscript, subscript are supported
 * All formatted text will be forcely recognized as fragmented corpus (translated separatedly), and can be changed into reserved corpus
 * All non-source language text will be forced to reserved (do-not-translate) corpus 
 * Corpus will recognized only in same formatted text
 * 
 * Keyboard Definition
 * 
 * d | ->: move cursor right
 * ctrl + d | ->: move cursor to next blank
 * alt  + d | ->: move cursor to next blank, in English or similar western language, it's same as ctrl + d | ->
 * Similar for a | <- to move cursor left
 * shift + ctrl | alt + (a | <-) | (d | ->): select the text using similar behavior of move cursor
 * w | up: move cursor up
 * s | down: move cursor down
 * space: insert a space
 * backspace: delete a space or line break. No other characters can be deleted
 * enter: intert a line break. Text in different line will be translated separated by default and user can further combine in annoted target pane
 * r: set the selection as a reserved corpus
 * f: set the selection as a fragmented corpus 
 */
class AnnotatedSource extends Editor {
    constructor(args) {
        args.id = args.id || 'annotated-source'
        args.title = args.title || 'ANNOTATED SOURCE'
        super(args)

    }


    //
    locateCorpus() {
        let sel = window.getSelection()
        sel.focusNode.parentElement

        let html_before = ''
        let previous_siblings = []
        this.innerBox.parentElement.children.forEach(function (d) {
            if (d == focusNode) {
                html_before
            }
            
        })

    }

    fragmentCorpus() {

    }

    reserveCorpus() {

    }

    initialize() {
        var submitEvent = document.createEvent("HTMLEvents")
        submitEvent.initEvent("submit", true, false) 

        function remapKeyDown (e) {
            let sel = document.getSelection()
            
            switch(e.which) {

                // simulate ADSW as arrow keys 
                case 65: // A
                    keyboard.keyTap('left', e.altKey, e.ctrlKey, e.metaKey, e.shiftKey)
                break;

                case 68: // D
                    keyboard.keyTap('right', e.altKey, e.ctrlKey, e.metaKey, e.shiftKey)
                break;

                case 87: // W 
                    keyboard.keyTap('up', e.altKey, e.ctrlKey, e.metaKey, e.shiftKey)
                break;

                case 83: // S
                    keyboard.keyTap('down', e.altKey, e.ctrlKey, e.metaKey, e.shiftKey)
                break;

                case 8: // backspace
                    if (sel.isCollapsed) {
                        let pos = sel.focusOffset
                        let text = sel.baseNode.data
                        if (pos == 0) {
                            getPreviousNodes(sel.focusNode, this)
                        }
                        if (pos>0 && text[pos-1].trim() == '') {
                            return
                        } else {
                            break
                        }
                    } else {
                        if (sel.toString().trim() == '') {
                            return
                        } else {
                            break
                        }
                    }
                break;

                case 46: // delete
                    //let sel = document.getSelection()
                    if (sel.isCollapsed) {
                        let pos = sel.focusOffset
                        let text = sel.baseNode.data
                        if (pos < text.length-1 && text[pos].trim() == '') {
                            return
                        } else {
                            break
                        }
                    } else {
                        if (sel.toString().trim() == '') {
                            return
                        } else {
                            break
                        }
                    }
                break;

                case 70: // F
                    
                break;

                case 82: // R
                break;
                  
                // keep default behavior for these keys
                case 13: // enter
                case 32: // whitespace
                case 37: // left
                case 38: // up
                case 39: // right
                case 40: // down
                return;

                default: 
                    if (e.altKey || e.metaKey) {
                        return
                    } else {
                        e.preventDefault(); // exit this handler for other keys
                    }
            }
            e.preventDefault(); // prevent the default action (scroll / move caret)
    
        }

        this.innerBox.addEventListener('keydown', remapKeyDown)
    }

    /** Delegate the events operations (add/remove) to internal DOM components */
    addEventListener(type, callback, useCapture) {
        type = type || ''
        callback = callback || null
        useCapture = useCapture || false

        if (type == 'submit') {
            this.innerBox.addEventListener('submit', callback, useCapture)
        }
    }

    removeEventListener(type, callback) {
        type = type || ''
        callback = callback || null

        if (type == 'submit') {
            this.innerBox.removeEventListener('submit', callback)
        }   
    }

    dispose() {
        this.innerBox.onkeydown = null;
        // handle customized events
    }

    setContent(content) {
        this.innerBox.innerHTML = content
        return this.innerBox.innerHTML // innerHTML is not necessarily equal to content because browser will check and make it compliant to syntax
    }

    getContent() {
        return this.innerBox.innerHTML
    }
}

class GlossaryPane extends Editor {
    constructor(args) {
        args.id = args.id || 'glossary-pane'
        args.title = args.title || 'GLOSSARY'
        args.editable = false
        super(args)
    }

    addEntry(entry) {
        var entryNode = document.createElement('div') 
        this.innerBox.appendChild(entryNode)
    }
}