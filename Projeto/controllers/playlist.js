var Playlist = require('../models/playlist')
var mongoose = require("mongoose")

module.exports.get = id => {
    return Playlist
        .findOne({_id: mongoose.Types.ObjectId(id)})
        .exec()
}

module.exports.insert = (playlist) => {
    var d = new Date().toISOString().substring(0,16)
    d = d.replace("T"," ")
    playlist.data = d
    return new Playlist(playlist).save()
}

module.exports.delete = id => {
    return Playlist
        .deleteOne({_id: mongoose.Types.ObjectId(id)})
        .exec()
}

module.exports.deleteByAutor = autor => {
    return Playlist
        .deleteMany({autor: autor})
        .exec()
}

module.exports.listarTudo = () => {
    return Playlist
        .find({})
        .exec()
}

module.exports.list = () => {
    return Playlist
        .find({},{nome: 1, descricao: 1, autor: 1, data: 1})
        .exec()
}

module.exports.addComment = (id,comentario,user) => {
    var d = new Date().toISOString().substring(0,16)
    d = d.replace("T"," ")
    return Playlist
        .updateOne(
            { _id: mongoose.Types.ObjectId(id) },
            { $push: { comentarios: {comentario: comentario, nome: user, data: d} } })
        .exec()
}

module.exports.removeComment = (musica,id) => {
    return Playlist
    .updateOne(
        { _id: mongoose.Types.ObjectId(musica) },
        { $pull: {comentarios: {'_id': id}}})
    .exec()
}

module.exports.getComments = (id) => {
    return Playlist
        .findOne({_id: id},{comentarios: 1})
        .exec()
}

module.exports.getPlaylistsByUser = (user) => {
    return Playlist
        .find({autor: user},{nome: 1, data: 1, autor: 1, musicas: 1})
        .exec()
}

module.exports.search = nome => {
    return Playlist
        .find({ nome: new RegExp(nome, "i")})
        .exec()
}