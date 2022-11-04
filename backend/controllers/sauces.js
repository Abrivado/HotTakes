const mongoose = require("mongoose")
const unlink = require("fs").unlink

const productSchema = new mongoose.Schema({
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

const Product = mongoose.model("Product", productSchema)



function getSauces(req, res){
        Product.find({})
        .then(products => res.send(products))
        .catch(error => res.status(500).send(error))    
}

function getSauceById (req, res){
    const id = req.params.id
     Product.findById(id)
     .then(product => res.send(product))
     .catch(console.error)
}

function deleteSauce (req, res){
    const id = req.params.id
// 1- l'ordre de suppression est envoyé a mongo
    Product.findByIdAndDelete(id)
// 2- supprimer l'img localement
    .then(deleteImage)
// 3- envoyer un message de succes au site
    .then (product => res.send({message : product}))
    .catch(err => res.status(500).send({message: err}))
}


function deleteImage(product){
    const imageUrl = product.imageUrl
    const fileToDelete = imageUrl.split("/").at(-1) // pour recup juste le nom du fichier
    unlink(`images/${fileToDelete}`, (err) => {    // function pour supprimer une image de mon systeme
        console.error("Pb a la suppression de l'image", err)
    })
    return product
}

function modifySauce(req,res){
const {
    params: { id }  
} = req

const hasNewImage = req.file != null   // si changement image -> true // si que changement de texte : false
const payload = makePayload(hasNewImage, req)


Product.findByIdAndUpdate(id, payload)
.then((dataBaseResponse) => sendClientResponse(dataBaseResponse, res))
.then((product)=> deleteImage(product))
.catch((err)=> console.error("update pas ok", err))   // en cas de pb connexion base de donnée

}

function makePayload(hasNewImage, req){
    console.log("hasNewImage", hasNewImage)
    if (!hasNewImage) return req.body
    const payload = JSON.parse(req.body.sauce)
    payload.imageUrl = makeImageUrl(req, req.file.filename)
    console.log("voici le payload", payload)
    return payload
}


function sendClientResponse(dataBaseResponse, res){
        if (dataBaseResponse == null) {
            console.log("Nothing to update")
            return res.status(404).send({message: "Nothing to update"})
        }
            console.log("UPDATE OK", dataBaseResponse)
            return Promise.resolve(res.send({message: "Update OK"})).then(  // res.send n'est pas une promesse de base du coup j'ai du la transformer en promesse
                ()=> dataBaseResponse)
}


function makeImageUrl(req, fileName){
    return req.protocol + "://" + req.get("host") + "/images/" + fileName
}

function createSauce(req, res){
    const body = req.body
    const file = req.file

    const fileName = file.filename

    const sauce = JSON.parse(req.body.sauce)
    const {name, manufacturer, description, mainPepper, heat, userId } = sauce

    console.log("sauce", sauce)
    
    const imageUrl = req.file.destination + req.file.filename
    console.log('imagePath', imageUrl)

    const product = new Product({
        userId: userId,
        name: name,
        manufacturer : manufacturer,
        description : description,
        mainPepper : mainPepper,
        imageUrl: makeImageUrl(req, fileName),
        heat : heat,
        likes : 0,
        dislikes : 0,
        usersLiked : [],
        usersDisliked : []
    })
    product
    .save()
    .then((message) => {
        res.status(201).send({message: message})
        console.log("produit enregistré", message)
    })
    .catch(console.error)
}

function likeSauce(req,res){
    const like = req.body.like
    const userId = req.body.userId
    console.log("like, userId", like, userId)

    if (![0,-1,1].includes(like)) return res.status(403).send({message : "Mauvaise requête"}) // cela signifie que si la valeur du like est différente de 0 1 ou -1 la fonction s'arrete ici

    const id = req.params.id
    Product.findById(id)
    .then((product)=> updateVote(product, like, userId, res))
    .then (p => p.save())
    .then(prod => sendClientResponse(prod,res))
    .catch((err) => res.status(500).send(err))

}

function updateVote(product, like, userId, res) {
    if (like === 1 || like === -1) return incrementVote(product, userId, like)
    return resetVote(product, userId, res)
  }

function resetVote(product, userId, res){
    console.log("RESET VOTE AFTER: ", product)

    const {usersLiked, usersDisliked} = product
    if ([usersLiked, usersDisliked].every((arr) => arr.includes(userId)))   // pour etre sur que l'user vote une seule fois
    return Promise.reject("L'utilisateur a voté 2 fois")

    if (![usersLiked, usersDisliked].some(arr => arr.includes(userId)))   // pour etre sue que l'user a deja voté une fois
    return Promise.reject("L'utilisateur n'a pas déjà voté")


    if (usersLiked.includes(userId)) {
        --product.likes
        product.usersLiked = product.usersLiked.filter((id) => id !== userId)
      } else {
        --product.dislikes
        product.usersDisliked = product.usersDisliked.filter((id) => id !== userId)
      }
    

    console.log("RESET VOTE AFTER: ", product)
    return product
}


function incrementVote(product, userId, like) {
    const { usersLiked, usersDisliked } = product
  
    const votersArray = like === 1 ? usersLiked : usersDisliked
    if (votersArray.includes(userId)) return product
    votersArray.push(userId)
  
    like === 1 ? ++product.likes : ++product.dislikes
    return product
  }
  

module.exports = {getSauces, createSauce, getSauceById, deleteSauce, modifySauce, likeSauce}