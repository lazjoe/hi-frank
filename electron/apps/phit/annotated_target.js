const {Editor} = require('./editor')
const np = require('./nodeplus')

class AnnotatedTarget extends Editor {
    constructor(args) {
        args.id = args.id || 'annotated-target'
        args.title = args.title || 'ANNOTATED TARGET'
        super(args)

        this.reset()

        this.setupKeyboard()
    }

    reset() {
        this.content = ''
        this.currentLines = null
        this.linesList = []
        this.extraCorpusList = []       
    }

    setupKeyboard() {
        function keydownHandler (e) {
            let sel = document.getSelection()
            
            switch(e.which) {
                case 13:
                break;

                 // keep default behavior for these keys
                default: 
                    return
            }

            e.preventDefault(); // prevent the default action (scroll / move caret)
        }

        this._content.addEventListener('keydown', keydownHandler)
        this._content.addEventListener('keyup', ()=>{
            //this.trimLines()
        })
    }

    // the lines as the current items for editting and display it in Annotated Target
    setLines(lines) {
        this.currentLines = lines
        
        this.content = ''
        for (let line of lines) {
            this.content += line.generateHTML()
        }
    }

    // cache the lines fed to the Annotated Target and decide which one to display
    // currently the first reuslt will be displayed.
    feedLines(lines) {
        this.linesList.push(lines)
        if (!this.currentLines) {
            this.setLines(lines)
        }
    }   

    // cache the individual corpus results
    feedExtraCorpus(Corpus) {

    } 
}

class MachineTranslation extends AnnotatedTarget {
    constructor(args) {
        args.id = args.id || 'machine-translation'
        args.title = args.title || 'MACHINE TRANSLATION'
        super(args)
    }
}



exports.MachineTranslation = MachineTranslation
exports.AnnotatedTarget= AnnotatedTarget