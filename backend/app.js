const express = require('express');
const app = express();
const cors = require ('cors')
const bodyParser = require ("body-parser")
const path = require("path")


// Connexion to Database
require("./mongo")

// Controllers
const {createUser, logUser} = require("./controllers/users")
const {getSauces, createSauce, getSauceById, deleteSauce, modifySauce, likeSauce} = require ("./controllers/sauces")


// Middleware
app.use(cors())
app.use(express.json())

const {upload} = require("./middleware/multer")
const {verifUser} = require ("./middleware/auth")


// Routes
app.post("/api/auth/signup", createUser)
app.post("/api/auth/login", logUser)
app.get("/api/sauces", verifUser, getSauces)
app.post("/api/sauces", verifUser, upload.single("image"), createSauce)
app.get("/api/sauces/:id", verifUser, getSauceById)
app.delete("/api/sauces/:id", verifUser, deleteSauce)
app.put("/api/sauces/:id", verifUser, upload.single("image"),  modifySauce)
app.post("/api/sauces/:id/like", verifUser, likeSauce)




app.use("/images", express.static("images"))



module.exports = app




