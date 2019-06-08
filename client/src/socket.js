import io from "socket.io-client"

// DEV
// const ip = "192.168.1.14"
// export default io("http://" + ip + ":5000/")

// PROD
const ip = "pluriel.herokuapp.com"
export default io("https://" + ip)