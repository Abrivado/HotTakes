const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')  // permet de check la base de donnée puis d'envoyer dans la console quand y'a un pb de connexion


const userSchema = new mongoose.Schema({                   // définition du schema qui contiendra les champs qui seront nécessaires à la connexion
    email: { type: String, required: true, unique: true },  // unique afin qu'une adresse mail ne puisse pas etre utilisée par plusieurs users
    password: { type: String, required: true }
})


userSchema.plugin(uniqueValidator)

const User = mongoose.model("User", userSchema) // le .model sert à utiliser le schema créer précédemment

module.exports = {mongoose, User}