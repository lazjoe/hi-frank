class NodeWrapper {
    constructor(node) {
        if (node instanceof Node) {
            this.node = node
        }
        else {
            this.node = document.createElement('div')
            if (typeof node == 'string') { // TODO: Validate if it's compliant with HTML syntax
                this.node.innerHTML = node
            }
        } 

        this.node.wrapper = this
    }

    addChild(Type, child) {
        if (child instanceof Type) {
            this.node.appendChild(child.node)
        }
        else {
            if (typeof child == 'string') { // TODO: Validate if it's compliant with HTML syntax
                child = new Type(child)
                this.node.appendChild(child.node)
            }
        } 

        return child
    }   

    /** Delegate the events operations (add/remove) to internal DOM components */
    addEventListener(type, callback, useCapture) {
        type = type || ''
        useCapture = useCapture || false

        if (callback instanceof Function) {
            this.node.addEventListener(type, callback, useCapture)
        }
    }

    removeEventListener(type, callback) {
        type = type || ''

        if (callback instanceof Function) {
            this.node.removeEventListener(type, callback) 
        }
    }
}

class SentenceItem extends NodeWrapper {
    constructor(node, type) {
        super(node)
        this.node.classList.add(type)

        this.dirty = false
    }

}

class Sentence extends NodeWrapper {
    constructor(node) {
        super(node)
        this.node.classList.add('s')

        /** string in form of html representing original sentence */
        this.items = {'origin': new SentenceItem(null,'origin'),
                      'source': new SentenceItem(null,'source'),
                      'target': new SentenceItem(null,'target'),
                      'mt_res': new SentenceItem(null,'mt_res'),
                      'result': new SentenceItem(null,'result')}        
    }

    setItem(item, type) {
        if (item instanceof SentenceItem) {
            this.node.repacleChild(item.node, this.items[type].node)
        } else {
            if (typeof item == 'string') { // TODO: Validate if it's compliant with HTML syntax
                item = new SentenceItem(item, type)
                this.node.appendChild(item.node)
            }
        } 
        this.items[type] = item

        return item
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
    }

    addSentence(sentence) {
        return this.addChild(Sentence, sentence)
    }

    addSentenceWithOrigin(origin) {
        let sentence = new Sentence()
        //let orgin = new SentenceItem()
        sentence.setItem(origin, 'origin')
        return this.addSentence(sentence)
    }
}

class Article extends NodeWrapper{
    constructor (node) {
        super(node)
        this.node.classList.add('a')

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



}

exports.Sentence = Sentence
exports.Paragraph = Paragraph
exports.Article = Article