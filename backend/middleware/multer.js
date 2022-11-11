const multer = require ("multer")

const storage = multer.diskStorage({   
    destination: "images/",   // permet de dire que les images upload seront stockés dans le dossier image
    filename : makeFilename})

function makeFilename (req, file, cb){
     cb(null, Date.now()+ "-"+ file.originalname) // Date.now sert à rajouter la date en suffixe au nom de l'image si jamais 2 personnes upload 2 images du meme nom 
 }


const upload = multer({storage: storage})

module.exports = {upload}