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
Si ça marche pas, test : 
```
brew install heroku/brew/heroku
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
## Add heroku remote
```
heroku git:remote -a pluriel
```
And then login to your heroku account 

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
! DON'T FORGET TO CHANGE YOUR IP IN DEV MODE ! 
```
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
```