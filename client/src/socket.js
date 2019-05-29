import io from "socket.io-client"
const port = process.env.PORT || 5000

var env = process.env.NODE_ENV;
console.log("poort", port, process, env)

// DEV
// const ip = "10.137.26.135"
// export default io("http://" + ip + ":3000/")

// PROD
const ip = "pluriel.herokuapp.com"
export default io("https://" + ip)