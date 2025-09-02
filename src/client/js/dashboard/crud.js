import axios from 'axios'
import { getAccessToken } from '../auth'

const serverAddress = process.env.SERVER_ADDRESS
const serverPort = process.env.SERVER_PORT

export async function getAllFiles () {
  const accessToken = await getAccessToken()
  const response = await axios.get(`${serverAddress}:${serverPort}/readAllFiles`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  return response.data
}

export async function getNote (filePath) {
  const accessToken = await getAccessToken()
  const response = await axios.get(`${serverAddress}:${serverPort}/notes/readNote/${filePath}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  return response.data
}

export async function saveNote (filePath, content) {
  const accessToken = await getAccessToken()
  const body = { fileContent: content }
  const response = await axios.put(`${serverAddress}:${serverPort}/notes/updateNote/${filePath}`, body, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  return response
}

export async function createNote (filePath) {
  const accessToken = await getAccessToken()
  const response = await axios.post(`${serverAddress}:${serverPort}/notes/createNote/${filePath}`, {}, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  return response
}

export async function deleteNote (filePath) {
  const accessToken = await getAccessToken()
  const response = await axios.delete(`${serverAddress}:${serverPort}/notes/deleteNote/${filePath}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  return response
}

export async function renameNote (filePath, name) {
  const accessToken = await getAccessToken()
  const body = { newName: name }
  const response = await axios.put(`${serverAddress}:${serverPort}/notes/renameNote/${filePath}`, body, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  return response
}

export async function createFolder (folderPath) {
  const accessToken = await getAccessToken()
  const response = await axios.post(`${serverAddress}:${serverPort}/folders/createFolder/${folderPath}`, {}, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  return response
}

export async function deleteFolder (folderPath) {
  const accessToken = await getAccessToken()
  const response = await axios.delete(`${serverAddress}:${serverPort}/folders/deleteFolder/${folderPath}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  return response
}
