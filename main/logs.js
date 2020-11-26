window.addEventListener("load", start);

function start(){
	var delete_button_active = null;
	let post;
	let filter = "all"
	// MODIFICA L'ICONA E ABILITA IL LINK QUANDO SI VUOLE ELIMINARE UNA DOMANDA

	$('.selectem-value').change( evt => {
		let type = $("select.type").val().trim();
		if (!is_page("logs")) return;
		if(!is_valid_profile()){
			show_popup('wiinsta', 'invalid profile', LOGO_PATH, "select a profile");
			return;
		}
		clear_logs();
		populate_logs(filter);
	});

	$('.log-type').change( evt => {
		let type = $("select.type").val().trim();
		if (!is_page("logs")) return;
		if(!is_valid_profile()){
			return;
		}
		clear_logs();
		filter = $('.log-type').val().trim();
		populate_logs(filter);
	});
}