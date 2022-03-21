const http = require("http")
const url = require("url")
const qs = require("querystring")
const axios = require("axios")
const fs = require("fs")

const indexTemplate = `
<!DOCTYPE html>
<html>
    <head>
        <title>Document</title>
        <meta charset="UTF-8">
        <link rel="stylesheet" href="/resources/styles.css">
        <script type="text/javascript" src="/resources/functions.js"></script>
    </head>
    <body>
        <form id="input-bar" action="/new">
            <div class="input-bar-text">
                <label class="input-bar-text-title" for="descricao">Descrição da tarefa:</label><br>
                <textarea class="input-bar-text-textarea" id="descricao" name="descricao" required="true"
                          placeholder="Insira a descricao da tarefa"></textarea>
            </div>
            
            <div class="input-bar-options">
                <div>
                    <label class="input-bar-options-label" for="responsavel">Responsavel:</label><br>
                    <input type="text" id="responsavel" name="responsavel" required="true"
                           placeholder="Insira o nome">
                </div>

                <div>
                    <label class="input-bar-options-label" for="tipo">Tipo:</label><br>
                    <select id="tipo" name="tipo" required="true">
                        <option value="" selected disabled hidden>Selecione uma das opções</option>
                        <option value="normal">Normal</option>
                        <option value="prioritaria">Prioritária</option>
                    </select>
                </div>

                <div>
                    <label class="input-bar-options-label" for="dataLimite">Data Limite:</label><br>
                    <input type="date" id="dataLimite" name="dataLimite" required="true">
                </div>
            </div>

            <input class="input-bar-submit" type="submit" value="Guardar"
                   action="window.location.href = 'https://localhost:4000/';">
        </form>
        <div class="main-area">
            <div class="task-list" id="task-list-por-realizar">
                <div class="task-list-title"><b>Por Realizar</b></div>
                <div class="task-list-container">
                    \${TASKS-POR-REALIZAR}
                </div>
            </div>
            <div class="task-list" id="task-list-realizadas">
                <div class="task-list-title"><b>Realizadas</b></div>
                <div class="task-list-container">
                    \${TASKS-REALIZADAS}
                </div>
            </div>   
        </div>
    </body>
</html>
`

const taskTemplate = `
<div class="task" id="task\${ID}"
    data-responsavel="\${RESPONSAVEL}"
    data-tipo="\${TIPO}"
    data-dataCriacao="\${DATACRIACAO}"
    data-dataLimite="\${DATALIMITE}">
    \${STAR}
    <div class="task-text">\${DESCRICAO}</div>
    <button class="task-button-delete" onclick="deleteTask(this)">
        <div class="task-button-image"></div>
    </button>
    <button class="task-button-edit" onClick="editTask(this)">
        <div class="task-button-image"></div>
    </button>
    <button class="task-button-\${TYPE}" onclick="moveTask(this)">
        <div class="task-button-image"></div>
    </button>
</div>
`

const starTemplate = `
<div class="task-star-container">
    <div class="task-star"></div>
</div>
`

function sendHomepage(res) {
    axios.get("http://localhost:3000/tarefas")
        .then(axios_res => {
            // Criar o html das tasks
            tasksPorRealizar = ""
            tasksRealizadas = ""
            axios_res.data.forEach(task => {
                // Ignore deleted tasks
                if (task.eliminada == "false") {
                    // Create string
                    task_str = taskTemplate
                        .replace("${ID}", task.id)
                        .replace("${DESCRICAO}", task.descricao)
                        .replace("${RESPONSAVEL}", task.responsavel)
                        .replace("${TIPO}", task.tipo)
                        .replace("${DATACRIACAO}", task.dataCriacao)
                        .replace("${DATALIMITE}", task.dataLimite)
                        .replace("${STAR}", task.tipo == "normal" ? "" : starTemplate)
                    // Save string
                    if (task.realizada == "true") {
                        tasksRealizadas += task_str
                            .replace("${TYPE}", "undo")
                    }
                    else {
                        tasksPorRealizar += task_str
                            .replace("${TYPE}", "done")
                    }
                }
            })

            // Criar o html da pagina
            page = indexTemplate
                    .replace("${TASKS-POR-REALIZAR}", tasksPorRealizar)
                    .replace("${TASKS-REALIZADAS}", tasksRealizadas)

            // Enviar
            res.writeHead(200, {"Content-Type": "text/html; charset=utf8"})
            res.write(page)
            res.end();
        }).catch(error => {
            console.log(error);
            sendNotFound(res)
        })
}

