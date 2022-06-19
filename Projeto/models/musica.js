const mongoose = require("mongoose")

const { comentarioSchema, comentarioModel } = require('./comentario');

var musicaSchema = new mongoose.Schema({
    nome: String,
    album: String,
    artista: String,
    oficial: Boolean,
    plays: Number,
    numero: Number,
    user: String,
    duracao: String,
    comentarios: [comentarioSchema]
})

module.exports = mongoose.model("musica", musicaSchema)