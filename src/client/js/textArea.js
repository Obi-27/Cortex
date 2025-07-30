import { EditorState } from "@codemirror/state"
import { EditorView, basicSetup } from "codemirror"
import { defaultKeymap } from "@codemirror/commands"
import { keymap } from "@codemirror/view"
import { markdown } from "@codemirror/lang-markdown"
import { lintGutter } from "@codemirror/lint"

import markdownItKatex from 'markdown-it-katex'
import markdownit from 'markdown-it'


import * as crud from './crud.js'


export default class textAreaHandler {
    constructor() {
        this.textPane = document.getElementById('text-editor')

        this.previewPane = document.getElementById('preview-pane')

        this.previewContent = document.getElementById('preview-content')

        this.editorViewBtn = document.getElementById('editor-view-btn')
        this.previewViewBtn = document.getElementById('preview-view-btn')
        this.splitViewBtn = document.getElementById('split-view-btn')

        const fillParent = EditorView.theme({
            "&": {
                height: "100%",
                width: "100%",
            },
            ".cm-scroller": {
                overflow: "auto"
            }
        })

        let updateListenerExtension = EditorView.updateListener.of((update) => {
            if(update.docChanged) {
                console.log('change')
                const content = this.getContent()
                localStorage.setItem(`unsaved:${this.getPath()}`, content)
                const event = new CustomEvent('note-dirty', { detail: { path: this.currentFilePath }})
                window.dispatchEvent(event)
                this.renderMarkdownPreview()
            }
        })

        this.extensions = [
                basicSetup,
                fillParent,
                keymap.of(defaultKeymap),
                markdown(),
                updateListenerExtension,
        ]

        const state = EditorState.create({
            doc: "Hello World!!",
            extensions: [this.extensions]
        })

        this.view = new EditorView({
            state,
            parent: this.textPane
        })  

        this.connectedCallback()
        this.currentFilePath = ''
    }

    connectedCallback() {
        window.addEventListener('keydown', (e) => {
            const isMac = navigator.userAgentData? navigator.userAgentData.platform === 'macOS' : navigator.userAgent.toLowerCase().includes('mac')
            const isSaveCombo = (isMac && e.metaKey && e.key === 's' || !isMac && e.ctrlKey && e.key === 's')

            if(isSaveCombo) {
                e.preventDefault()
                localStorage.removeItem(`unsaved:${this.currentFilePath}`)
                this.saveContent(this.currentFilePath)
                
                const event = new CustomEvent('note-save', {detail: { path: this.currentFilePath }})
                window.dispatchEvent(event)
            }
        })


        this.editorViewBtn.addEventListener('click', () => {
            this.textPane.style.display = 'flex'
            this.previewPane.style.display = 'none'
        })

        this.previewViewBtn.addEventListener('click', () => {
            this.textPane.style.display = 'none'
            this.previewPane.style.display = 'flex'
            this.renderMarkdownPreview()
        })

        this.splitViewBtn.addEventListener('click', () => {
            this.textPane.style.display = 'flex'
            this.previewPane.style.display = 'flex'
            this.renderMarkdownPreview()
        })
    }


    renderMarkdownPreview() {
        const content = this.getContent()
        const md = markdownit().use(markdownItKatex)
        this.previewPane.innerHTML = md.render(content)
    }


    setContent(content, path) { 
        this.currentFilePath = path

        const newState = EditorState.create({
            doc: content,
            extensions: [this.extensions]
        })

        this.view.setState(newState)
        this.renderMarkdownPreview()
    }

    getContent() {
        return this.view.state.doc.toString()
    }

    getPath() {
        return this.currentFilePath
    }

    async saveContent(self) {
        const content = this.getContent()
        const path = this.getPath()
         
        if(path === '' ) {
            alert('No File Selected')
            return
        }

        try {
            const response = await crud.saveNote(path, content)
        } catch(e) {
            console.error(e)
        }
    }

    clearContent() {
        const newState = EditorState.create({
            doc: '',
            extensions: [this.extensions]
        })

        this.view.setState(newState)
        this.renderMarkdownPreview()
    }
}