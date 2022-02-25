const http = require("http")
const url = require("url")
const fs = require("fs")

const port = 7777

function sendNotFound(req, res) {
    res.writeHead(404, {"Content-Type": "text/html; charset=utf8"})
    res.write("<p>Opção inválida...</p>")
    res.end()
}

function sendPage(req, res, path) {
    try {
        fs.readFile(path, function(err, data) {
            if(err) {
                sendNotFound(req, res)
            }
            else {
                res.writeHead(200, {"Content-Type": "text/html; charset=utf8"})
                res.write(data)
                res.end();
            }
        })
    } catch (error) {
        sendNotFound(req, res)
    }
}

// Ler JSON com o path de cada filme
var filmes_paths
fs.readFile("./movieLookupTable.json", function(err, data) {
    if(err) {
        console.log("Erro: Não foi possivel abrir o ficheiro \'moviesLookupTable.json\'")
    }
    else {
        filmes_paths = JSON.parse(data)
    }
})

// Ler JSON com o path de cada ator
var actors_paths
fs.readFile("./actorLookupTable.json", function(err, data) {
    if(err) {
        console.log("Erro: Não foi possivel abrir o ficheiro \'actorsLookupTable.json\'")
    }
    else {
        actors_paths = JSON.parse(data)
    }
})

server = http.createServer(function(req, res) {
    
    args = req.url.substring(1).split("/")
    // URL invalido
    if (args.length == 0) {
        sendNotFound(req, res)
    }
    // Filme em especifico
    if (args[0].match(/(filmes)|(movies)/) && args.length == 2 && args[1] != "") {
        path = filmes_paths[args[1]]
        sendPage(req, res, path)
    }
    // Listar filmes alfabeticamente
    else if (args[0].match(/(filmes)|(movies)/) && args.length == 1 || args[1] == "") {
        path = "./orderedMovies.html"
        sendPage(req, res, path)
    }
    // Ator em especifico
    else if (args[0].match(/(atores)|(actors)/) && args.length == 2 && args[1] != "") {
        path = actors_paths[args[1]]
        sendPage(req, res, path)
    }
    // Listar atores alfabeticamente
    else if (args[0].match(/(atores)|(actors)/) && args.length == 1 || args[1] == "") {
        path = "./orderedActors.html"
        sendPage(req, res, path)
    }
    // Opção Inválida
    else {
        sendNotFound(req, res)
    }
})

server.listen(port)
console.log("Servidor à escuta na porta " + port)