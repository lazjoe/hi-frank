const {Editor} = require('./editor')
const np = require('./nodeplus')
const {CorpusType} = require('./corpus')

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

        this.setupKeyboard()
    }

    trimLines() {
        this.node.querySelectorAll('div.l').forEach( (l) => {

            if (!l.childNodes || !l.childNodes.length) {return}

            for (let n=l.firstChild; n; ) {
                if ((n.innerText && n.innerText.trim() == '') 
                || (n.data && n.data.trim() == '')) {
                    let m = n
                    n = n.nextSibling
                    l.removeChild(m)
                } else {
                    break
                }
            }
        })
    }

    setupKeyboard() {
        function keydownHandler (e) {
            let sel = document.getSelection()
            
            switch(e.which) {
                case 32: // whitespace
                    if (sel.isCollapsed) {
                        //np.breakSpan(sel)

                        // if (pos < text.length-1 && text[pos].trim() == '') {
                        //     return
                        // } else {
                        //     break
                        // }
                    } else {
                        break
                    }
                break;

                case 8: // backspace
                    if (sel.isCollapsed) {
                        // if (sel.focusOffset > 0 && np.myDadIsDiv(sel)) {
                        //     return
                        // }
                        if (np.atStartOfLine(sel)) {
                            np.combineLines()
                        }
                    } else {

                    }
                break;

                case 13: // enter
                    if (e.ctrlKey || e.metaKey) {
                        e.target.container.submit()
                    } else if (!e.altKey && !e.shiftKey) {
                        np.breakLine(sel)
                    }

                break;

                case 70: // F
                    if (e.metaKey || e.ctrlKey || e.altKey) {return}
    
                    np.toggleCorpus(CorpusType.FRAGMENT, sel)   
                break;

                 // keep default behavior for these keys
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

        this._content.addEventListener('keydown', keydownHandler)
        this._content.addEventListener('keyup', ()=>{
            //this.trimLines()
        })
    }
    
}

exports.AnnotatedSource = AnnotatedSource