let serverAddress = "http://127.0.0.1"
let serverPort = "3000"

import axios from "axios"

export async function getAllFiles() {
    const response = await axios.get(`${serverAddress}:${serverPort}/readAllFiles`)
    return response.data
}


export async function getNote(filePath) {
    const response = await axios.get(`${serverAddress}:${serverPort}/notes/readNote/${filePath}`)
    return response.data
}


export async function saveNote(filePath, content) {
    const body  = {fileContent : content}
    const response = await axios.put(`${serverAddress}:${serverPort}/notes/updateNote/${filePath}`, body)
    return response
}


export async function createNote(filePath) {
    const response = await axios.post(`${serverAddress}:${serverPort}/notes/createNote/${filePath}`)
    return response
}


export async function deleteNote(filePath) {
    const response = await axios.delete(`${serverAddress}:${serverPort}/notes/deleteNote/${filePath}`)
    return response
}

export async function renameNote(filePath, name) {
    const body = {newName: name}
    const response = await axios.put(`${serverAddress}:${serverPort}/notes/renameNote/${filePath}`, body)
    return response
}



export async function createFolder(folderPath) {
    const response = await axios.post(`${serverAddress}:${serverPort}/folders/createFolder/${folderPath}`)
    return response
}

export async function deleteFolder(folderPath) {
    const response = await axios.delete(`${serverAddress}:${serverPort}/folders/deleteFolder/${folderPath}`)
    return response
}