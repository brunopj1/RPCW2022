var Artista = require('../models/artista')
var mongoose = require("mongoose")

module.exports.get = id => {
    return Artista
        .findOne({_id: mongoose.Types.ObjectId(id)})
        .exec()
}

module.exports.insert = (artista) => {
    return new Artista(artista).save()
}

module.exports.delete = id => {
    return Artista
        .deleteOne({_id: mongoose.Types.ObjectId(id)})
        .exec()
}

module.exports.list = () => {
    return Artista
        .find()
        .sort({ nome: 1 })
        .exec()
}

module.exports.search = nome => {
    return Artista
        .find({ nome: new RegExp(nome, "i")})
        .exec()
}

module.exports.getIdByName = async nome => {
    return Artista
        .findOne({ nome: nome},{_id: 1, nome: 1})
        .exec()
}

module.exports.getPathImagem = artista => {
    return __dirname + "/../FileStorage/" + artista.nome + "/thumb.jpg"
}

module.exports.search = nome => {
    return Artista
        .find({ nome: new RegExp(nome, "i")})
        .exec()
}