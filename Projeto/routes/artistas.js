var express = require('express');
var router = express.Router();
var fs = require('fs')

var Artista = require('../controllers/artista')
var Album = require('../controllers/album')
var Musica = require('../controllers/musica')
var User = require('../controllers/user')

const autenticacao = require('../middlewares/autenticar');
const auxiliares = require('./auxFuncs')


/* GET home page. */
router.get('/', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
  Artista.list()
    .then(async artistas => {

      for (var artista of artistas) {
        var totalAlbuns = await Album.getAlbunsByArtista(artista.nome)
        artista.totalAlbuns = totalAlbuns.length
        var totalMusicas = await Musica.getMusicasByArtista(artista.nome)
        artista.totalMusicas = totalMusicas.length
      }
      res.render('artistas',{title: "Artistas", artistas: artistas, user: req.user});
    })
    .catch(err => {
      console.log(err)
      res.render('error',{error: err});
    })
});

router.get('/criarArtista', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
  if (req.user.artista == undefined) {
    res.render("criarArtista",{title: "Artista", user: req.user})
  } else {
    res.status(200).jsonp("Ja é um artista...")
  }
});

router.get('/:id', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
  Artista.get(req.params.id)
    .then(artista => {
      Album.listByArtist(artista.nome)
        .then(async albuns => {

          for (var album of albuns) {
            var totalMusicas = await Musica.getMusicasByAlbum(album._id)
            album.totalMusicas = totalMusicas.length
          }

          var perfil = await User.getArtista(artista._id)

          if (perfil != undefined) {
            var musicas = await Musica.getMusicasByArtista(artista.nome)
          }

          res.render('artista',{title: "Artista", perfil: perfil, musicas: musicas, artista: artista, albuns: albuns, user: req.user});
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

router.post('/', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
  var artista = {
    nome: req.body.nome,
    biografia: req.body.biografia,
    moods: JSON.parse(req.body.moods),
    redes: JSON.parse(req.body.redes),
    user: ""
  }
  Artista.insert(artista)
  .then(dados => {
    User.setArtista(req.userId,dados._id)
    res.status(200).jsonp("Artista criado...")
  })
  .catch(err => console.log(err))
});

router.delete('/:id', autenticacao.userTipo(["admin","produtor","consumidor"]), function(req, res, next) {
  auxiliares.deleteArtista(req.params.id)
  res.status(200).jsonp("Artista apagado...")
});


module.exports = router;
