var express = require('express');
var url = require("url")
var axios = require("axios");
const { query } = require('express');
var router = express.Router();

function renderPaginaMusicas(res, path) {
  axios.get(path)
    .then(response => {
			res.render("musicas", { title: "Musicas", musicas: response.data });
		})
		.catch(error => {
			res.render("error", { title: "Musicas", error: error })
		})
}

router.get('/', function(req, res, next) {
  renderPaginaMusicas(res, "http://localhost:3000/musicas")
});

router.get('/musicas', function(req, res, next) {
  renderPaginaMusicas(res, "http://localhost:3000/musicas")
});

router.get('/musicas/inserir', function(req, res, next) {
  res.render("nova-musica", { title: "Nova Musica" })
});

router.post('/musicas/inserir/submit', function(req, res, next) {
	
	musica = {
		"prov": req.body.prov,
		"local": req.body.local,
		"tit": req.body.titulo,
		"musico": req.body.musico,
		"file": req.body.file,
		"fileType": req.body.tipo,
		"duracao": req.body.duracao
	}

	axios.post(`http://localhost:3000/musicas`, musica)
    .then(response => {
			res.redirect("/musicas")
		})
		.catch(error => {
			res.render("error", { title: "Musica", error: error })
		})
});

router.get('/musicas/:id', function(req, res, next) {
  axios.get(`http://localhost:3000/musicas?id=${req.params.id}`)
    .then(response => {
			res.render("musica", { title: "Musica", musica: response.data[0] })
		})
		.catch(error => {
			res.render("error", { title: "Musica", error: error })
		})
});

router.get('/musicas/prov/:id', function(req, res, next) {
  axios.get(`http://localhost:3000/musicas?prov=${req.params.id}`)
    .then(response => {
			res.render("musicas", { title: "Musica", musicas: response.data })
		})
		.catch(error => {
			res.render("error", { title: "Musica", error: error })
		})
});

module.exports = router;
