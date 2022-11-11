const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://clement:openclassroom@cluster0.eqsutdp.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })                                   // pour connecter mongo db à notre projet
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

