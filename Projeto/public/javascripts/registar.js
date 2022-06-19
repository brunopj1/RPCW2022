

$(function() {
    $("body").on('click', '#registar', function () {
        event.preventDefault()
        $("#resposta").empty()


        if ($("#tipo").val() == "") {
            alert("Selecione um tipo")
        } else if ($("#nome").val() == "" || $("#password").val() == "") {
            alert("Preencha os campos")
        } else {
            $.ajax({
                url: endpoint+'/autenticar/registar',
                data: $("#formulario").serialize(),
                type: 'POST',
                success: function(data) {
                    if (data.erro != undefined) {
                        $("#nome").val("")
                        $("#password").val("")
                        $("#passEspecial").val("")
                        informa(data.erro)
                    } else {
                        window.location.replace(endpoint)
                    }
                }
            });
        }
    })

    $("body").on('click', '#tipo', function () {
        event.preventDefault()

        $("#passEspecial").remove()

        if ($("#tipo").val() == "admin" || $("#tipo").val() == "produtor") {
            var html = `
            <label id="passEspecial" for="passEspecial"> Password especial: 
            <input id="passEspecial" type='password' name='passEspecial' placeholder='Escreva a pass especial...'>
            `
            $("#formulario").prepend(html)
        }
        
    })
})