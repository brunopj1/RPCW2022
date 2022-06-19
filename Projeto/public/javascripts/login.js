

$(function() {
    $("body").on('click', '#login', () => {
        event.preventDefault()
        $("#resposta").empty()
        $.ajax({
            url: endpoint+'/autenticar/login',
            data: $("#formulario").serialize(),
            type: 'POST',
            success: function(data) {
                if (data.erro != undefined) {
                    $("#nome").val("")
                    $("#password").val("")
                    informa(data.erro)
                } else {
                    window.location.replace(endpoint)
                }
            }
        });
    })
})