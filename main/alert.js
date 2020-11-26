window.addEventListener('load', start);


function build_popup(settings){
	let popup = $(`
		<div class="alert">
			<div class="remove"></div>
		
			<div class="body">
				<div class="profile">${settings.profile}</div>
				<div class="title">${settings.title}</div>
			</div>
		</div>
	`);

	let body = popup.find('.body');


	if( settings.image ){
		let image = $(`
			<img src="${settings.image}">
		`)
		popup.prepend(image);
	} if ( settings.input ){
		let input = $(`
			<div class="form">
				<input type="number" id="warning_input" >
				<div id="warning_input_send"></div>
			</div>
		`);
		body.append(input);
	} if ( settings.choice ){
		let choice = $(`
			<div class="form">
				<div class="button confirm"><strong>Yes</strong></div>
				<div class="button close"><strong>No</strong></div>
			</div>
		`);
		body.append(choice);
	} if ( settings.content ){

		let content = $(`
		<div class="content"></div>
		`);
		
		let lista = settings.content.split("$/link/");
		for(let i = 0; i < lista.length; i ++){
			let current = lista[i];
			if(current.startsWith("http")) content.append($(`<span class="external-link">${current}</span>`));
			else content.append($(`<span>${current}</span>`));
		}
		
		body.append(content);
	}
	
	return popup;
}

function show_popup(profile, title, icon, content){
	let popup = build_popup({
		image: icon, // image path
		title: title, // popup title
		profile: profile, // profile which the popup is related to
		input: false, // true/false
		choice: false, // true/false
		content: content // content of the popup
	});
	$('.alerts').prepend(popup);
	popup.addClass('inview');
}

// display the alert with an input inside and the html passed as param
// innerhtml: string
function show_popup_input(profile, title, icon, content){
	let popup = build_popup({
		image: icon, // image path
		title: title, // popup title
		profile: profile, // profile which the popup is related to
		input: true, // true/false
		choice: false, // true/false
		content: content // content of the popup

	});
	$('.alerts').prepend(popup);
	popup.addClass('inview');
}

function show_popup_choice(profile, title, icon, content){
	let popup = build_popup({
		image: icon, // image path
		title: title, // popup title
		profile: profile, // profile which the popup is related to
		input: false, // true/false
		choice: true, // true/false
		content: content // content of the popup

	});
	$('.alerts').prepend(popup);
	popup.addClass('inview');
}




function close_popup(popup){ // da rimuovere
	popup.removeClass('inview');
	setTimeout( () => {
		popup.remove();
	}, 600);
}

function start(){

	// show_popup_choice('wiinsta', 'test title', '../../public/img/avatars/8.png', `Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
	// 					tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
	// 					quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
	// 					consequat. $/link/https://google.com$/link/`);

	// show_popup_input('wiinsta', 'test title', '../../public/img/avatars/8.png', `Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
	// 					tempor incididunt ut labore et dolore magna aliqua. $/link/https://google.com$/link/`);

	// show_popup('wiinsta', 'test title', '../../public/img/avatars/8.png', `Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
	// 					tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
	// 					quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
	// 					consequat. $/link/https://google.com$/link/`);


	

	/*
	WARNING_INPUT_CODE  store the code wrote in the alert input
	WARNING_INPUT_NOT_SENT  check if the 2FA code is sent or not

	If the API require the 2FA an alert with an input inside is displayed and
	the user can insert the code
	*/
	$('body').click( e => {

		let target = $(e.target);
		// Close the alert from the right-upper cross
		if (target.is(".alert .remove")){
			let parent = $(e.target).closest('.alert');
			close_popup(parent);
		} 

		if (target.attr("id") == "warning_input_send"){
			WARNING_INPUT_CODE = $("#warning_input").val().trim();
			if(is_numeric(WARNING_INPUT_CODE) === true && WARNING_INPUT_CODE != ''){
				WARNING_INPUT_NOT_SENT = null;
				let popup = $(target).closest('.alert');
				close_popup(popup);
			}
		}

		if ( target.is(".external-link")){
			open(target.text());
		}
	});
}