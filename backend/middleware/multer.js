const multer = require ("multer")

const storage = multer.diskStorage({
    destination: "images/", 
    filename : makeFilename})

function makeFilename (req, file, cb){
     cb(null, Date.now()+ "-"+ file.originalname) // Date.nomw sert à modifier le nom de l'image si jamais 2 personnes upload 2 images du meme nom 
 }


const upload = multer({storage: storage})

module.exports = {upload}