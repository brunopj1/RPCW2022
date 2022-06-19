var fs = require('fs')

var Artista = require('../controllers/artista')
var Album = require('../controllers/album')
var Musica = require('../controllers/musica')
var User = require('../controllers/user')

module.exports.deleteArtista = async (id) => {
  Artista.get(id)
  .then(async artista => {
    var musicas = await Musica.getMusicasByArtista(artista.nome)
    await Musica.deleteAll(musicas)
    var albuns = await Album.getAlbunsByArtista(artista.nome)
    var ids = []
    albuns.forEach(a => {
      ids.push(a._id)
    })
    await Album.deleteAll(ids)
    var path = __dirname + "/../FileStorage/" + artista.nome
    fs.rmdirSync(path, { recursive: true }, erro => {
      if (erro) {
          console.log("Erro apagar artista: " + erro)
      }
    })
    var user = await User.getArtista(id)
    if (user != undefined) {
      User.remArtista(user._id)
    }
    await Artista.delete(id)
  })
}
