import io from "socket.io-client"
let url

if(process.env.NODE_ENV === "development"){
    // DEV
    url = "http://192.168.1.14:5000/"
} else {
    // PROD
    url = "https://pluriel.herokuapp.com"
}

export default io(url)