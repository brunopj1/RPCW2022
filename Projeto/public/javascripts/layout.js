
const endpoint = 'http://localhost:5000'

function informa(mensagem) {
    $("#snackbar").empty()
    // Get the snackbar DIV
    $(function() {
        $("#snackbar").append(mensagem);

        // Add the "show" class to DIV
        $("#snackbar").addClass("show");

        // After 3 seconds, remove the show class from DIV
        setTimeout(function() { 
            $("#snackbar").removeClass("show")
            $("#snackbar").empty()
        }, 3000);
    })
}

function redirecionar(path) {
    location.href = path
}