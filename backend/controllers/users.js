const {User} = require("../mongo")
const bcrypt = require("bcrypt")
const jwt = require ("jsonwebtoken")

async function createUser(req, res) {    // fonction async = retourne toujours une promesse
    try {      // le try permet de rajouter les cas d'erreurs dans les fonctions async
    const email = req.body.email
    const password = req.body.password
    const hashedPassword = await hashPassword(password)  // await est nécéssaire pour résoudre la promesse
    const user = new User ({email, password: hashedPassword})
    await user.save()                 // le await permet d'attendre que le promesse soit résulue avant d'enregistrer l'user
    res.status(201).send({ message: "Utilisateur enregistré !" })
    }catch(err) {
        res.status(409).send({ message: "User pas enregistré :" + err})
    }         
}


function hashPassword(password){    // fonction pour crypter les mots de passe des utilisateurs
    const saltRounds = 10;    // chiffré 10X
    return bcrypt.hash(password, saltRounds)
    
}

async function logUser(req, res){
    try {  // le try permet de rajouter les cas d'erreurs dans les fonctions async

    const email = req.body.email
    const password = req.body.password
    const user = await User.findOne({ email: email}) // findone permet de chercher un mail dans notre base de donnée

    const isPasswordOK = await bcrypt.compare(password, user.password) // permet de vérifier si mdp et le hash correspondent bien 
    if (!isPasswordOK) {  // si mdp pas bon -> error
        res.status(403).send({ message: "Mot de passe incorrect"})
    }
    const token = createToken(email)
    res.status(200).send({ userId: user?._id, token: token})  // permet de renvoyer le token du user lorsqu'il s'est bien log
} catch (err) {
    console.error(err)
    res.status(500).send({ message: "Erreur interne"})
}
    

}

function createToken(email){
    return jwt.sign({email: email}, "password", {expiresIn:"24h"}) 
}

module.exports = {createUser, logUser}