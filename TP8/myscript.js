$(document).ready(function() {

	// Esconder as partes de edição
	$("#a-editar").hide()
	$("#apagar").hide()
	$("#cancelar").hide()

	$("#guardar").click(function(event) {
		event.preventDefault()
		// Terminar a edição
		$("#a-editar").hide()
		$("#apagar").hide()
		$("#cancelar").hide()
		// Se for uma nova mensagem
		if ($("#a-editar").attr("data-id") == "") {
			id = $("#mensagens").find("tbody").children().length
			mensagem = $("textarea").val()
			$("#mensagens").find("tbody").append(`
				<tr id="${id}">
					<td>${id}</td>
					<td>${mensagem}</td>
					<td><button class="editar">Editar</button></td>
        		</tr>
			`)
		}
		// Se for uma edição
		else {
			id = $("#a-editar").attr("data-id")
			mensagem = $("textarea").val()
			$("#" + id).children().eq(1).html(mensagem)
		}
		// Dar clear ao form
		$("#a-editar").attr("data-id", "")
		$("textarea").val("")
	});

	$("#apagar").click(function(event) {
		event.preventDefault()
		// Terminar a edição
		$("#a-editar").hide()
		$("#apagar").hide()
		$("#cancelar").hide()
		// Guardar o proximo ID
		proxID = $("#mensagens").find("tbody").children().length
		// Apagar a mensagem
		id = $("#a-editar").attr("data-id")
		$("#" + id).remove()
		// Atualizar os IDs
		for (i = parseInt(id) + 1; i < proxID; i++) {
			$("#" + i).children().eq(0).html(i - 1)
			$("#" + i).attr("id", i - 1)
		}
		// Dar clear ao form
		$("#a-editar").attr("data-id", "")
		$("textarea").val("")
	});

	$("#cancelar").click(function(event) {
		event.preventDefault()
		// Terminar a edição
		$("#a-editar").hide()
		$("#apagar").hide()
		$("#cancelar").hide()
		// Dar clear ao form
		$("#a-editar").attr("data-id", "")
		$("textarea").val("")
	});

	$(document).on("click", ".editar", function(event) {
		event.preventDefault()
		// Dar clear ao form
		$("#a-editar").attr("data-id", "")
		$("textarea").val("")
		// Iniciar a edição
		$("#a-editar").show()
		$("#apagar").show()
		$("#cancelar").show()
		// Atualizar o id da mensagem a editar
		id = $(this).parent().parent().attr("id")
		$("#a-editar").attr("data-id", id)
		$("#a-editar").find("p").text("A editar: #" + id)
	});

});