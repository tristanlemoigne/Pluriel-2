// Express
const express = require('express')
const app = express()
const http = require('http').Server(app);
const port = process.env.PORT || 5000

// Link socket.io to express
const io = require('socket.io')(http);
const Serveur =  require('./server/Serveur.js')

http.listen(port, function(){
    console.log('listening on *', port);
})

// Get vu.js client build
app.use(express.static("client/dist"))

// Start serveur event listeners
new Serveur(io).init()
