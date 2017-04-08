Node.prototype.insertAfter = function(newNode, refNode) {
    if (!(newNode instanceof Node) || !(refNode instanceof Node)) return false

    if (refNode.nextSibling) {
        this.insertBefore(newNode, refNode.nextSibling)
    } else (
        this.appendChild(newNode)
    )
}

/** Merge adjacent child nodes if they share same class */
function mergeChildNodes(node) {
    let nodes = []
    node.childNodes.forEach( (d) => {nodes.push(d)} ) // clone

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

    for(let c of c1) {
        if (!c2.contains(c)) {return false}
    }

    return true
}

/** Merge two nodes. The properties of node2 will be discarded while its innerHTML will be merged into node1 */
function mergeTwoNodes(node1, node2) {
    node1.innerHTML = node1.innerHTML + node2.innerHTML
    return node1
}

function setCursorInTextNode(node, pos) {

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
    }
}

function isFirstSpan(node) {
    if (!node || !node.parentElement) {
        return false
    }

    return node == node.parentElement.firstChild
}

function atStartOfLine(sel) {
    sel = sel || window.getSelection()
    let pos = sel.focusOffset
    let node = sel.focusNode
    
    if (!node || !node.parentElement) { return false}
    let parent = node.parentElement

    if (node.nodeType != Node.TEXT_NODE) { return false }
    if (pos !=0) { return false }

    // true if it's first text in line div. here the only character expected is blank
    if (parent.tagName == 'DIV' && node == parent.firstChild) { return true } 

    // if it's in the first span of the line
    if (parent.tagName == 'SPAN' && parent == parent.parentElement.firstChild) { return true }

    return false 
} 

function atEndOfLine(sel) {
    sel = sel || window.getSelection()
    let pos = sel.focusOffset
    let node = sel.focusNode
    
    if (!node || !node.parentElement) { return false}
    let parent = node.parentElement

    if (node.nodeType != Node.TEXT_NODE) { return false }
    if (pos != node.data.length) { return false }

    // true if it's first text in line div. here the only character expected is blank
    if (parent.tagName == 'DIV' && node == parent.lastChild) { return true } 

    // if it's in the first span of the line
    if (parent.tagName == 'SPAN' && parent == parent.parentElement.lastChild) { return true }

    return false 
} 

function myDadIsDiv(sel) {
    sel = sel || window.getSelection()
    let pos = sel.focusOffset
    let node = sel.focusNode

    if (!node || !node.parentElement) { return false}
    let parent = node.parentElement

    if (node.nodeType != Node.TEXT_NODE) { return false }

    return parent.tagName == 'DIV'
}

function breakSpan(sel) {
    sel = sel || window.getSelection()
    let pos = sel.focusOffset
    let node = sel.focusNode

    if (!node || !node.parentElement) { return false}
    let span = node.parentElement
    let line = span.parentElement
    let done = false

    if (span.tagName == 'SPAN') {
        let blank = document.createTextNode(' ')

        if (pos==0) { // at the beginning of span, insert a blank before this span
            line.insertBefore(blank, span)
            done = true
        } else if (pos==node.data.length) { // at the end of span, insert a blank after this span
            if (span.nextSibling) {
                line.insertBefore(blank, span.nextSibling)
                done = true
            } else { // doesn't make sence to add separator at the end of the line
                //parent.appendChild(blankNode) 
            }
        } else { // in the middle of span, break the text to a new span and 
            let text = node.data
            let newspan = span.cloneNode()
            newspan.innerText = text.substring(pos)
            span.innerText = text.substring(0, pos)

            line.insertAfter(blank, span)
            line.insertAfter(newspan, blank)
            done = true
        }

        if (done) { // set the cursor after the blank just inserted
            setCursorInTextNode(blank, 1)
        }
    }
    
    return done
}

