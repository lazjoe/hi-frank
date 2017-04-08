const {Editor} = require('./editor')
const np = require('./nodeplus')

class MachineTranslation extends AnnotatedTarget {
    constructor(args) {
        args.id = args.id || 'machine-translation'
        args.title = args.title || 'MACHINE TRANSLATION'
        super(args)
    }
}



exports.MachineTranslation = MachineTranslation