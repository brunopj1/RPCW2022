const mongoose = require("mongoose")

const { comentarioSchema, comentarioModel } = require('./comentario');


var playlistSchema = new mongoose.Schema({
    nome: String,
    descricao: String,
    autor: String,
    data: String,
    musicas: [String],
    comentarios: [comentarioSchema]
})

module.exports = mongoose.model("playlist", playlistSchema)