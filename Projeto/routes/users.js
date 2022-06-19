var express = require('express');
var router = express.Router();

var fs = require('fs')

var Artista = require('../controllers/artista')
var Album = require('../controllers/album')
var Musica = require('../controllers/musica')
var User = require('../controllers/user')
var Playlist = require('../controllers/playlist')


const autenticacao = require('../middlewares/autenticar');
const musica = require('../models/musica');

const auxiliares = require('./auxFuncs')

/* GET home page. */
router.get('/', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
    User.listarNomes()
    .then(dados => {
        res.render('users',{title: "Users", users: dados, user: req.user});
    })
    .catch(err => {
        console.log(err)
        res.render('error',{error: err});
    })
});


router.get('/nome', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
    res.status(200).jsonp(req.user)
})

router.get('/notificacoes', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
    res.render('notificacoes',{notificacoes: req.user.notificacoes, user: req.user.nome})
})

router.get('/:nome', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
    User.getByName(req.params.nome)
    .then(user => {
        Musica.getNameById(user.ultimaMusica)
        .then(ultimaMusica => {
            
            var fav = []
            user.musicasFavoritas.forEach(m => fav.push(m.musica))

            Musica.getAllNamesById(fav)
            .then(musicas => {

                var associadasComData = []
                
                //Associa a musica ao nome da musica e a data em que foi adicionada aos favoritos
                user.musicasFavoritas.forEach(m => {
                    musicas.forEach(mm => {
                        if (mm._id == m.musica) {
                            associadasComData.push({id: m.musica, nome: mm.nome, data: m.data})
                        }
                    })
                })

                Playlist.getPlaylistsByUser(user.nome)
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
                    res.render('user',{title: "User", perfil: user, user: req.user, ultima: ultimaMusica, favoritas: associadasComData, playlists: playlists});
                })
            })
            .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
    })
    .catch(err => {
        console.log(err)
        res.render('error',{error: err});
    })
});

router.get('/foto/:nome', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
    
    file = User.getPathFoto(req.params.nome)
    fs.access(file, fs.F_OK, (err) => {
        if (err) {
            console.error("Ficheiro inexistente")
            res.render('error',{error: err})
        } else {
            fs.readFile(file, (err, content) => {
                if (err) {
                    console.log(err);
                    res.render('error',{error: err})
                } else {
                    res.writeHead(200, { "Content-type": "image/jpeg" });
                    res.end(content);
                }
            })
        }
    })
});

router.delete('/user/:nome', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
    User.getByName(req.params.nome)
    .then(async user => {
        if (user.artista != undefined) {
            await auxiliares.deleteArtista(user.artista)
        }
        await Playlist.deleteByAutor(req.params.nome)
        await User.deleteByNome(req.params.nome)
        res.status(200).jsonp("User removido...")
    })
});


router.delete('/:nome', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
    User.remNotificacao(req.userId,req.body._id)
    .then(_ => {
        res.status(200).jsonp("Notificacao removida...")
    }).catch(err => {
        console.log(err)
    })
});


module.exports = router;
