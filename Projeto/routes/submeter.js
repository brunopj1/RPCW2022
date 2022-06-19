var express = require('express');
var router = express.Router();
var multer = require('multer')
const xml2js = require('xml2js');
const utf8 = require('utf8');
const parser = new xml2js.Parser()
var fs = require('fs')

var Artista = require('../controllers/artista')
var Album = require('../controllers/album')
var Musica = require('../controllers/musica');
var User = require('../controllers/user');


const autenticacao = require('../middlewares/autenticar');
const album = require('../models/album');
const musica = require('../models/musica');


//Pasta destino para o multer colocar os ficheiros extraidos do pedido
var upload = multer({dest: './uploads'})

router.get('/', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
  res.render('submeter',{title: "Submeter",user: req.user});
});

router.get('/album', autenticacao.userTipo(["admin","produtor"]), function(req, res, next) {
  res.render('subAlbum',{title: "Submeter Album", user: req.user});
});

router.get('/artista', autenticacao.userTipo(["admin","produtor"]), function(req, res, next) {
  res.render('subArtista',{title: "Submeter Artista",user: req.user});
});

router.get('/musica', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
  res.render('subMusica',{title: "Submeter Musica",user: req.user});
});

function processarAlbum(file, user, callback) {
  // TODO impedir insersao de albuns que ja existem
  var path = __dirname + '/../' + file.path
  fs.readFile(path, "utf-8", (err, data) => {
    if (err) {
        console.log(err)
    } else {
      var dadosLimpos = data.replace(/\r?\n/," ")
      parser.parseString(dadosLimpos, (err, result) => {
        var album = {}
        album['nome'] = result.album.title[0]
        album['artista'] = result.album.artistdesc[0]
        album["dataLancamento"] = result.album.releasedate[0]
        album["genero"] = result.album.genre[0]
        review = result.album.review[0]
        album['critica'] = review.replace(/(\r\n|\n|\r)/gm, " ")
        album['user'] = user.nome
        // Apagar o ficheiro
        fs.unlink(path, err => {
          if (err) throw err;
        })
        // Criar a pasta do album
        var pasta = __dirname + '/../FileStorage/' + album.artista + "/" + album.nome
        if (!fs.existsSync(pasta)){
          fs.mkdirSync(pasta);
        }
        // Inserir na BD
        Album.insert(album)
        .then(album => {
          // Log
          console.log("Album inserido: " + album.nome)
          // Callback
          callback(album)
        })
        .catch(erro => {
          console.log("Erro ao inserir album na BD: " + erro)
        })
      })
    }
  })
} 

function processarCapa(file, path) {
  var oldPath = __dirname + '/../' + file.path
  var newPath = path + "thumb.jpg"
  fs.rename(oldPath, newPath, erro => {
    if (erro) {
        console.log("Erro ao fazer rename da capa: " + erro)
    }
  })
}

function processarMusicas(musicas, album, path, user) {
  musicas.forEach(file => {
    var oldPath = __dirname + '/../' + file.path
    var newPath = path + file.originalname
    fs.rename(oldPath, newPath, erro => {
      if (erro) {
          console.log("Erro ao fazer rename musicas!")
      } else {
        var musica = {}
        musica['nome'] = file.originalname.replace(/\.[^/.]+$/, "")
        musica['album'] = album._id
        musica['artista'] = album.artista
        musica['oficial'] = true
        musica['user'] = user.nome
        musica['comentarios'] = []

        const getMP3Duration = require('get-mp3-duration')
        const buffer = fs.readFileSync(newPath)
        const duration = getMP3Duration(buffer)
        musica['duracao'] = millisToMinutesAndSeconds(duration)

        // Inserir na BD
        Musica.insert(musica).catch(erro => {
          console.log("Erro ao inserir musica na BD: " + erro)
        })
        // Log
        console.log("Musica inserida: " + musica.nome)
      }
    })
  })
}

