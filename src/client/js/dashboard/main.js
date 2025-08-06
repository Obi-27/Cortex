import splitterHandler from "../pageSplitter"
import textAreaHandler from "../textArea"
import fileManagerHandler from "../fileManager"

class eventHandler {
    constructor () {
        this.pageSplitter = new splitterHandler()
        this.textArea = new textAreaHandler()
        this.fileManager = new fileManagerHandler(this.textArea)
        
    }
}

let handler = new eventHandler()