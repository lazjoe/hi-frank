let CorpusType = {
    "FRAGMENT": 'f',
    "RESERVED": 'r'
}

class Corpus {
    constructor() {
        this.target
        this.sourceLang = 'zh'
        this.targetLang = 'en'
        this.placeholder
        this.key
        this.translator

        this.sourceNodes = []
        this.targetNodes = [] // only one node should be assigned. list kept here for further compability
    }
    
    addSpan(span) {
        if (span instanceof Element && span.tagName == 'SPAN') {
            this.sourceNodes.push(span)
        }
    }

    get source() {
        let text = ''
        for (let n of this.sourceNodes) {
            if (n instanceof Element) {
                text += n.innerText
            } else if (typeof n == 'string') {
                text += n
            }
        }
        return text
    }

    clone() {
        let c = new Corpus()
        c.sourceNodes = this.sourceNodes
        c.sourceLang = this.sourceLang
        c.targetLang = this.targetLang
        c.placeholder = this.placeholder
        c.key = this.key
        c.translator = this.translator
    }

    targetDOM() {
        if (this.targetNodes.length > 0) {
            return this.targetNodes[0] // assume only one target node
        }
        // assume all spans in source nodes share same attributes. 
        // i.e. only the format of first node will be reserved
        let node = this.sourceNodes[0].cloneNode() 
        node.innerText = this.target
        node.corpus = this

        this.targetNodes.push(node)
        return this.targetNodes[0]
    }
}

class Frame extends Corpus {
    constructor() {
        super()
    }

    addPlaceholder(placeholder) {
        if (typeof placeholder == 'string') {
            this.sourceNodes.push(placeholder)
        }        
    }
    
}

class Line {
    constructor() {
        this.frame = null
        this.corpusList = []
    }

    generatetargetDOM() {
        let div = document.createElement('div')
        div.classList.add('l')

        if (this.frame) { 
            let regex = /(P[0-9]{4,})/
            let fragments = this.frame.split(regex)

            for (let fragment of fragments) {
                if (fragment == '') { continue }

                if (fragment.match(regex)) { // if it's placeholder, find the corpuses associated to it
                    for (let c of this.corpusList) {
                        if (c.placeholder == fragment) {
                            div.appendChild(c.targetDOM())
                        }
                    }
                } else { // if it's text fragment in frame
                    let f = document.createElement('span')
                    f.innerText = fragment
                    div.appendChild(f)
                }
            }
        } else { // no frame, combine all corpus in the list
            for (let c of this.corpusList) {
                div.appendChild(c.targetDOM())
            }            
        }
        
        return div
    }

    generateHTML() {
        let html = this.frame.target
        let regex = /P[0-9]{4,}/g

        if (this.frame && this.frame.target) {
            let placeholders = this.frame.target.match(regex)
            if (placeholders) {
                for (let p of placeholders) {
                    let h = ''
                    for (let c of this.corpusList) {
                        if (c.placeholder == p) {
                            h += ' ' + c.targetDOM().outerHTML
                        }
                    }      
                    html = html.replace(p, h)
                }
            } 
        } else {
            for (let c of this.corpusList) {
                html += ' ' + c.targetDOM().outerHTML
            }     
        }

        return `<div class='l'>${html}</div>`
    }
}

function placeholder() {
    return 'P' + Math.floor(Math.random()*9000+1000)
}

exports.CorpusType = CorpusType
exports.Corpus = Corpus
exports.Frame = Frame
exports.Line = Line
exports.placeholder = placeholder


