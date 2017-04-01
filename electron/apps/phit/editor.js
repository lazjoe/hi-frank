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

exports.Editor = Editor