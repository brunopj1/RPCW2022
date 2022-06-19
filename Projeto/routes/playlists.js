var express = require('express');
var router = express.Router();

var Artista = require('../controllers/artista')
var Album = require('../controllers/album')
var Musica = require('../controllers/musica')
var Playlist = require('../controllers/playlist')
var User = require('../controllers/user')

const autenticacao = require('../middlewares/autenticar');

router.get('/', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
    Playlist.listarTudo()
    .then(async playlists => {
        for (const p of playlists) {
            p.plays = 0
            for (const m of p.musicas) {
                var total = await Musica.getPlays(m)
                if (total != undefined && total.plays != undefined) {
                    p.plays += total.plays
                }
            }
            p.musicas = p.musicas.length
        }
        res.render('playlists',{title: "Playlists", playlists: playlists, user: req.user})
    })
    .catch(err => {
        res.render('error',{error: err})
    })
})


router.get('/:id/comentarios', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
    Playlist.getComments(req.params.id)
    .then(comentarios => {
        res.status(200).jsonp({comentarios: comentarios.comentarios, user: req.user})
    })
});

router.delete('/comentario/:id', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
    Playlist.removeComment(req.params.id,req.body._id)
    .then(_ => {
      res.status(200).jsonp("Comentario apagado...")
    })
    .catch(err => {
      console.log(err)
      res.render('error',{error: err});
    })
});

  
router.get('/:id', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
    Playlist.get(req.params.id)
    .then(dados => {
        User.getById(dados.user)
        .then(async nome => {
            var musicas = []
            for (const m of dados.musicas) {
                var nome = await Musica.getNameById(m)
                if (nome != undefined) {
                    musicas.push({id: m, nome: nome.nome})
                } else {
                    musicas.push({id: m, nome: undefined})
                }
            }
            res.render('playlist',{title: "Playlist", playlist: dados, musicas: musicas, user: req.user})
        })
    })
    .catch(err => {
        res.render('error',{error: err})
    })
});

router.post('/', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
    var musicas = JSON.parse(req.body.musicas)

    var playlist = {
        nome: req.body.nome,
        descricao: req.body.descricao,
        autor: req.user.nome,
        musicas: musicas,
    }
    Playlist.insert(playlist)
    .then(_ => res.status(200).jsonp("Playlist criada..."))
    .catch(err => res.render('error',{erro: err}))
});

router.delete('/:id', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
    Playlist.delete(req.params.id)
    .then(_ => res.status(200).jsonp("Playlist apagada..."))
    .catch(err => console.log(err))
});


router.post('/comentario/:id', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
    Playlist.addComment(req.params.id, req.body.comentario, req.user.nome)
    .then(_ => {
        res.status(200).jsonp("Comentario adicionado...")
    })
    
    Playlist.get(req.params.id)
    .then(playlist => {
        if (playlist.autor != req.user.nome) {
            var notificacao = {
                autor: req.user.nome,
                user: playlist.autor,
                fonte: "playlist",
                idFonte: req.params.id
            }
            User.addNotificacao(notificacao)
        }
    })
})
  
module.exports = router;
