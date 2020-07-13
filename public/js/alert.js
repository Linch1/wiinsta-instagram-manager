window.addEventListener('load', start);

// dispay the warining eith the passed html
// innerhtml: string
function show_warning(innerhtml){
	$('.alert .alert-text').html(innerhtml);
	$('.alert').addClass('inview');
}

// display the alert with an input inside and the html passed as param
// innerhtml: string
function show_warning_input(innerhtml){
	$('.alert .alert-text').html(
		innerhtml + 
		`<div class="alert-form">
			 <input type="number" id="warning_input" >
			 <i id="warning_input_send" class="fas fa-share"></i>
		 </div>`
	);
	$('.alert').addClass('inview');
}

function show_warning_confirm(innerhtml){
	$('.alert .alert-text').html(
		innerhtml + 
		`<div class="alert-buttons">
		 	<div class="confirm"><strong>Yes</strong></div>
			 <div class="close"><strong>No</strong></div>
		 </div>`
	);
	$('.alert').addClass('inview');
}

function close_alert(){
	$('.alert').removeClass('inview');
}

function start(){

	// Close the alert from the right-upper cross
	$('.alert .alert-close').click(evt => {
		$('.alert').removeClass('inview');
	});

	/*
	WARNING_INPUT_CODE  store the code wrote in the alert input
	WARNING_INPUT_NOT_SENT  check if the 2FA code is sent or not

	If the API require the 2FA an alert with an input inside is displayed and
	the user can insert the code
	*/
	$('body').click( e => {
		let target = $(e.target);
		if (target.attr("id") == "warning_input_send"){
			WARNING_INPUT_CODE = $("#warning_input").val().trim();
			if(is_numeric(WARNING_INPUT_CODE) === true && WARNING_INPUT_CODE != ''){
				console.log("valid string");
				WARNING_INPUT_NOT_SENT = null;
				$('.alert .alert-close').click();
			}
		}
	});
}