function breakLine(sel) {
    sel = sel || window.getSelection()
    let pos = sel.focusOffset
    let node = sel.focusNode
    
    if (!node || !node.parentElement) { return false}
    let dad = node.parentElement
    let newline = null

    if (atStartOfLine(sel) || atEndOfLine(sel)) {
        return // Don't need to break
    }
    
    if (dad.tagName == 'DIV') { // if the cursor is at a separator (blank), just create a new div for spans following the separator   
        newline = dad.cloneNode() 
        for(let n=line.lastChild; n && n!=node; ) {
            let m = n.previousSibling
            newline.insertAdjacentElement('afterend', n)
            n = m  
        }

        dad.removeChild(node)
        dad.insertAdjacentElement('afterend',newline)
    }

    if (dad.tagName == 'SPAN') { // if the cursor is in a text node, split both span and its parent div
        let line = dad.parentElement
        newline = line.cloneNode()
        let uncle = dad.cloneNode()

        let text = node.data
        uncle.innerText = text.substring(pos)
        dad.innerText = text.substring(0, pos)

        dad.parentElement.insertAdjacentElement('afterend', newline)
        if (uncle.innerText && uncle.innerText != '') {
            newline.appendChild(uncle)
        }

        for(let n=dad.nextSibling; n; ) {
            let m = n.nextSibling
            newline.appendChild(n)
            n = m           
        }

 
    }

    if (newline) { // set the cursor at the beginning of the new line
        setCursorInTextNode(newline.firstChild.firstChild, 0)
    }
}

function combineLines(sel) {
    sel = sel || window.getSelection()
    let pos = sel.focusOffset
    let node = sel.focusNode

    let line = null

    if (node.parentElement.tagName == 'DIV') { 
        line = node.parentElement
    }

    if (node.parentElement.tagName == 'SPAN') {
        line = node.parentElement.parentElement
    }

    let spans = []
    let prevLine = line.previousSibling
    if (prevLine) {
        for (let s of line.childNodes) {
            spans.push(s)
        }
        for (let s of spans) {
            prevLine.appendChild(s)
        }

        line.parentElement.removeChild(line)
        setCursorInTextNode(node, 0)
    }

    
}

function findCorpusSpans(node) {
    // check the corpus and key
    let key = null
    for (let c of node.classList) {
        if (c.match(/c[0-9]{5,}/)) {
            key = c
        }
    }

    let nodes = []
    if (key) {
        for (let n = node.previousSibling; n; n = node.previousSibling) {
            if (n.classList.contains(key)) {
                nodes.unshift(n)
            } else {
                break // Just find neighbors
            }
        }

        nodes.push(node)

        for (let n = node.nextSibling; n; n = node.nextSibling) {
            if (n.classList.contains(key)) {
                nodes.push(n)
            } else {
                break // Just find neighbors
            }
        }
    } else {
        nodes.push(node)
    }

    return nodes
}

/** node should be a text node containing separator, which is child of line div */
function findSpanFromSeparator(node, forward) {
    forward = forward || true
    let nodes = []

    if (node.nodeType == Node.TEXT_NODE) {
        node = forward ? node.nextSibling : node.previousSibling

        let key = null
        for (let c of node.classList) {
            if (c.match(/c[0-9]{5,}/)) {
                key = c
            }
        }

        if (forward) {
            for(let n = node; n; n = forward ? n.nextSibling : n.previousSibling) {
                if (n.classList.contains(key)) {
                    nodes.push(n)
                } else {
                    break // Just find neighbors
                }
            }
        } 
    }

    return nodes
}

function toggleCorpusSpan(node, type) { // type: f for fragment corpus and r for reserved corpus
    if (node instanceof Element && typeof type == 'string') {
        if (node.tagName != 'SPAN') {return false}

        if (node.classList.contains(type)) {
            node.classList.remove(type) 
            node.classList.forEach((d)=>{
                if (d.match(/c[0-9]{5,}/)) {
                    node.classList.remove(d)
                }
            })   
        } else {
            let counter_type = type=='f' ? 'r' : 'f' 
            let id=Math.floor(Math.random()*90000+10000)

            if (node.classList.contains(counter_type)) { // override other type of corpus before adding new one
                node.classList.remove(counter_type) 
                node.classList.forEach((d)=>{
                    if (d.match(/c[0-9]{5,}/)) {
                        node.classList.remove(d)
                    }
                })   
            }

            node.classList.add(type, id)
        }
    }
}

/** return its type if the node is a corpus or return false */
function corpusType(node) {
    if (node instanceof Element) {
        if (node.tagName != 'SPAN') {return false}

        let key = null
        for (let c of node.classList) {
            if (c.match(/c[0-9]{5,}/)) {
                key = c
            }
        } 
        
        if (key) {
            if (node.classList.contains('f')) {return 'f'}
            if (node.classList.contains('r')) {return 'r'}
        }  
    }

    return false
}

