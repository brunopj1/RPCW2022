var express = require('express');
var router = express.Router();

const {promisify, callbackify} = require('util')
var fs = require('fs')
const fileInfo = promisify(fs.stat)

var Artista = require('../controllers/artista')
var Album = require('../controllers/album')
var Musica = require('../controllers/musica')
var User = require('../controllers/user')


const autenticacao = require('../middlewares/autenticar');


/* GET home page. */
router.get('/', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
  Musica.list()
  .then(async musicas => {

    musicasAlbumArtista = []
    for (const m of musicas) {
      if (m.oficial) {
        var album = await Album.getNameById(m.album)
        var artista = await Artista.getIdByName(m.artista)
        musicasAlbumArtista.push({musica: m, album: album, artista: artista})
      } else {
        musicasAlbumArtista.push({musica: m})
      }
    }
  
    res.render('musicas',{title: "Musicas",musicas: musicasAlbumArtista, user: req.user});
  })
  .catch(err => {
    console.log(err)
    res.render('error',{error: err});
  })
});

router.get('/favoritas', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
  User.getByName(req.user.nome)
  .then(user => {
    res.status(200).jsonp(user.musicasFavoritas)
  })
  .catch(err => {
    console.log(err)
  })
});

router.get('/ouvir/:id', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
  Musica.get(req.params.id)
    .then(async musica => {

      if (musica.oficial) {
        if (musica.album != undefined) {
          var album = await Album.getNameById(musica.album)
          musica.album = album.nome
          var file = Musica.getPathMusica(musica)
        } else {
          var file = Musica.getPathMusicaUser(musica)
        }
      } else {
        var file = Musica.getPathMusicaUser(musica)
      }
      
      fs.access(file, fs.F_OK, async (err) => {
        if (err) {
          console.error("Musica inexistente...")
          res.render('error',{error: err})
        } else {

          const {size} = await fileInfo(file)
          const range = req.headers.range
          if (range) {
              var [start,end] = range.replace(/bytes=/,'').split('-')
              start = parseInt(start,10)
              end = end ? parseInt(end,10) : size-1
      
              res.writeHead(206,{
                  'Content-Range': `bytes ${start}-${end}/${size}`,
                  'Accept-Ranges': 'bytes',
                  'Content-Length': (end - start) + 1,
                  'Content-type': 'audio/mp3'
              })
              fs.createReadStream(file,{start,end}).pipe(res)
      
          } else {
              res.writeHead(200,{
                  'Content-Length': size,
                  'Content-Type': 'audio/mp3'
              })
              fs.createReadStream(file).pipe(res)
          }
        }
      })
    })
    .catch(err => res.render('error',{error: err}))
});

router.delete('/comentario/:id', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
  Musica.getCommentById(req.params.id,req.body._id)
  .then(dados => {
    comentario = dados.comentarios[0]
    if (req.userTipo == "admin" || req.user.nome == comentario.nome) {
      Musica.removeComment(req.params.id,req.body._id)
      .then(_ => {
        res.status(200).jsonp("Comentario removido...")
      })
      .catch(err => {
        console.log(err)
        res.render('error',{error: err});
      })
    }
  })
});

router.post('/comentario/:id', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
  Musica.addComment(req.params.id, req.body.comentario, req.user.nome)
  .then(_ => {
    res.status(200).jsonp("Comentario adicionado...")
  })
  Musica.get(req.params.id)
  .then(musica => {
    if (musica.user != req.user.nome) {
      var notificacao = {
        autor: req.user.nome,
        user: musica.user,
        fonte: "musica",
        idFonte: req.params.id
      }
      User.addNotificacao(notificacao)
    }
  })
});

router.get('/:id/comentarios', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
  Musica.getComments(req.params.id)
  .then(comentarios => {
    res.status(200).jsonp({comentarios: comentarios.comentarios, user: req.user})
  })
});

router.get('/:id', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
  User.lastMusic(req.userId,req.params.id)
  .then(_ => {
    Musica.get(req.params.id)
    .then(async musica => {
      if (musica != undefined) {
        if (musica.album != undefined) {
          var album = await Album.get(musica.album)
          musica.albumNome = album.nome
          musica.albumId = album._id
          musica.pathImagem = Musica.getPathImagem(musica)
        } else {
          musica.pathImagem = Musica.getPathImagemUser(musica)
          if (musica.oficial) {
            var artistaId = await Artista.getIdByName(musica.artista)
            musica.artistaId = artistaId._id
          }
        } 
        res.render('musica',{title: musica.nome, musica: musica,user: req.user});
        Musica.incrementPlays(req.params.id)
      } else {
        res.status(404).jsonp("Musica apagada...")
      } 
    })
    .catch(err => {
      console.log(err)
      res.render('error',{error: err});
    })
  })
});

router.put('/favoritas', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
  User.addFavorite(req.userId,req.body._id)
  .then(_ => {
    res.status(200).jsonp("Musica adicionada...")
  })
  .catch(err => {
    console.log(err)
    res.render('error',{error: err});
  })
});

router.put('/remover', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
  User.removeFavorite(req.userId,req.body._id)
  .then(_ => {
    res.status(200).jsonp("Musica removida...")
  })
  .catch(err => {
    console.log(err)
    res.render('error',{error: err});
  })
});

function apagaMusicas(musicas) {
  musicas.forEach(id => {
    Musica.get(id)
    .then(async m => {
      if (m.oficial) {
        if (m.album != undefined) {
          //Musica oficial de um album 
          var album = await Album.getNameById(m.album)
          m.album = album.nome
          var path = Musica.getPathMusica(m)
          var diretoria = Musica.getPathMusicaDiretoria(m)
        } else {
          //Musica oficial de um artista (user)
          var path = Musica.getPathMusicaUser(m)
          var diretoria = Musica.getPathMusicaUserDiretoria(m)
        }
      } else {
        //Musica de um user
        var path = Musica.getPathMusicaUser(m)
        var diretoria = Musica.getPathMusicaUserDiretoria(m)
      }
      
      fs.unlinkSync(path, erro => {
        if (erro) {
            console.log("Erro apagar musica: " + erro)
        }
      })

      //No caso de ser um album, mesmo que n hava musicas, havera sempre a capa (util na rota albuns)
      if ((m.oficial && m.album == undefined) || !m.oficial) {
        var files = fs.readdirSync(diretoria)

        if (files.length == 1 && files[0] == "thumb.jpg") {
          fs.rmdirSync(diretoria, { recursive: true }, erro => {
            if (erro) {
                console.log("Erro ao apagar diretoria: " + erro)
            }
          })
        }
      }
      Musica.delete(m)
    })
    .catch(err => {
      console.log(err)
    })
  })
}

router.delete('/', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
  var musicas = JSON.parse(req.body.musicas)
  apagaMusicas(musicas)
  res.status(200).jsonp("Musica(s) apagada(s)...")
});


module.exports = router;
