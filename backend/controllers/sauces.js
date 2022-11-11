const unlink = require("fs").unlink  // filesysteme va nous permettre de supprimer un fichier
const {Product} = require("../models/product")


function getSauces(req, res){
    Product.find({})  // afin de récupérer depuis notre mongodb tous les produits crées 
    .then(products => res.send(products))
    .catch(error => res.status(500).send(error))    
}


function createSauce(req, res){
    const body = req.body  
    const file = req.file  // correspond au fichier image

    const fileName = file.filename

    const sauce = JSON.parse(req.body.sauce) // afin de pouvoir utiliser le body on va d'avoir devoir le parse pour qu'il soit un objet et non plus une simple chaine de caractère
    const {name, manufacturer, description, mainPepper, heat, userId } = sauce // assigner chaque élément avec les données du body 

    console.log("sauce", sauce)
    
    const imageUrl = req.file.destination + req.file.filename // pour faire le chemin de l'image : images/"filename.png"
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

function makeImageUrl(req, fileName){
    return req.protocol + "://" + req.get("host") + "/images/" + fileName // pour recuperer l'url entiere et faire un chemin absolu, protocol = http,  req.get = methode pour 
}



function getSauceById (req, res){
    const id = req.params.id // pour récupérer l'id directement dans l'url
     Product.findById(id) // pour recup le product correspondant à l'id recup au dessus
     .then(product => res.send(product))
     .catch(console.error)
}

function deleteSauce (req, res){ 
    const id = req.params.id // recup id
    Product.findByIdAndDelete(id) // ordre de suppression pour mongo
    .then(deleteImage) // pour supprimer l'img localement
    .then (product => res.send({message : product})) // envoyer un message de succes au site
    .catch(err => res.status(500).send({message: err}))
}


function deleteImage(product){
    const imageUrl = product.imageUrl // pour récup l'imageUrl
    const fileToDelete = imageUrl.split("/").at(-1) // pour recup juste le nom du fichier ; .at(-1) signifie la derniere valeur
    unlink(`images/${fileToDelete}`, (err) => {    // function pour supprimer une image de mon fichier image
        console.error("Pb a la suppression de l'image", err)
    })
    return product
}

function modifySauce(req,res){
const {
    params: { id }  // pour récupérer l'id de l'url
} = req  

const hasNewImage = req.file != null   // pour voir si lors de la modif il y changement image (true) ou pas (false) 
const payload = makePayload(hasNewImage, req) 


Product.findByIdAndUpdate(id, payload)  // function de mon mongoose pour trouver un produit de la bdd et le modifier // il faudra lui passer 1 id et ce qu'on veut modifier
.then((dataBaseResponse) => sendClientResponse(dataBaseResponse, res))  
.then((product)=> deleteImage(product))  // si la modif est ok cette ligne permet de supprimer l'img en local
.catch((err)=> console.error("update pas ok", err))   // en cas de pb connexion base de donnée

}

function makePayload(hasNewImage, req){  // correspond au body de la sauce
    console.log("hasNewImage", hasNewImage)
    if (!hasNewImage) return req.body // si il n'y a pas de nouvelle image, on return le body
    const payload = JSON.parse(req.body.sauce) // le body reçu est une chaine de caractere, il faut donc le parse pour qu'il soit un objet
    payload.imageUrl = makeImageUrl(req, req.file.filename) // pour que le payload recup l'imageUrl grâce à notre fonction du chemin absolu faite plus tot
    console.log("voici le payload", payload)
    return payload
}


function sendClientResponse(dataBaseResponse, res){   // controle pour voir si la sauce peut etre modifié ou pas
        if (dataBaseResponse == null) {
            console.log("Nothing to update")
            return res.status(404).send({message: "Nothing to update"}) // la fonction s'arrete avec le return si y'a un pb lors de la modif
        }
            console.log("UPDATE OK", dataBaseResponse)
            return Promise.resolve(res.send({message: "Update OK"})).then(  // res.send n'est pas une promesse de base du coup j'ai du la transformer en promesse pour l'update puisse etre renvoyé à modifySauce
                ()=> dataBaseResponse)
}


function likeSauce(req,res){
    const like = req.body.like // pour selectionner le like du body
    const userId = req.body.userId // pour recup id de l'user connecté
    console.log("like, userId", like, userId)

    if (![0,-1,1].includes(like)) return res.status(403).send({message : "Mauvaise requête"}) 
    // cela signifie que si la valeur du like est différente de 0, 1 ou -1 la fonction s'arrete ici
    // includes permet de verifier les actions like et si jamais elles correspondent a -1 0 1 c'est respecté -> true

    const id = req.params.id
    Product.findById(id)
    .then((product)=> updateVote(product, like, userId, res)) 
    .then (p => p.save())
    .then(prod => sendClientResponse(prod,res))
    .catch((err) => res.status(500).send(err))

}

function updateVote(product, like, userId, res) {  // function qui gerera la verif des likes++ et des reset
    if (like === 1 || like === -1) return incrementVote(product, userId, like)  // pour ajouter un avis on appellera la fonction incrementVote
    return resetVote(product, userId, res) // pour retirer un avis on appellera la fonction resetVote
  }


function incrementVote(product, userId, like) {  
    const { usersLiked, usersDisliked } = product  // selection des rubriques like et dislike
  
    const votersArray = like === 1 ? usersLiked : usersDisliked // est ce que like=1 ? si oui on sera dans usersLike sinon on sera dans usersDislike
    if (votersArray.includes(userId)) return product // si l'user a deja voté la fonction s'arrete car ils ne peuvent pas voter 2x
    votersArray.push(userId) // si l'user n'a pas deja liké on push son like
  
    like === 1 ? ++product.likes : ++product.dislikes // est ce que like=1 ? si oui on +1 dans like sinon on +1 dans dislike
    return product
}


function resetVote(product, userId, res){
    console.log("RESET VOTE BEFORE: ", product)

    const {usersLiked, usersDisliked} = product // on recupere user
    if ([usersLiked, usersDisliked].every((arr) => arr.includes(userId)))   // si l'user est present dans les 2 arrays c'est qu'il a voté 2x du coup => error
    return Promise.reject("L'utilisateur a voté 2 fois")

    if (![usersLiked, usersDisliked].some(arr => arr.includes(userId)))   // // si l'user est present dans aucunes des 2 arrays c'est qu'il n'a pas voté du coup on peut rien reset => error
    return Promise.reject("L'utilisateur n'a pas déjà voté")


    if (usersLiked.includes(userId)) { // si l'userId est present dans les likes on peut retirer son like
        --product.likes
        product.usersLiked = product.usersLiked.filter((id) => id !== userId) // filter permet de laisser les likes de tous les autres user qui ont fait aucunes actions pour reset
      } else {
        --product.dislikes         // si l'userId est present dans les dislikes on peut retirer son dislike
        product.usersDisliked = product.usersDisliked.filter((id) => id !== userId)
      }
    

    console.log("RESET VOTE AFTER: ", product)
    return product
}


module.exports = {getSauces, createSauce, getSauceById, deleteSauce, modifySauce, likeSauce}