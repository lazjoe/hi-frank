class Item {
    constructor(original) {
        original = original || ''
        /** string in form of html representing original sentence */
        this.original = original
        this.originalDirty = false

        this.source = ''
        this.sourceDirty = false

        this.target = ''
        this.targetDirty = false

        this.result = ''
        this.resultDirty = false
    }

    get isDirty() {
        return this.originalDirty || this.sourceDirty || this.targetDirty || this.resultDirty
    }
}

class ItemList {
    constructor () {
        this.items = []
        //this.cur = 0
        this.currentItem = this.items[0]

        this.switchEvent = new CustomEvent('switch')
    }

    addItem(original) {
        let newItem = new Item(original)
        this.items.push(newItem)
        return newItem
    }

    createItemNode(original) {
        if (!original || original.trim() == '') {
            return null
        }

        let id = Math.floor(Math.random()*900000+100000)
        //let div = `<div class='sentence' id='${id}'>${original}</div>`
        let itemNode = document.createElement('div')
        itemNode.setAttribute('class', 's')
        itemNode.setAttribute('id', id)
    
        itemNode.innerHTML = `<div class='original'>${original}</div>`
        itemNode.item = this.addItem(itemNode.outerHTML)
        return itemNode
    }

    setCurrentItem(item) {
        let oldItem = this.currentItem

        if (typeof item == 'String') {
            // item is specified by ID
        } else {
            this.currentItem = item
        }

        console.log('current item is switching: ', oldItem, item)
        // dispatch events for switching item
        
    }
} 

module.exports = new ItemList()



