import io from "socket.io-client"
let url

if(process.env.NODE_ENV === "development"){
    // DEV
    url = require("./envIp.js")
} else {
    // PROD
    url = "https://pluriel.herokuapp.com"
}

export default io(url)