function sendFile(res, path) {
    fs.readFile("." + path, (error, data) => {
        if (error) {
            sendNotFound(res)
            console.log(error);
        }
        else {
            // Determinar o tipo
            fileType = path.match(/^\/[^\.]+\.(.+)$/)[1]
            switch (fileType) {
                case "html": { fileType = "text/html"; break; }
                case "css": { fileType = "text/css"; break; }
                case "png":  { fileType = "image/png"; break; }
                case "js": { fileType = "text/javascript"; break; }
                default:  { console.log("ERRO: Adicionar extensão ao switch!") }
            }
            // Enviar ficheiro
            res.writeHead(200, {"Content-Type": `${fileType}; charset=utf8`})
            res.write(data)
            res.end();
        }
    })
}

function sendNotFound(res) {
    res.writeHead(404, {"Content-Type": "text/html; charset=utf8"})
    res.write("<p>Opção inválida...</p>")
    res.end()
    
    console.log("The last request was invalid");
}

function redirectToHomepage(res) {
    res.writeHead(302, { 'Location': 'http://localhost:4000/' });
    res.end();
}

function createTask(res, taskData) {
    // Data de hoje
    today = new Date()
    dataCriacao = "" + today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate()
    // Criar a task
    task = {
        "descricao": taskData.descricao,
        "responsavel": taskData.responsavel,
        "tipo": taskData.tipo,
        "dataCriacao": dataCriacao,
        "dataLimite": taskData.dataLimite,
        "realizada": "false",
        "eliminada": "false"
    }
    // Post the task
    axios.post("http://localhost:3000/tarefas", task)
        .then(axios_res => {
            redirectToHomepage(res)
        })
        .catch(error => {
            console.log(error);
            sendNotFound(res)
        })
}

function editTask(res, id, data) {
        // Get the task
        axios.get("http://localhost:3000/tarefas?id=" + id)
        .then(axios_res => {
            // Update the task
            task = axios_res.data[0]
            task.descricao = data.descricao
            task.responsavel = data.responsavel
            task.tipo = data.tipo
            task.dataLimite = data.dataLimite
            // Send the updated task
            axios.put("http://localhost:3000/tarefas/" + id, task)
                .then(axios_res1 => {
                    redirectToHomepage(res)
                })
                .catch(error => {
                    console.log(error);
                    sendNotFound(res)
                })
        // Error 2
        }).catch((error) => {
            console.log(error);
            sendNotFound(res)
        })
}

function moveTask(res, id, realizada) {
    // Get the task
    axios.get("http://localhost:3000/tarefas?id=" + id)
        .then(axios_res => {
            // Update the task
            task = axios_res.data[0]
            task.realizada = realizada
            // Send the updated task
            axios.put("http://localhost:3000/tarefas/" + id, task)
                .then(axios_res1 => {
                    redirectToHomepage(res)
                })
                .catch(error => {
                    console.log(error);
                    sendNotFound(res)
                })
        // Error 2
        }).catch((error) => {
            console.log(error);
            sendNotFound(res)
        })
}

function deleteTask(res, id) {
    // Get the task
    axios.get("http://localhost:3000/tarefas?id=" + id)
        .then(axios_res => {
            // Update the task
            task = axios_res.data[0]
            task.eliminada = "true"
            // Send the updated task
            axios.put("http://localhost:3000/tarefas/" + id, task)
                .then(axios_res1 => {
                    redirectToHomepage(res)
                })
                .catch(error => {
                    console.log(error);
                    sendNotFound(res)
                })
        // Error 2
        }).catch((error) => {
            console.log(error);
            sendNotFound(res)
        })
}

server = http.createServer(function(req, res) {
    // Log the request
    console.log(`Request: ${new Date().toISOString()} ${req.method} ${req.url}`);

    // Send the html file
    if (req.url == "/") {
        sendHomepage(res)
    }
    // Send other files
    else if (req.url.match(/\/resources\/.*/)) {
        sendFile(res, req.url)
    }
    // New Task
    else if (req.url.match(/\/new\?.+/)) {
        data = qs.parse(url.parse(req.url).query)
        createTask(res, data)
    }
    // Move Task
    else if (req.url.match(/\/move\?.+/)) {
        data = qs.parse(url.parse(req.url).query)
        moveTask(res, data.id, data.realizada)
    }
    // Edit Task
    else if (req.url.match(/\/edit\/\d+\?.+/)) {
        id = req.url.match(/\/edit\/(\d+)\?.+/)[1]
        data = qs.parse(url.parse(req.url).query)
        editTask(res, id, data)
    }
    // Delete Task
    else if (req.url.match(/\/delete\?.+/)) {
        data = qs.parse(url.parse(req.url).query)
        deleteTask(res, data.id)
    }
    // Error
    else {
        sendNotFound(res)
    }
})

server.listen(4000)
console.log("Servidor aberto em http://localhost:4000/")