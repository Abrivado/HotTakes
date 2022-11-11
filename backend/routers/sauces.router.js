const express = require ("express")
const {getSauces, createSauce, getSauceById, deleteSauce, modifySauce, likeSauce} = require ("../controllers/sauces")
const {upload} = require("../middleware/multer")  
const {verifUser} = require ("../middleware/auth")
const sauceRouter = express.Router()

sauceRouter.get("/", verifUser, getSauces)
sauceRouter.post("/", verifUser, upload.single("image"), createSauce)  // upload.single("image") permets de récupérer un fichier body/image du payload grace à multer
sauceRouter.get("/:id", verifUser, getSauceById)
sauceRouter.delete("/:id", verifUser, deleteSauce)
sauceRouter.put("/:id", verifUser, upload.single("image"),  modifySauce)
sauceRouter.post("/:id/like", verifUser, likeSauce)


module.exports = {sauceRouter}