let serverAddress = "http://127.0.0.1"
let serverPort = "3000"

import axios from "axios"

let accessToken = null

export async function getAccessToken() {
    if(!accessToken || accessToken === null) {
        try {
            const response = await axios.post(`${serverAddress}:${serverPort}/users/refresh`)
            accessToken = response.data.accessToken
        } catch (error) {
            accessToken = null
        }
    } 
    return accessToken
}

export async function login(userEmail, userPassword) {
    const body = {
        email: userEmail,
        password: userPassword
    }
    const response = await axios.post(`${serverAddress}:${serverPort}/users/login`, body)
    .catch(error => {
        console.error(error)
        return
    })

    //load dashboard on succesful login
    if(response.status == 200) {
        window.location.href = `${serverAddress}:${serverPort}/dashboard` 
    }
}


export async function logout() {
    const response = await axios.delete(`${serverAddress}:${serverPort}/users/logout`)
    accessToken = null
    console.log(response)
    return
}