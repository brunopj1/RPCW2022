var Musica = require('../models/musica')
var mongoose = require("mongoose")

module.exports.get = id => {
    return Musica
        .findOne({_id: mongoose.Types.ObjectId(id)})
        .exec()
}

module.exports.getNameById = id => {
    return Musica
        .findOne({_id: mongoose.Types.ObjectId(id)},{nome: 1})
        .exec()
}

module.exports.getAllNamesById = ids => {
    return Musica
        .find({_id: { $in: ids}},{nome: 1})
        .exec()
}

module.exports.insert = (musica) => {
    return new Musica(musica).save()
}

module.exports.delete = id => {
    return Musica
        .deleteOne({_id: mongoose.Types.ObjectId(id)})
        .exec()
}

module.exports.deleteAll = ids => {
    return Musica
        .deleteMany(
            { _id: { $in: ids } } 
        )
        .exec()
}

module.exports.incrementPlays = (id) => {
    return Musica
        .updateOne(
            { _id: mongoose.Types.ObjectId(id) },
            { $inc: {plays: 1}})
        .exec()
}

module.exports.getPlays = (id) => {
    return Musica
        .findOne({ _id: mongoose.Types.ObjectId(id) },{ plays: 1})
        .exec()
}


module.exports.addComment = (id,comentario,user) => {
    var d = new Date().toISOString().substring(0,16)
    d = d.replace("T"," ")
    return Musica
        .updateOne(
            { _id: mongoose.Types.ObjectId(id) },
            { $push: { comentarios: {comentario: comentario, nome: user, data: d} } })
        .exec()
}

module.exports.removeComment = (musica,id) => {
    return Musica
    .updateOne(
        { _id: mongoose.Types.ObjectId(musica) },
        { $pull: {comentarios: {'_id': id}}})
    .exec()
}

module.exports.getComments = (id) => {
    return Musica
        .findOne({_id: id},{comentarios: 1})
        .exec()
}

module.exports.getCommentById = (musica,id) => {
    return Musica
        .findOne({_id: mongoose.Types.ObjectId(musica), 'comentarios._id': mongoose.Types.ObjectId(id)},
        {'comentarios': {$elemMatch: {'_id': mongoose.Types.ObjectId(id)}}}
        )
        .exec()
}

module.exports.list = () => {
    return Musica
        .find()
        .sort({ nome: 1 })
        .exec()
}

module.exports.listByAlbum = (id) => {
    return Musica
        .find({ album: id},{_id: 1, nome: 1, comentarios: 1, plays: 1, user: 1})
        .exec()
}

module.exports.search = nome => {
    return Musica
        .find({ nome: new RegExp(nome, "i")})
        .exec()
}

module.exports.getOficial = id => {
    return Musica
        .find({_id: id},{oficial: 1})
        .exec()
}

module.exports.getMusicasByArtista = artista => {
    return Musica
        .find({artista: artista})
        .exec()
}

module.exports.getMusicasByAlbum = album => {
    return Musica
        .find({album: album})
        .exec()
}

module.exports.getPathMusica = musica => {
    return __dirname + "/../FileStorage/" + musica.artista + "/" + musica.album + "/" + musica.nome + ".mp3"
}


module.exports.getPathMusicaDiretoria = musica => {
    return __dirname + "/../FileStorage/" + musica.artista + "/" + musica.album
}

module.exports.getPathMusicaUser = musica => {
    return __dirname + "/../FileStorage/" + musica.artista + "/" + musica.numero + "/" + musica.nome + ".mp3"
}

module.exports.getPathMusicaUserDiretoria = musica => {
    return __dirname + "/../FileStorage/" + musica.artista + "/" + musica.numero + "/" 
}

module.exports.getPathImagem = musica => {
    return __dirname + "/../FileStorage/" + musica.artista + "/" + musica.album + "/thumb.jpg"
}

module.exports.getPathImagemUser = musica => {
    return __dirname + "/../FileStorage/" + musica.artista +  "/" + musica.numero + "/thumb.jpg"
}