               
const robot = require('./robot')  

String.prototype.insert = function (i, str) {
    return this.substring(0,i) + str + this.substring(i, this.length)
}

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

function getPreviousText(node, root) {
    let pre_nodes = getPreviousNodes(node, root)
    let pre_text = ''
    for (let n of pre_nodes) {
        if (n.tagName == 'DIV') {
            pre_text += '\n'
        }

        if (n.nodeType == 1) {
            pre_text += n.innerText
        }
        if (n.nodeType == 3) {
            pre_text += n.textContent
        }

    }

    if (node.tagName == 'DIV') {
            pre_text += '\n'
    }
    return pre_text
}

function isInFirstDIV(node, root) {
    if (!node || !node.parentElement) {
        return false
    }
    if (node.parentElement == document) {
        return !document.childNodes.indexOf(node)
    }
    root = root || node.parentElement
    if (root == node.parentElement) {
        return (node.previousSibling && node.previousSibling.tagName == 'DIV' )? true : false
    }

    if (node.tagName == 'DIV' || node.parentElement.childNodes.indexOf(node)==0) {
        return true
    } else {
        return isInFirstDIV(node.parentElement,root)
    }
}

function findCorpusNode(node, root) {
    if (!node || !node.parentElement || node == document) {
        return false
    }

    root = root || node.parentElement
    if (root == node) {
        if (node.tagName == 'SPAN' || $(node).hasClass('corpus')) {
            return node
        } else {
            return false
        } 
    }

    if (node.tagName == 'SPAN' || $(node).hasClass('corpus')) {
        return node
    } else {
        return findCorpusNode(node.parentElement,root)
    }  
}

/**
 * walk through tree from start node to stop node or return to start node itself if stop not met
 * Thus set stop to null if a transerse of start (root) is required
 * function enter will be called when talking into a node and exit called when leaving a node,
 * which will be passed to enter/exit.
 */ 
function walkTree(start, stop, enter, exit) {
    let treeWalked = []
    if (!start) {
        return []
    }
    enter = enter || (()=>{})
    exit = exit || (()=>{})

    enter(start) 
    if (start == stop || start.nodeType != 1) {       
        treeWalked = [start]  
    } else {
        for(let m of start.childNodes) {
            //treeWalked = treeWalked.concat(walkTree(m, stop, enter, exit))
            for(let n of walkTree(m, stop, enter, exit)) {
                treeWalked.push(n)
            }  
            if (stop && treeWalked[treeWalked.length-1] == stop) {
                break
            }  
        } 
    }
    exit(start) 

    return treeWalked
}

function textNodesUnder(node){
//   var n, a=[], walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null,false);
//   while(n=walk.nextNode()) a.push(n);
//   return a;
    var nodes = []
     walkTree(node, null, (n)=>{
        //enter
    },(n)=>{
        //exit
        if (n.nodeType == Node.TEXT_NODE) {
            nodes.push(n)
        }
    })   

    return nodes
}

function getTextBefore(root, node) {
    var text = ''
    walkTree(root, node, (n)=>{
        //enter
    },(n)=>{
        //exit
        if (n.nodeType == Node.TEXT_NODE) {
            text += n.data
        }
    })

    return text
}

function findTextNodeAndOffset(root, pos) {
    //walkTree

    
}

