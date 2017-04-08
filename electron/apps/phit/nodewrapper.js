class NodeWrapper {
    constructor(node) {
        if (node instanceof Node) {
            this.node = node
        }
        else {
            this.node = document.createElement('div')
            if (typeof node == 'string') { // TODO: Validate if it's compliant with HTML syntax
                this.node.innerHTML = node
            } else if (!node) {
                this.node.innerHTML = ''
            }
        } 

        this.node.wrapper = this
    }

    addClass(className) {
        this.node.classList.add(className)
    }

    setClass(className) {
        this.node.className = className
    }

    hasClass(className) {
        return this.node.classList.contains(className)
    }

    set id(ID) {
        this.node.id = ID
    }

    get id() {
        return this.node.id
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

exports.NodeWrapper = NodeWrapper