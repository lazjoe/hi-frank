const { NodeWrapper } = require('./nodewrapper')

class SentenceItem extends NodeWrapper {
    constructor(type, node) {
        super(node)

        if (this.hasClass(type)) {
            
        } else {
            this.setClass(type)
        }
        this.addClass('sentence-item')
        //this.node.classList.add(type)

        this.dirty = false
    }

    get hasContent() {
        return this.node.innerHTML && this.node.innerHTML.trim() != ''
    }

    get content() {
        return this.node.innerHTML
    }

    set content(val) {
        this.node.innerHTML = val
    }
}

class Sentence extends NodeWrapper {
    constructor(node) {
        super(node)
        this.addClass('s')

//        if (this.hasClass('s')) {
            let origin = this.node.querySelector('.origin')
            let source = this.node.querySelector('.source')
            let target = this.node.querySelector('.target')
            let mt_res = this.node.querySelector('.mt_res')
            let result = this.node.querySelector('.result')

            this.items = {'origin': new SentenceItem('origin', origin),
                          'source': new SentenceItem('source', source),
                          'target': new SentenceItem('target', target),
                          'mt_res': new SentenceItem('mt_res', mt_res),
                          'result': new SentenceItem('result', result)}            
        // } else {
        //     this.setClass('s')

        //     /** string in form of html representing original sentence */
        //     this.items = {'origin': new SentenceItem('origin'),
        //                 'source': new SentenceItem('source'),
        //                 'target': new SentenceItem('target'),
        //                 'mt_res': new SentenceItem('mt_res'),
        //                 'result': new SentenceItem('result')}    

            this.node.appendChild(this.items['origin'].node)
            this.node.appendChild(this.items['source'].node)
            this.node.appendChild(this.items['target'].node)
            this.node.appendChild(this.items['mt_res'].node)
            this.node.appendChild(this.items['result'].node)     
        // }
        
     }

    // To maintain the order of these items, they cannot be created or appended
    setItem(type, item) {
        if (item instanceof SentenceItem) {
            this.node.repacleChild(item.node, this.items[type].node)
            this.items[type] = item
        } else {
            if (!item || typeof item == 'string') { // TODO: Validate if it's compliant with HTML syntax
                let innerHTML = item || ''
                if (this.items[type] instanceof SentenceItem) {
                    item = this.items[type]
                    item.content = innerHTML                 
                } else { // Shouldn't run into here except initialization
                    console.error(`Cannot set the sentence item for type ${type} with content ${innerHTML}`)
                }
            }
        } 

        //if (this.items) { // when initializating, it's null when setItem is called in constructor
        
        //}  

        return item
    }  

    reset() {
            /** string in form of html representing original sentence */
            //this.setItem('origin')
            this.setItem('source')
            this.setItem('target')
            this.setItem('mt_res')
            this.setItem('result')
    }

    get origin() {
        return this.items.origin // ? this.items.origin : this.setItem('origin')
    }

    get source() {
        return this.items.source // ? this.items.source : this.setItem('source')
    }

    get target() {
        return this.items.target // ? this.items.target : this.setItem('target')
    }

    get mt_res() {
        return this.items.mt_res // ? this.items.mt_res : this.setItem('mt_res')
    }

    get result() {
        return this.items.result // ? this.items.result : this.setItem('result')
    }

    set origin(val) {
        this.setItem('origin', val)
    }

    set source(val) {
        this.setItem('source', val)
    }

    set target(val) {
        this.setItem('target', val)
    }

    set mt_res(val) {
        this.setItem('mt_res', val)
    }

    set result(val) {
        this.setItem('result', val)
    }

    get dirty() {
        return (this.items.origin && this.items.origin.dirty)
            || (this.items.source && this.items.source.dirty)
            || (this.items.target && this.items.target.dirty)
            || (this.items.ms_res && this.items.ms_res.dirty)
            || (this.items.result && this.items.result.dirty)
    }
}

class Paragraph extends NodeWrapper {
    constructor(node) {
        super(node)
        this.node.classList.add('p')

//        if (node instanceof Element) { // bind its children as well
            for (let n of this.node.childNodes) {
                new Sentence(n) // call wrapper's constructor to bind it to node
            }
//        }
    }

    addSentence(sentence) {
        return this.addChild(Sentence, sentence)
    }

    addSentenceWithOrigin(origin) {
        let sentence = new Sentence()
        //let orgin = new SentenceItem()
        sentence.origin = origin
        return this.addSentence(sentence)
    }
}

class Article extends NodeWrapper{
    constructor (node) {
        super(node)
        this.addClass('a')

//        if (node instanceof Element) { // bind its children as well
            for (let n of this.node.childNodes) {
                new Paragraph(n) // call wrapper's constructor to bind it to node
            }
//        }

        this.currentSentence = null
    }

    /** add a paragraph, pass either a node or its innerHTML */
    addParagraph(paragraph) {
       return this.addChild(Paragraph, paragraph)
    }

    setCurrentSentence(sentence) {
        if (!sentence || sentence instanceof Sentence) { // null or undefined can be passed to reset as unselected state
            console.log('current item is switching: ', this.currentSentence, sentence)
            // dispatch events before switching item
            var switchEvent = new CustomEvent('switch')
            switchEvent.from = this.currentSentence
            switchEvent.to = sentence

            this.node.dispatchEvent(switchEvent)

            this.currentSentence = sentence 

            return sentence
        }

        return false
    }

    get nextSentence() {
        let nextNode = this.currentSentence.node.nextSibling
        
        if (nextNode) {
            return nextNode.wrapper
        } 
        
        nextNode = this.currentSentence.node.parentNode.nextSibling.firstChild
        
        if (nextNode) {
            return nextNode.wrapper
        } 

        return null
    }

    get previousSentence() {
        let previousNode = this.currentSentence.node.previousSibling
        
        if (previousNode) {
            return previousNode.wrapper
        } 
        
        previousNode = this.currentSentence.node.parentNode.previousSibling.firstChild
        
        if (previousNode) {
            return previousNode.wrapper
        } 

        return null
    }
}

exports.Sentence = Sentence
exports.Paragraph = Paragraph
exports.Article = Article