// const {User} = require("../mongo")

// function createUser(){
//     (req, res) => {
//         const email = req.body.email
//         const password = req.body.password
//         const user = new User ({ email: email, password: password})
   
//    user.save()
//    .then(() => res.send({message: "Utilisateur enregistré !"}))
//    .catch((err) => console.log("User pas enregistré", err))        
//     }
// }

// module.exports = {createUser}