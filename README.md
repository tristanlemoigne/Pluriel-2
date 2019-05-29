# Pluriel

## Install Heroku
Windows :
```
https://cli-assets.heroku.com/heroku-x64.exe
```

MacOS : 
```
brew install heroku
```

## Install dependencies
```
npm install
```

## Running local dev version
http://localhost:8080/
```
npm run client
npm run server
```

## Running local production version
http://localhost:5000/
```
heroku local
```

## Deploying to Heroku
https://pluriel.herokuapp.com/
```
git add .
git commit -m "change"
git push origin master
git push heroku master
heroku open
```

## Socket.js
`socket.js` file in `/client/src/`
```
import io from "socket.io-client"

// DEV
// const ip = "10.137.26.135"
// export default io("http://" + ip + ":3000/")

// PROD
const ip = "pluriel.herokuapp.com"
export default io("https://" + ip)
```
