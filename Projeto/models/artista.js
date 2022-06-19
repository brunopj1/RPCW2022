const mongoose = require("mongoose")

var redeSchema = new mongoose.Schema({
    tipo: String,
    link: String,
})

var artistaSchema = new mongoose.Schema({
    nome: String,
    biografia: String,
    user: String,
    moods: [String],
    redes: [redeSchema]
})

module.exports = mongoose.model("artista", artistaSchema)