function processarArtista(file, user, callback) {
  // TODO impedir insersao de artistas que ja existem
  var artista = {}
  var path = __dirname + '/../' + file.path
  fs.readFile(path, "utf-8", (err, data) => {
    if (err) {
      console.log(err)
    } else {
      parser.parseString(data, (err, result) => {
        artista['nome'] = result.artist.name[0]
        var bibliografia = result.artist.biography[0]
        artista['biografia'] = bibliografia.replace(/(\r\n|\n|\r)/gm, " ")
        artista['moods'] = result.artist.mood
        artista['user'] = user.nome
        // Apagar o ficheiro .nfo
        fs.unlink(path, err => {
          if (err) throw err;
        })
        // Criar a pasta do artista
        var pasta = __dirname + '/../FileStorage/' + artista.nome
        if (!fs.existsSync(pasta)){
          fs.mkdirSync(pasta);
        }
        // Inserir na BD
        Artista.insert(artista)
          .catch(erro => {
            console.log("Erro ao inserir artista na BD")
          })
        // Log
        console.log("Artista inserido: " + artista.nome)
        // Callback
        callback(artista)
      })
    }
  })
}

function processarArtistaFoto(file, path) {
  let oldPath = __dirname + '/../' + file.path
  
  if (!fs.existsSync(path)){
    fs.mkdirSync(path);
  }
  
  path = path + "thumb.jpg"

  fs.rename(oldPath, path, erro => {
    if (erro) {
        console.log("Erro ao fazer rename da foto!")
    }
  })
}

router.post('/album', autenticacao.userTipo(["admin","produtor"]), upload.fields([{ name: 'album', maxCount: 1 }, { name: 'capa', maxCount: 1 }, { name: 'musicas', maxCount: 50 }]), function(req, res, next) {
  //Processa album
  processarAlbum(req.files['album'][0], req.user, album => {
    // Path do album
    var path = __dirname + "/../FileStorage/" + album.artista + "/" + album.nome + "/"
    // Processar capa
    processarCapa(req.files['capa'][0], path)
    // Processar musicas
    processarMusicas(req.files['musicas'], album, path, req.user)
  })
  // Redirecionar utilizador
  res.redirect(301,'/')
})

router.post('/artista', autenticacao.userTipo(["admin","produtor"]), upload.fields([{ name: 'artista', maxCount: 1 }, { name: 'foto', maxCount: 1 }]), upload.single(), function(req, res, next) {
  // Processar o artista
  processarArtista(req.files['artista'][0], req.user, artista => {
    // Processar a fotografia
    var path = __dirname + "/../FileStorage/" + artista.nome + "/"
    processarArtistaFoto(req.files['foto'][0], path)
  })
  // Redirecionar utilizador    
  res.redirect(301,'/')
})

router.post('/userArtistaFoto', autenticacao.userTipo(["admin","consumidor","produtor"]), upload.fields([{ name: 'foto', maxCount: 1 }]), upload.single(), function(req, res, next) {
  Artista.get(req.user.artista)
  .then(artista => {
    // Processar a fotografia
    var path = __dirname + "/../FileStorage/" + artista.nome + "/"

    req.files['foto'][0].originalname = "thumb.jpg"

    processarArtistaFoto(req.files['foto'][0], path)
    res.status(200).jsonp("Foto do artista adicionada...")
  })
})

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

