const express = require('express');
const app = express();
const cors = require ('cors')
const mongoose = require('mongoose');


// Database
mongoose.connect('mongodb+srv://clement:openclassroom@cluster0.eqsutdp.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

  const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true }
})

const User = mongoose.model("User", userSchema)


// Middleware
app.use(cors())
app.use(express.json())


// Routes
app.post("/api/auth/signup", (req, res) => {
    console.log("Signup request:", req.body)
    const email = req.body.email
    const password = req.body.password
    const user = new User ({ email: email, password: password})
user.save()
.then((res) => console.log("User enregistré !" ,res))
.catch((err) => console.log("User pas enregistré", err)) 
   
   res.send({ message: "Utilisateur enregistré !" })
})


module.exports = app

