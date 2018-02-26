class Context {
    
}

class Identifier {
    constructor (unique_name) {
        this.name = unique_name
        this.alias = []
    }
}

exports.Context = Context
exports.Identifier = Identifier