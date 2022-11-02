const jwt = require("jsonwebtoken")

function verifUser (req, res, next){
    console.log("verif user")
    const header = req.header("Authorization")
    if (header == null) return res.status(403).send({ message: "Invalid"})

    const token = header.split(" ")[1]
    //if (token == null) return res.status(403).send({ message: "Le Token ne peut pas être null"})
    

    jwt.verify(token, "password", (err, decoded) => {
        if (err) return res.status(403).send({message: "Token invalid" + err})
        console.log("le token est bien valide, on continue")
        next()
    })
}

module.exports = {verifUser}