function getSelectedSpanInOrder(sel) {
    sel = sel || window.getSelection()
    
    let result = { "spans":[], "startOffset":null, "endOffset":null }
    let fromNode=sel.baseNode
    let toNode=sel.focusNode

    if (fromNode.parentElement.tagName == 'SPAN') {
        fromNode=sel.baseNode.parentElement
        toNode=sel.focusNode.parentElement
    }

    let nodes = []
    let found = false
    for (let n = fromNode; n; n=n.nextSibling) {
        nodes.push(n)

        if (n == toNode) {
            found = true
            break;
        }
    }

    if (found) {
        result.startOffset = sel.baseOffset
        result.endOffset = sel.focusOffset

        // the right most span is selected at pos 0, it's not really selected, remove it
        if (sel.focusOffset == 0 || nodes[nodes.length-1].nodeType == Node.TEXT_NODE) {
            nodes.pop()
            result.endOffset = nodes[nodes.length-1].innerText.length
        }
        // same for the left most one
        if (sel.baseOffset == fromNode.innerText.length || nodes[0].nodeType == Node.TEXT_NODE) {
            nodes.shift()
            result.startOffset = 0
        }

        result.spans = nodes
        return result
    } 
     // search reversely
    nodes = []

    for (let n = fromNode; n; n=n.previousSibling) {
        if (n.tagName == 'SPAN') {
            nodes.unshift(n)

            if (n == toNode) {
                found = true
                break;
            }

        }
    }

    if (found) {
        result.startOffset = sel.focusOffset
        result.endOffset = sel.baseOffset

        // the right most span is selected at pos 0, it's not really selected, remove it
        if (sel.baseOffset == 0) {
            nodes.pop()
            result.endOffset = nodes[nodes.length-1].innerText.length
        }
        // same for the left most one
        if (sel.focusOffset == toNode.innerText.length) {
            nodes.shift()
            result.startOffset = 0
        }
        
        result.spans = nodes
        return result
    } else {
        return result
    }
    
}

/**  */
function toggleCorpus(type, sel) { // type: f for fragment corpus and r for reserved corpus
    sel = sel || window.getSelection()
    let fromNode=sel.baseNode
    let toNdoe=sel.focusNode
    let nodes = []

    if (sel.isCollapsed) {
        if (toNode.parentElement.tagName == 'DIV') {
            if (sel.focusOffset == 0) {
                nodes = findSpanFromSeparator(toNdoe, false)
            } else if (sel.focusOffset == toNdoe.data.length) {
                nodes = findSpanFromSeparator(toNdoe, true)
            }
        } else if (toNode.parentElement.tagName == 'SPAN') {
            nodes = findCorpusSpans(toNdoe.parentElement)
        }  

        for (let n of nodes) {
            toggleCorpusSpan(toNode.parentElement, type)
        }

        return

    } 

    // handle range selection    
    let result = getSelectedSpanInOrder(sel)
    nodes = result.spans

    if (nodes.length == 0) {return}

    if (nodes.length == 1) {
        let node = nodes[0]

        // if this span is already set as a corpus, give an error and do nothing
        if (corpusType(node)) {
            return
        }

        // find corrent order for baseOffset and focusOffset
        let start = result.startOffset
        let end = result.endOffset

        // split one span into three and set the middle one as a corpus
        let left = node.cloneNode()
        let right = node.cloneNode()
        
        left.innerText = left.innerText.substring(0,start)
        node.innerText = node.innerText.substring(start,end)
        right.innerText = right.innerText.substring(end)

        if ()
        node.insertAdjacentElement('beforebegin', left)
        node.insertAdjacentElement('afterend', right)

        toggleCorpusSpan(node, type) // use toggle to set since it's intact
        
        return
    }

    if (nodes.length > 1) {
        // check if all nodes involved are not set as corpus before, if true, give an error and do nothing
        for(let n of nodes) {
            if (corpusType(n)) {
                return
            }
        }

        // check if focusNode is the right most or left most
        let start = (nodes[0] == sel.baseNode) ? sel.baseOffset : sel.focusOffset
        let end = (nodes[0] == sel.baseNode) ? sel.focusOffset : sel.baseOffset

        // split the first and last one and set the spans exclusive between as corpus
        let left = nodes[0].cloneNode()
        let right = nodes[nodes.length-1].cloneNode()
        
        left.innerText = left.innerText.substring(0,start)
        nodes[0].innerText = nodes[0].innerText.substring(start)
        nodes[nodes.length-1].innerText = nodes[nodes.length-1].innerText.substring(0, end)
        right.innerText = right.innerText.substring(end)

        nodes[0].insertAdjacentElement('beforebegin', left)
        nodes[nodes.length-1].insertAdjacentElement('afterend', right)

        for (let n of nodes) {
            toggleCorpusSpan(n, type)
        }

        return
    }
}
