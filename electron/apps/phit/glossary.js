const fs1 = require('fs')

class GlossaryManager {

    constructor (args) {
       // this.
    }

    loadLocalFile(path) {
        fs1.readFile(path, function (error, data) {
            if (error) {
                console.log(error)
                return false
            }

            // data.utf8Slice('\n').forEach(function (entry) {

            // })
        })
    }
}

// Classes

// class GlossaryManager {
//     constructor (args) {
//         this.localLibraryPath = args.localLibraryPath // || TODO: get the system documents folder
//         this.remoteLibraryPath = args.remoteLibraryPath // || TODO: get the glossary service
//     }
// }
