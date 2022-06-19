const mongoose = require('mongoose')

var notificacaoSchema = new mongoose.Schema({
    autor: String,
    artista: String,
    data: String,
    fonte: String,
    idFonte: String
})

var notificacaoModel = mongoose.model('notificacao',notificacaoSchema)

module.exports = {
    notificacaoSchema,
    notificacaoModel,
  };
  