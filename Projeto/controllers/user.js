var User = require('../models/user')
var mongoose = require("mongoose")

module.exports.listarUltimaMusica= () => {
    return User
    .find({},{nome: 1, ultimaMusica: 1})
    .exec()
}

module.exports.listar = () => {
    return User
        .find({},{_id: 1, nome: 1, password: 1})
        .exec()
}

module.exports.inserir = (u) => {
    var newUser = new User(u)
    return newUser
        .save()
}

module.exports.setArtista = (id,idArtista) => {
    return User
    .updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: {artista: idArtista }})
    .exec()
}

module.exports.remArtista = (id) => {
    return User
    .updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        { $unset: {artista: 1}})
    .exec()
}

module.exports.getArtista = (idArtista) => {
    return User
    .findOne({ artista: idArtista },{_id: 1, nome: 1})
    .exec()
}

module.exports.getByName = (n) => {
    return User
    .findOne({nome: n},{_id: 1, nome: 1, password: 1, musicasFavoritas: 1, ultimaMusica: 1, foto: 1, tipo: 1,artista: 1})
    .exec()
}

module.exports.getById = (id) => {
    return User
    .findOne({_id: id},{_id: 1, nome: 1, notificacoes: 1, tipo: 1, artista: 1, musicas: 1})
    .exec()
}

module.exports.lastMusic = (id,musica) => {
    return User
    .updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        { ultimaMusica: musica })
    .exec()
}

module.exports.addFavorite = (id,musica) => {
    var d = new Date().toISOString().substring(0,16)
    d = d.replace("T"," ")
    var musFav = {
        musica: musica,
        data: d
    }
    return User
    .updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        { $push: {musicasFavoritas: musFav }})
    .exec()
}

module.exports.removeFavorite = (id,musica) => {
    return User
    .updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        { $pull: {musicasFavoritas: {musica: musica} }})
    .exec()
}

module.exports.delete = id => {
    return User
        .deleteOne({_id: mongoose.Types.ObjectId(id)})
        .exec()
}

module.exports.deleteByNome = nome => {
    return User
        .deleteOne({nome: nome})
        .exec()
}

module.exports.deleteByAutor = autor => {
    return User
        .delete({autor: autor})
        .exec()
}

module.exports.addNotificacao = (n) => {
    var d = new Date().toISOString().substring(0,16)
    d = d.replace("T"," ")
    return User
    .updateOne(
        { nome: n.user },
        { $push: {notificacoes: {autor: n.autor, data: d, fonte: n.fonte, idFonte: n.idFonte}}})
    .exec()
}

module.exports.remNotificacao = (id,nt) => {
    return User
    .updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        { $pull: {notificacoes: {_id: nt}}})
    .exec()
}

module.exports.getNotificacoes = (id) => {
    return User
        .findOne({},{nome: 1, notificacoes: 1})
        .exec()
}

module.exports.addFoto = (id) => {
    return User
    .updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: {foto: true }})
    .exec()
}

module.exports.removeFoto = (nome) => {
    return User
    .updateOne(
        { nome: nome },
        { $set: {foto: false }})
    .exec()
}

module.exports.incrementMusicas = (id) => {
    return User
        .updateOne(
            { _id: mongoose.Types.ObjectId(id) },
            { $inc: {musicas: 1}})
        .exec()
}

module.exports.listarNomes = () => {
    return User
    .find({},{_id: 1, nome: 1, tipo: 1})
    .exec()
}


module.exports.getUsersMusicFav = (musica) => {
    return User
    .find({"musicasFavoritas.musica": {$in: musica}},{_id: 1})
    .exec()
}

module.exports.getPathFoto= nome => {
    return __dirname + "/../FileStorage/" + nome + "/foto.jpg"
}

module.exports.search = nome => {
    return User
        .find({ nome: new RegExp(nome, "i")})
        .exec()
}