function setCursor(node, pos) {
    // if (pos<0 || pos > this.innerBox.innerText.length) {
    //     pos = 0
    // }
    // find which text node should be located

    // set the offset in the target text node
    let sel = window.getSelection()
    let range = document.createRange()

    if (node.nodeType == Node.TEXT_NODE) {
        range.setEnd(node, pos)
        range.setStart(node, pos)
        range.collapse(true)

        sel.removeAllRanges()
        sel.addRange(range)
        node.parentNode.focus()
    } else {
        //let textNode = null
        for (let t of textNodesUnder(node)) {
            if (t.data.length < pos + 1) {
                pos -= t.data.length
            } else {
                node = t
                break
            }
        }

        setCursor(node, pos)
    }
    //range.selectNode(node);

  
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
        this.innerBox.editorObj = this // for events to trace back to the object

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

var stopChars = ' ,.:-)(<>!?（）/，。；：“”！？《》'

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

    setCursor(pos) {
        // if (pos<0 || pos > this.innerBox.innerText.length) {
        //     pos = 0
        // }
        // find which text node should be located

        // set the offset in the target text node

        let range = document.createRange();
        range.selectNodeContents(this.innerBox);
        range.collapse(true);
        range.setEnd(this.innerBox, pos);
        range.setStart(this.innerBox, pos);
        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        this.innerBox.focus()
    }

    setupKeyboard() {
        function keydownHandler (e) {
            let sel = document.getSelection()
            
            switch(e.which) {

                // simulate ADSW as arrow keys 
                case 65: // A
                    robot.keyboard.keyTap('left', e.altKey, e.ctrlKey, e.metaKey, e.shiftKey)
                break;

                case 68: // D
                    robot.keyboard.keyTap('right', e.altKey, e.ctrlKey, e.metaKey, e.shiftKey)
                break;

                case 87: // W 
                    robot.keyboard.keyTap('up', e.altKey, e.ctrlKey, e.metaKey, e.shiftKey)
                break;

                case 83: // S
                    robot.keyboard.keyTap('down', e.altKey, e.ctrlKey, e.metaKey, e.shiftKey)
                break;

                case 8: // backspace
                    if (sel.isCollapsed) {
                        let pos = sel.focusOffset
                        let text = sel.baseNode.data
                        if (pos == 0 && isInFirstDIV(sel.focusNode, this)) {
                            return
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
                        let text = sel.focusNode.data
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
                    if (e.metaKey || e.ctrlKey || e.altKey) {return}
                    
                    if (sel.isCollapsed) {
                        let pos = sel.focusOffset
                        let text = sel.focusNode.data
                        if (!text) {break}
                        let i=pos, j=pos
                        for (; i>0; i--) {
                            if (text[i-1].trim() == '' || stopChars.indexOf(text.charAt(i-1)) > -1 ) {
                                break
                            }
                        }
                        for (; j<text.length; j++) {
                            if (text[j].trim() == '' || stopChars.indexOf(text.charAt(j)) > -1) {
                                break
                            }
                        }                        
                        console.log(text, pos, i, j, text.substring(i,j))
                        
                        let corpusNode = findCorpusNode(sel.focusNode, this)
                        if (corpusNode) {
                            // for (let n of corpusNode.childNodes) {
                            //     corpusNode.parentElement.insertBefore(n, corpusNode)
                            // }
                            // corpusNode.parentElement.removeChild(corpusNode)
                            let t = getTextBefore(corpusNode.parentNode, corpusNode)
                            //console.log(t)

                            let baseNode = corpusNode.parentNode
                            corpusNode.outerHTML = corpusNode.innerHTML // remove tags for corpus <span>
                            setCursor(baseNode, t.length + pos)
                        } else {
                            let id=Math.floor(Math.random()*90000+10000)
                            corpusNode = document.createElement('span')
                            corpusNode.setAttribute('class', 'corpus fragment')
                            corpusNode.setAttribute('id', 'c'+id)
                            corpusNode.innerHTML = text.substring(i,j)
                            let textBefore = document.createTextNode(text.substring(0,i))
                            let textAfter = document.createTextNode(text.substring(j,text.length))
                            sel.focusNode.parentElement.insertBefore(textBefore, sel.focusNode)
                            sel.focusNode.parentElement.insertBefore(corpusNode, sel.focusNode)
                            sel.focusNode.parentElement.insertBefore(textAfter, sel.focusNode)
                            sel.focusNode.parentElement.removeChild(sel.focusNode)
                            // let html = sel.focusNode.parentElement.innerHTML
                            // sel.focusNode.parentElement.innerHTML = 
                            //     html.insert(i, `<span class='corpus' id='${id}'>`)
                            //         .insert(j-1, '</span>')
                            setCursor(corpusNode, pos-i)

                        }
                        break;
                    } else {
                        if (sel.toString().trim() == '') {
                            break
                        } else {
                            break
                        }
                    }
                    
                break;

                case 82: // R
                    if (e.metaKey || e.ctrlKey || e.altKey) {return}

                    if (sel.isCollapsed) {
                        let pos = sel.focusOffset
                        let text = sel.focusNode.data
                        if (!text) {break}
                        let i=pos, j=pos
                        for (; i>0; i--) {
                            if (text[i-1].trim() == '' || stopChars.indexOf(text.charAt(i-1)) > -1 ) {
                                break
                            }
                        }
                        for (; j<text.length; j++) {
                            if (text[j].trim() == '' || stopChars.indexOf(text.charAt(j)) > -1) {
                                break
                            }
                        }                        
                        console.log(text, pos, i, j, text.substring(i,j))
                        
                        let corpusNode = findCorpusNode(sel.focusNode, this)
                        if (corpusNode) {
                            // for (let n of corpusNode.childNodes) {
                            //     corpusNode.parentElement.insertBefore(n, corpusNode)
                            // }
                            // corpusNode.parentElement.removeChild(corpusNode)
                            let t = getTextBefore(corpusNode.parentNode, corpusNode)
                            //console.log(t)

                            let baseNode = corpusNode.parentNode
                            corpusNode.outerHTML = corpusNode.innerHTML // remove tags for corpus <span>
                            setCursor(baseNode, t.length + pos)
                        } else {
                            let id=Math.floor(Math.random()*90000+10000)
                            corpusNode = document.createElement('span')
                            corpusNode.setAttribute('class', 'corpus reserved')
                            corpusNode.setAttribute('id', 'c'+id)
                            corpusNode.innerHTML = text.substring(i,j)
                            let textBefore = document.createTextNode(text.substring(0,i))
                            let textAfter = document.createTextNode(text.substring(j,text.length))
                            sel.focusNode.parentElement.insertBefore(textBefore, sel.focusNode)
                            sel.focusNode.parentElement.insertBefore(corpusNode, sel.focusNode)
                            sel.focusNode.parentElement.insertBefore(textAfter, sel.focusNode)
                            sel.focusNode.parentElement.removeChild(sel.focusNode)
                            // let html = sel.focusNode.parentElement.innerHTML
                            // sel.focusNode.parentElement.innerHTML = 
                            //     html.insert(i, `<span class='corpus' id='${id}'>`)
                            //         .insert(j-1, '</span>')
                            setCursor(corpusNode, pos-i)

                        }
                        break;
                    } else {
                        if (sel.toString().trim() == '') {
                            break
                        } else {
                            break
                        }
                    }

                break;

                // disable shortcuts for bold, italic
                case 66: // B
                case 73: // I
                    if (e.altKey || e.metaKey) {
                        return
                    } else {
                        break // exit this handler for other keys
                    }
                  
                case 13: // enter
                    //sel.focusOffset
                //break;

                // keep default behavior for these keys
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
                        break // exit this handler for other keys
                    }
            }
            e.preventDefault(); // prevent the default action (scroll / move caret)
        }

        this.innerBox.addEventListener('keydown', keydownHandler)
    }

    initialize() {
        var submitEvent = document.createEvent("HTMLEvents")
        submitEvent.initEvent("submit", true, false) 

        this.setupKeyboard()
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

