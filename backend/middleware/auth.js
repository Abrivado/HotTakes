const jwt = require("jsonwebtoken")

function verifUser (req, res, next){
    console.log("verif user")
    const header = req.header("Authorization")  // la valeur du token bearer sera présente dans le header rubrique "Authorization"
    if (header == null) return res.status(403).send({ message: "Invalid"})

    const token = header.split(" ")[1]     // (" ") permets de mettre un espace entre chaque partie du token et "[1]" permets de récupérer celui qu'on a besoin

    jwt.verify(token, "password", (err, decoded) => {  // pour décoder le token et voir si il correspond bien avec les identifiants du user dans notre base de données
        if (err) return res.status(403).send({message: "Token invalid" + err})
        console.log("le token est bien valide, on continue")
        next()   // une fois que la function a bien été exécutée, ce next() sert à appeler la function d'après à l'intérieur de chaque route
    })
}

module.exports = {verifUser}