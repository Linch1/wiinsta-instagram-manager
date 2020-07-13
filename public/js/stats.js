window.addEventListener("load", start);

function start(){
	// MODIFICA L'ICONA E ABILITA IL LINK QUANDO SI VUOLE ELIMINARE UNA DOMANDA
	$('.selectem-value').change( evt => {
		if(is_page("stats")){
			if(!is_valid_profile()) return;
			draw_stats();
		}
	});

}