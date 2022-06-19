var express = require('express');
var router = express.Router();
var fs = require('fs')

var Artista = require('../controllers/artista')
var Album = require('../controllers/album')
var Musica = require('../controllers/musica')
var User = require('../controllers/user')

const autenticacao = require('../middlewares/autenticar');
const musica = require('../models/musica');

/* GET home page. */
router.get('/', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
  Album.list()
  .then(async albuns => {

    for (var a of albuns) {
      var idArtista = await Artista.getIdByName(a.artista)
      a.idArtista = idArtista._id
    }

    res.render('albuns',{title: "Albuns", albuns: albuns, user: req.user});
  })
  .catch(err => {
    console.log(err)
    res.render('error',{error: err});
  })
})

router.get('/capa/:id', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
  Album.get(req.params.id)
  .then(a => {
    var capa = __dirname + "/../FileStorage/" + a.artista + "/" + a.nome + "/thumb.jpg"
    fs.access(capa, fs.F_OK, (err) => {
      if (err) {
        res.status(404).jsonp("Capa inexistente...")
      } else {
        fs.readFile(capa, (err, content) => {
          if (err) {
            res.status(404).jsonp("Capa inexistente...")
          } else {
            res.writeHead(200, { "Content-type": "image/jpeg" });
            res.end(content);
          }
        })
      }
    })
  })
  .catch(err => res.render('error',{error: err}))
});

  
router.get('/:id', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
  Album.get(req.params.id)
  .then(album => {

    Musica.listByAlbum(album._id)
    .then(async musicas => {

      for (const m of musicas) {
        var users = await User.getUsersMusicFav(m._id)
        m.favoritos = users.length
      } 

      var artista = await Artista.getIdByName(album.artista)
      album.idArtista = artista._id

      res.render('album', {title: "Album", album: album, musicas: musicas, user: req.user});
    })
    .catch(err => {
      console.log(err)
    })
  })
  .catch(err => {
    console.log(err)
    res.render('error',{error: err});
  })
});

router.delete('/:id', autenticacao.userTipo(["admin","produtor"]), function(req, res, next) {
  Album.get(req.params.id)
  .then(album => {
    Musica.listByAlbum(album.id)
    .then(musicas => {
      Musica.deleteAll(musicas)
      var path = __dirname + "/../FileStorage/" + album.artista + "/" + album.nome

      if (fs.existsSync(path)) {
        fs.rmdirSync(path, { recursive: true }, erro => {
          if (erro) {
              console.log("Erro apagar album: " + erro)
          }
        })
      }
     
      Album.delete(req.params.id)
      res.status(200).jsonp("Album apagado...")
    })
    .catch(err => {
      console.log(err)
    })
  })
});


  
module.exports = router;
