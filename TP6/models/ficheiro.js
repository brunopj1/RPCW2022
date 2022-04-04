var mongoose = require('mongoose')

var ficheiroSchema = new mongoose.Schema({
    _id: String,
    descricao: String,
    tipo: String,
    tamanho: Number
})

module.exports = mongoose.model('ficheiro', ficheiroSchema)