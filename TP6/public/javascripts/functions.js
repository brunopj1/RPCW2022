function eliminarFicheiro(elem) {
    id = elem.parentNode.parentNode.cells[0].textContent
    window.location.href = `http://localhost:4000/eliminarFicheiro/${id}`
}