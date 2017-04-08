const fs = require('fs')
const {Editor} = require('./editor')

class GlossaryManager {

    constructor (args) {
       this.entryTable = {}
    }

    loadLocalFile(path) {
        fs.readFile(path, (error, data) => {
            if (error) {
                console.log(error)
                return false
            }

            data.utf8Slice('\n').split('\n').forEach((entry) => {
                let pair = entry.split('\t')
                if (pair.length == 2) {
                    this.entryTable[pair[0].trim()] = pair[1].trim()
                    console.log(pair[0], ' = ', pair[1])
                } 
            })
        })
    }

    getEntries(context) {
        let matched = []

        for (let entry of Object.keys(this.entryTable)) {
            if (context.match(entry)) {
                matched.push(entry + ' = ' + this.entryTable[entry])
            }
        }

        return matched
    }
}

class Glossary extends Editor {
    constructor(args) {
        args.id = args.id || 'glossary'
        args.title = args.title || 'GLOSSARY'
        super(args)
    }
}

// Classes

// class GlossaryManager {
//     constructor (args) {
//         this.localLibraryPath = args.localLibraryPath // || TODO: get the system documents folder
//         this.remoteLibraryPath = args.remoteLibraryPath // || TODO: get the glossary service
//     }
// }

exports.GlossaryManager = GlossaryManager
exports.Glossary = Glossary