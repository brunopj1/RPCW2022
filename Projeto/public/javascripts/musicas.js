
$(document).ready(function() {
    var playlist = []
    var favoritas = []
    var apagar = []
    var tipo = $("#tipo-user").html()
    var nome = $("#nome-user").html()

    function normal() {
        playlist = []
        $("#criar-div").empty()
        $("#criar-div").append('<button class="botao" id="criar"> Criar Playlist')
        $("#criar-div").append('<button class="botao" id="apagar"> Apagar Musicas')
        $(".botao-playlist").hide()
        $(".botao-apagar").hide()
        $(".botao-favorito").show()
        $.ajax({
            url: endpoint+'/musicas/favoritas',
            type: 'GET',
            success: function(res) {
                $(".botao-favorito").css("background-color", "transparent");
                favoritas = []
                res.forEach(m => {
                    favoritas.push(m.musica)
                    var bot = ".botao-favorito#"+m.musica
                    $(bot).css("background-color", "red");
                });
            }
        });
    }
    
    normal()

    $("body").on('click', '#apagar', function () {
        event.preventDefault()
        $("#criar-div").empty()
       
        $("#criar-div").append('<button class="botao" id="confirmar"> Confirmar')
        $("#criar-div").append('<button class="botao" id="cancelar"> Cancelar')
        $(".botao-playlist").hide()
        $(".botao-favorito").hide()
        if (tipo == "admin") {
            $(".botao-apagar").show()
        } else {
            $(`.${nome}`).show()
        }
    })

    $("body").on('click', '#criar', function () {
        event.preventDefault()
        $("#criar-div").empty()
       
        $("#criar-div").append(`
        <div class="bloco">
            <form id="formulario">
                <label for="nome"> Nome: 
                    <input type="text" name="nome" id="nome" placeholder="Escreva o nome...">
                </label>
                <label for="descricao"> Descrição: 
                    <input type="text" name="descricao" id="descricao" placeholder="Escreva a descricao...">
                </label>
            </form>
        </div>
        `)
        $("#criar-div").append('<button class="botao" id="gravar"> Gravar')
        $("#criar-div").append('<button class="botao" id="cancelar"> Cancelar')
        $(".botao-playlist").show()
        $(".botao-favorito").hide()
    })

    $("body").on('click', '.rem', function() {
        event.preventDefault()
        
        if (apagar.includes(this.id)) {
            $(this).css("background-color", "transparent");
            apagar.pop(this.id)
        } else {
            apagar.push(this.id)
            $(this).css("background-color", "red");
        }
    })
    
    $("body").on('click', '.add', function() {
        event.preventDefault()
        
        if (playlist.includes(this.id)) {
            $(this).css("background-color", "transparent");
            playlist.pop(this.id)
        } else {
            playlist.push(this.id)
            $(this).css("background-color", "green");
        }
    })

    $("body").on('click', '#cancelar', function () {
        event.preventDefault()
        normal()
    })

    $("body").on('click', '#confirmar', function () {
        event.preventDefault()
        $.ajax({
            url: endpoint+'/musicas/',
            data: {musicas: JSON.stringify(apagar)},
            type: 'DELETE',
            success: function(res) {
                apagar.forEach(m => {
                    $("#row-"+m).remove()
                })
                apagar = []
                normal()
                informa(res)
            }
        });
    })

    $("body").on('click', '#gravar', function () {
        event.preventDefault()
        if ($("#nome").val() != "" && $("#descricao").val() != "") {
            $.ajax({
                url: endpoint+'/playlists/',
                data: {nome: $("#nome").val(), descricao: $("#descricao").val(), musicas: JSON.stringify(playlist)},
                type: 'POST',
                success: function(res) {
                    playlist = []
                    normal()
                    informa(res)
                }
            });
        } else {
            alert("Prencha todos os campos!")
        }
    })

    $("body").on('click', '.favorito', function () {
        event.preventDefault()
        if (favoritas.includes(this.id)) {
            $.ajax({
                url: endpoint+'/musicas/remover/',
                data: { _id: this.id },
                type: 'PUT',
                success: function(res) {
                    console.log(res)
                    normal()
                }
            });
        } else {
            $.ajax({
                url: endpoint+'/musicas/favoritas/',
                data: { _id: this.id },
                type: 'PUT',
                success: function(res) {
                    console.log(res)
                    normal()
                }
            });
        }
    })

    $(document).ready(function() {
        $("#procurar").on("keyup", function() {
            var value = $(this).val().toLowerCase();
            $(".row").filter(function() {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
        });
      });
    
    $("body").on('click', '#botao-plays', function () {
        event.preventDefault()
        
    })

})
