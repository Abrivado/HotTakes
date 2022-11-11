const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({  // définition du schema qui contiendra les champs qui seront nécessaires à la création du produit
    userId: String,
    name: String,
    manufacturer : String,
    description : String,
    mainPepper : String,
    imageUrl: String,
    heat : Number,
    likes : Number,
    dislikes : Number,
    usersLiked : [String],
    usersDisliked : [String],

})

const Product = mongoose.model("Product", productSchema) // le .model sert à utiliser le schema créer précédemment

module.exports = {mongoose, Product}