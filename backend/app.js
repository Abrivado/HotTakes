const express = require('express');
const app = express();
const cors = require ('cors')
const {sauceRouter} = require("./routers/sauces.router")
const {authRouter} = require("./routers/auth.router")



// Connexion to Database
require("./mongo")



// Middleware
app.use(cors())
app.use(express.json())      // pour pouvoir voir le body renvoyé par la site


app.use("/api/sauces", sauceRouter)
app.use("/api/auth", authRouter)


app.use("/images", express.static("images"))


module.exports = app




