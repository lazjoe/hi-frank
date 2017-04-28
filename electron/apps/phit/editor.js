const { NodeWrapper } = require('./nodewrapper')

class Editor extends NodeWrapper {
    constructor(args) {
        var args = args || {}

        super(args.container)
        this.addClass('editor')
        //this.id = args.id || 'editor' + Math.floor(Math.random()*10000+1000)
        this.title = args.title || 'EDITOR'
        this.editable = args.editable || true

        this.header = document.createElement('div')
        this.header.setAttribute('class', 'editor-header')
        this.header.innerText = this.title

        this._content = document.createElement('div')
        this._content.setAttribute('class', 'editor-content')
        this._content.setAttribute('contenteditable', this.editable)
        this._content.container = this

        this.node.appendChild(this.header)
        this.node.appendChild(this._content)
    
    }

    set content(content) {
        this._content.innerHTML = content
        this.changed()
        return this._content.innerHTML // innerHTML is not necessarily equal to content because browser will check and make it compliant to syntax
    }

    get content() {
        return this._content.innerHTML
    }

    /** fire submit event */
    submit() {
        var event = new CustomEvent('submit')
        event.contentNode = this._content
        this.node.dispatchEvent(event)
    }

    /** fire content change event */
    changed() {
        var event = new CustomEvent('change')
        event.contentNode = this._content
        this.node.dispatchEvent(event)
    }

    search(keyword) {
        var event = new CustomEvent('search')
        keyword = keyword || window.getSelection().toString()
        event.keyword = keyword
        this.node.dispatchEvent(event)        
    }

    focus() {
        this._content.focus()
    }
}

exports.Editor = Editor