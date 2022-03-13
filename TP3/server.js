const axios = require("axios")
const http = require("http")
const url = require("url")

function sendHomepage(res) {
    html = `
    <!doctype html>
    <html>
        <head>
            <title>Homepage</title>
            <meta charset="utf-8">
        </head>
        <body>
            <h1>Escola de Musica</h1>
            <p><a href="/alunos">Lista dos alunos</a></p>
            <p><a href="/cursos">Lista dos cursos</a></p>
            <p><a href="/instrumentos">Lista dos instrumentos</a></p>
        </body>
    </html>
    `

    res.writeHead(200, {"Content-Type": "text/html; charset=utf8"})
    res.write(html)
    res.end()
}

function sendTablePage(res, url) {
    // Get the json
    axios.get("http://localhost:3000" + url)
    .then(axios_res => {
        // Get type
        type = url.substring(1).split(/\/|\?/)[0]
        // Create the html
        html = createTablePageHtml(axios_res.data, type)
        // Send the page
        res.writeHead(200, {"Content-Type": "text/html; charset=utf8"})
        res.write(html)
        res.end()
    })
    .catch(error => {
        console.log(error);
        sendNotFound(res)
    })
}

function createTablePageHtml(json, type) {

    table = ""
    if (type == "alunos") table = createTableAlunos(json)
    else if (type == "cursos") table = createTableCursos(json)
    else if (type == "instrumentos") table = createTableInstrumentos(json)

    // Html document
    html = `
    <!doctype html>
    <html>
        <head>
            <title>${type}</title>
            <meta charset="utf-8">
        </head>
        <style>
            table, th, td {
                border:1px solid black;
            }
        </style>
        <body>
            <table style="width:100%">
                ${table}
            </table>
        </body>
    </html>`

    return html
}

function createTableAlunos(json) {
    // Table Header
    table = `
    <tr>
        <th>ID</th>
        <th>Nome</th>
        <th>Data de Nascimento</th>
        <th>Curso</th>
        <th>Ano do Curso</th>
        <th>Instrumento</th>
    </tr>`

    // Table rows
    for (elem of json) {
        // Formatar o nome
        nome = elem.nome.split(' ').map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        }).join(' ');

        // Formatar a data
        dataNasc = elem.dataNasc.split("-").reverse().join("-")

        // Criar a string
        table += `
        <tr>
            <td>${elem.id}</td>
            <td>${nome}</td>
            <td>${dataNasc}</td>
            <td><a href="/alunos?curso=${elem.curso}">${elem.curso}</a></td>
            <td>${elem.anoCurso}</td>
            <td><a href="/alunos?instrumento=${elem.instrumento}">${elem.instrumento}</a></td>
        </tr>`
    }

    return table
}

function createTableCursos(json) {
    // Table Header
    table = `
    <tr>
        <th>ID</th>
        <th>Designação</th>
        <th>Duração</th>
        <th>ID do Instrumento</th>
        <th>Nome do Instrumento</th>
    </tr>`

    // Table rows
    for (elem of json) {
        table += `
        <tr>
            <td><a href="/alunos?curso=${elem.id}">${elem.id}</a></td>
            <td>${elem.designacao}</td>
            <td>${elem.duracao}</td>
            <td>${elem.instrumento.id}</td>
            <td><a href="/cursos?instrumento.id=${elem.instrumento.id}">${elem.instrumento["#text"]}</a></td>
        </tr>`
    }

    return table
}

function createTableInstrumentos(json) {
        // Table Header
        table = `
        <tr>
            <th>ID</th>
            <th>Nome</th>
        </tr>`
    
        // Table rows
        for (elem of json) {
            table += `
            <tr>
                <td><a href="/cursos?instrumento.id=${elem.id}">${elem.id}</a></td>
                <td><a href="/alunos?instrumento=${elem["#text"]}">${elem["#text"]}</a></td>
            </tr>`
        }
    
        return table
}

function sendNotFound(res) {
    res.writeHead(404, {"Content-Type": "text/html; charset=utf8"})
    res.write("<p>Opção inválida...</p>")
    res.end()
}

// Script

server = http.createServer(function(req, res) {

    // Log the request
    console.log("Request: " + req.url);

    // Process the url
    //args = req.url.substring(1).split("/")
    //query = url.parse(req.url, true).query

    // Homepage
    if (req.url == "/") {
        sendHomepage(res)
    }
    
    // Table Page
    else if (req.url.match(/\/(alunos|cursos|instrumentos)(\/.*)?/)) {
        sendTablePage(res, req.url)
    }

    // Not found
    else {
        sendNotFound(res)
    }
})

server.listen(4000)
console.log("Servidor à escuta na porta 4000")