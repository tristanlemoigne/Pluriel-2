import io from "socket.io-client"
let ip

if(process.env.NODE_ENV === "development"){
    // DEV
    ip = "192.168.1.14:5000/"
} else {
    // PROD
    ip = "pluriel.herokuapp.com"
}

export default io("http://" + ip)