let serverAddress = "http://127.0.0.1"
let serverPort = "3000"

import axios from "axios"

let accessToken = null

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
