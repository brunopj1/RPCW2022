function moveTask(elem) {
    taskID = elem.parentNode.id.match(/task(\d+)/)[1]
    tipo = elem.parentNode.parentNode.parentNode.id
    realizada = tipo == "task-list-realizado"
    window.location.href = `http://localhost:4000/move?id=${taskID}&realizada=${realizada}`
}

function editTask(elem) {
    // Get the task
    task = elem.parentNode

    // Update the input bar
    id = task.id.match(/task(\d+)/)[1]
    document.getElementById("input-bar").action = "/edit/" + id

    descricao = task.getElementsByClassName("task-text")[0].innerHTML
    document.getElementById("descricao").value = descricao
    
    responsavel = task.dataset.responsavel
    document.getElementById("responsavel").value = responsavel

    tipo = task.dataset.tipo
    document.getElementById("tipo").value = tipo

    dataLimite = task.dataset.datalimite
    document.getElementById("dataLimite").value = dataLimite
}

function deleteTask(elem) {
    taskID = elem.parentNode.id.match(/task(\d+)/)[1]
    window.location.href = `http://localhost:4000/delete?id=${taskID}`
}