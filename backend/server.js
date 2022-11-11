const http = require('http');  
const app = require('./app');

app.set('port', process.env.PORT || 3000);
const server = http.createServer(app);     // methode du package http pour pouvoir créer le serveur

server.listen(process.env.PORT || 3000); // pour écouter les requetes envoyés par la serveur