import SplitterHandler from './pageSplitter.js'
import TextAreaHandler from './textArea.js'
import FileManagerHandler from './fileManager.js'
import NavbarHandler from './navbar.js'
import { getAccessToken } from '../auth.js'

const serverAddress = 'http://127.0.0.1'
const serverPort = '3000'

class EventHandler {
  constructor () {
    this.connectedCallback()
    this.pageSplitter = new SplitterHandler()
    this.textArea = new TextAreaHandler()
    this.fileManager = new FileManagerHandler(this.textArea)
    this.navbar = new NavbarHandler()
  }

  async connectedCallback () {
    window.addEventListener('load', async () => {
      const token = await getAccessToken()
      if (token === null) {
        window.location.replace(`${serverAddress}:${serverPort}`)
      }
    })
  }
}

function initializeHandler () {
  const eventHandler = new EventHandler()
  return eventHandler
}

initializeHandler()
