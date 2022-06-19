const mongoose = require('mongoose')

const { notificacaoSchema, notificacaoModel } = require('./notificacao');


var musicaFavorita = new mongoose.Schema({
    musica: String,
    data: String,
})

var userSchema = new mongoose.Schema({
    nome: String,
    password: String,
    tipo: String,
    ultimaMusica: String,
    musicas: Number,
    foto: Boolean,
    artista: String,
    musicasFavoritas: [musicaFavorita],
    playlistsFavoritas: [String],
    notificacoes: [notificacaoSchema]
})

module.exports = mongoose.model('user',userSchema)