async function processarMusicasUser(musicas, user) {

  if (user.artista == undefined) {
    var path = __dirname + "/../FileStorage/" + user.nome + "/" 
    var pathMusic = __dirname + "/../FileStorage/" + user.nome + "/" + user.musicas + "/"
  } else {
    var path = ''
    var pathMusic = ''
    var artistaNome
    var artista = await Artista.get(user.artista)
    path = __dirname + "/../FileStorage/" + artista.nome + "/"
    pathMusic = __dirname + "/../FileStorage/" + artista.nome + "/" + user.musicas + "/"
    artistaNome = artista.nome
  }
  
  if (!fs.existsSync(path)){
    fs.mkdirSync(path);
  }

  if (!fs.existsSync(pathMusic)){
    fs.mkdirSync(pathMusic);
  }
  
  musicas.forEach(file => {
    var oldPath = __dirname + '/../' + file.path
    var newPath = pathMusic + file.originalname

    fs.rename(oldPath, newPath, erro => {
      if (erro) {
        console.log("Erro ao fazer rename musicas!")
      } else {
        var musica = {}
        musica['nome'] = file.originalname.replace(/\.[^/.]+$/, "")
        if (user.artista == undefined) {
          musica['artista'] = user.nome
          musica['oficial'] = false
        } else {
          musica['artista'] = artistaNome
          musica['oficial'] = true
        }
        musica['numero'] = user.musicas
        musica['user'] = user.nome

        const getMP3Duration = require('get-mp3-duration')
        const buffer = fs.readFileSync(newPath)
        const duration = getMP3Duration(buffer)
        musica['duracao'] = millisToMinutesAndSeconds(duration)

        // Inserir na BD
        Musica.insert(musica).catch(erro => {
          console.log("Erro ao inserir musica na BD: " + erro)
        })
        // Log
        console.log("Musica inserida: " + musica.nome)
      }
    })
  })
}

async function processarCapaUser(file,user) {
  var oldPath = __dirname + '/../' + file[0].path

  if (user.artista == undefined) {
    var pathCapa = __dirname + "/../FileStorage/" + user.nome + "/" + user.musicas + "/"
  } else {
    var pathCapa = ''
    var artista = await Artista.get(user.artista)
    pathCapa = __dirname + "/../FileStorage/" + artista.nome + "/" + user.musicas + "/"
  }

  var newPath = pathCapa + "thumb.jpg"
  fs.rename(oldPath, newPath, erro => {
    if (erro) {
        console.log("Erro ao fazer rename da capa: " + erro)
    }
  })
}

router.post('/musica', autenticacao.userTipo(["admin","consumidor","produtor"]), upload.fields([{ name: 'capa', maxCount: 1 }, { name: 'musicas', maxCount: 50 }]), async function(req, res, next) {
  try {
    await processarMusicasUser(req.files.musicas,req.user)

    await processarCapaUser(req.files.capa,req.user)

    User.incrementMusicas(req.user._id)
    
    res.redirect(301,'/')
  } catch (err) {
    res.status(500).jsonp("Ficheiro invalidos...")
  }
})

function processaFoto(file,user) {
  var oldPath = __dirname + '/../' + file[0].path

  var path = __dirname + "/../FileStorage/" + user + "/"

  var newPath = path + "foto.jpg"

  if (!fs.existsSync(path)){
    fs.mkdirSync(path);
  }

  fs.rename(oldPath, newPath, erro => {
    if (erro) {
        console.log("Erro ao fazer rename da foto: " + erro)
    }
  })
}

router.post('/foto', autenticacao.userTipo(["admin","consumidor","produtor"]), upload.fields([{ name: 'foto', maxCount: 1 }]), function(req, res, next) {

  processaFoto(req.files.foto,req.user.nome)

  res.redirect(301,'/users/'+req.user.nome)

  User.addFoto(req.user._id)
})

router.delete('/foto/:id', autenticacao.userTipo(["admin","consumidor","produtor"]), function(req, res, next) {
  if (req.user.tipo == "admin" || req.user.nome == req.params.id) {
    var path = __dirname + "/../FileStorage/" + req.params.id + "/foto.jpg"

    fs.unlinkSync(path, erro => {
      if (erro) {
          console.log("Erro apagar foto: " + erro)
      }
    })
    
    User.removeFoto(req.params.id)

    res.status(200).jsonp("Foto apagada...")
  } else {
    res.status(200).jsonp("Não tem autorização para apagar a foto...")
  }
})


module.exports = router;