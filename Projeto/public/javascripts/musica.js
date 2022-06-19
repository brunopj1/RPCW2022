

var playBtn = document.getElementById('play-btn')
var stopBtn = document.getElementById('stop-btn')
var volumeBtn = document.getElementById('volume-btn')

var id = document.getElementById('id-musica').innerHTML

var wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: 'white',
    progressColor: 'crimson',
    barWidth: 4,
    height: 80,
    responsive: true,
    hideScrollbar: true,
    barRadious: 6,
    cursorColor: "white"
});

wavesurfer.load('/musicas/ouvir/'+id);

playBtn.onclick = () => {
    wavesurfer.playPause()
    if (playBtn.src.includes("/images/play.png")) {
        playBtn.src = "/images/pause.png"
    } else {
        playBtn.src = "/images/play.png"
    }
}

stopBtn.onclick = () => {
    wavesurfer.stop()
    playBtn.src = "/images/play.png"
}

volumeBtn.onclick = () => {
    wavesurfer.toggleMute()
    if (volumeBtn.src.includes("/images/volume.png")) {
        volumeBtn.src = "/images/mute.png"
    } else {
        volumeBtn.src = "/images/volume.png"
    }
}

wavesurfer.on('finish', () => {
    playBtn.src = "/images/play.png"
    wavesurfer.stop()
});


$(document).ready(function() {

    var favorita
    var id = $("#id-musica").html()

    function normal() {
        $("#comentarios").empty()
        $.ajax({
            url: endpoint+'/musicas/'+id+'/comentarios',
            type: 'GET',
            success: function(res) {

                if (res.comentarios.length > 0) {
                    
                    var htmlComentarios = `
                    <hr class="linhaPequena">
                    <h2 class="titulo">Comentários</h2>
                    <span class="atualizar"><button class="botao" id="atualizar"> Atualizar <i class="fa-solid fa-spinner fa-sm"></i></button></span>
                        <table id="tabela">
                            <tbody>
                                <tr class="cabecalho">
                                    <th class="botao-a" onclick="sortTable(0,false)">Comentario</th>
                                    <th class="botao-a" onclick="sortTable(1,false)">Autor</th>
                                    <th class="botao-a" onclick="sortTable(2,false)">Data</th>
                                </tr>
                    `
                    res.comentarios.forEach(c => {
                        htmlComentarios += `
                            <tr id="comentario-${c._id}" class="tabela-linha">
                                <td>${c.comentario}</td>
                                <td><a class="botao-a" href="/users/${c.nome}">${c.nome}</a></td>
                                <td>${c.data}</td>`
                            if (c.nome == res.user.nome || res.user.tipo == "admin") {
                                htmlComentarios += `
                                    <td>
                                        <button id=${c._id} class="botao-tab remover"> ✖
                                    </td>
                                    `
                            }

                        htmlComentarios +=`
                            </tr>
                        `
                    })

                    htmlComentarios += `
                        </tbody>
                    </table>
                    `
                    
                    $("#comentarios").append(htmlComentarios)
               } 
            }
        });
        $.ajax({
            url: endpoint+'/musicas/favoritas',
            type: 'GET',
            success: function(res) {
                res.forEach(f => {
                    if (f.musica == id) {
                        favorita = true
                    } 
                })
                if (!favorita) {
                    $(".favorito").css("background-color", "white");
                } else {
                    $(".favorito").css("background-color", "red");
                }
            }
        })
    }

    normal()

    $("body").on('click', '#comentar', function () {
        event.preventDefault()
        if ($("#comentario").val() != "") {
            $.ajax({
                url: endpoint+'/musicas/comentario/'+id,
                data: $("#comentario-form").serialize(),
                type: 'POST',
                success: function(res) {
                    $("#comentario").val("")
                    normal()
                    informa(res)
                }
            });
        } else {
            informa("Escreva algo...")
        }
    })

    $("body").on('click', '.remover', function () {
        event.preventDefault()
        $.ajax({
            url: endpoint+'/musicas/comentario/'+id,
            data: { _id: this.id },
            type: 'DELETE',
            success: function(res) {
                normal()
                informa(res)
            }
        });
    })

    $("body").on('click', '.favorito', function () {
        event.preventDefault()
        if (favorita) {
            $.ajax({
                url: endpoint+'/musicas/remover/',
                data: { _id: this.id },
                type: 'PUT',
                success: function(res) {
                    favorita = false
                    $(".favorito").css("background-color", "white");
                }
            });
        } else {
            $.ajax({
                url: endpoint+'/musicas/favoritas/',
                data: { _id: this.id },
                type: 'PUT',
                success: function(res) {
                    favorita = true
                    $(".favorito").css("background-color", "red");
                }
            });
        }
    })

    
    $("body").on('click', '#atualizar', function () {
        event.preventDefault()
        normal()
    })

})