var Album = require('../models/album')
var mongoose = require("mongoose")

module.exports.get = id => {
    return Album
        .findOne({_id: mongoose.Types.ObjectId(id)})
        .exec()
}

module.exports.insert = album => {
    return new Album(album).save()
}

module.exports.delete = id => {
    return Album
        .deleteOne({_id: mongoose.Types.ObjectId(id)})
        .exec()
}

module.exports.list = () => {
    return Album
        .find()
        .sort({ nome: 1 })
        .exec()
}

module.exports.listByArtist = artista => {
    return Album
        .find({ artista: artista })
        .exec()
}

module.exports.search = nome => {
    return Album
        .find({ nome: new RegExp(nome, "i")})
        .exec()
}

module.exports.getNameById = async id => {
    return Album
        .findOne({_id: id},{nome: 1})
        .exec()
}

module.exports.getAlbunsByArtista = artista => {
    return Album
        .find({artista: artista},{_id: 1})
        .exec()
}

module.exports.deleteAll = ids => {
    return Album
        .deleteMany(
            { _id: { $in: ids } } 
        )
        .exec()
}

module.exports.getPathImagem = album => {
    return __dirname + "/../FileStorage/" + album.artista + "/" + album.nome + "/thumb.jpg"
}

module.exports.search = nome => {
    return Album
        .find({ nome: new RegExp(nome, "i")})
        .exec()
}