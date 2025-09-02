import axios from 'axios'

const serverAddress = process.env.VITE_SERVER_ADDRESS
const serverPort = process.env.VITE_SERVER_PORT

export let accessToken = null

export async function getAccessToken () {
  if (!accessToken || accessToken === null) {
    try {
      const response = await axios.post(`${serverAddress}:${serverPort}/users/refresh`)
      accessToken = response.data.accessToken
    } catch (error) {
      accessToken = null
    }
  }
  return accessToken
}

export async function login (userEmail, userPassword) {
  const body = {
    email: userEmail,
    password: userPassword
  }

  const response = await axios.post(`${serverAddress}:${serverPort}/users/login`, body).catch(error => {
    console.error(error)
  })

  // load dashboard on succesful login
  if (response.status === 200) {
    window.location.href = `${serverAddress}:${serverPort}/dashboard`
  }
}

export async function logout () {
  localStorage.clear()
  await axios.delete(`${serverAddress}:${serverPort}/users/logout`)
  accessToken = null
}

export async function register (userEmail, userPassword, username) {
  const body = {
    email: userEmail,
    password: userPassword,
    username: username
  }

  try{
    const response = await axios.post(`${serverAddress}:${serverPort}/users/register`, body)

    if (response.status === 200) {
      window.location.href = `${serverAddress}:${serverPort}/dashboard`
    }
  } catch (error) {
    console.error(error)
  }
}
