var express = require('express');
var fs = require('fs')
var router = express.Router();

var Artista = require('../controllers/artista')
var Album = require('../controllers/album')
var Musica = require('../controllers/musica')
var User = require('../controllers/user')
var Playlist = require('../controllers/playlist')


const autenticacao = require('../middlewares/autenticar');
const user = require('../models/user');

/* GET home page. */
router.get('/', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
  res.render('index',{title: "Home", user: req.user});
});

router.get('/atividade', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
  User.listarUltimaMusica()
  .then(async users => {
    var atividade = []
    for (const u of users) {
      if (u.ultimaMusica != undefined) {
        var musica = await Musica.getNameById(u.ultimaMusica)
        atividade.push({nome: u.nome, musica: musica})
      }
    }
    res.status(200).jsonp(atividade)
  })
  .catch(err => console.log("Erro na atividade"+err))
});

router.get('/capa/:id', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {

  Musica.get(req.params.id)
  .then(async musica => {
    if (musica.oficial) {

      if (musica.album != undefined) {
        var album = await Album.getNameById(musica.album)
        musica.album = album.nome
        var file = Musica.getPathImagem(musica)
      } else {
        var file = Musica.getPathImagemUser(musica)
      }
    } else {
      var file = Musica.getPathImagemUser(musica)
    }

    fs.access(file, fs.F_OK, (err) => {
      if (err) {
        res.status(404).jsonp("Capa inexistente...")
      } else {
        fs.readFile(file, (err, content) => {
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

router.get('/foto/:id', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
  Artista.get(req.params.id)
  .then(artista => {
    file = Artista.getPathImagem(artista)
    fs.access(file, fs.F_OK, (err) => {
      if (err) {
        res.status(404).jsonp("Foto inexistente...")
      } else {
        fs.readFile(file, (err, content) => {
          if (err) {
            res.status(404).jsonp("Foto inexistente...")
          } else {
            res.writeHead(200, { "Content-type": "image/jpeg" });
            res.end(content);
          }
        })
      }
    })
  })
});

router.get('/search', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
  Musica.search(req.query.search)
  .then(musicas => {
    Album.search(req.query.search)
    .then(albuns => {
      Artista.search(req.query.search)
      .then(artistas => {
        Playlist.search(req.query.search)
        .then(playlists => {
          User.search(req.query.search)
          .then(users => {
            res.render('resultados',{title:"Resultados", musicas: musicas, albuns: albuns, artistas: artistas, playlists: playlists, users: users, user: req.user});
          }) 
        }) 
      })  
    })
  })
  .catch(err => res.render('error',{error: err}))
});

module.exports = router;
