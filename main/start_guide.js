window.addEventListener('load', start);

function start() {
	$(".guide-image.start").click( () => {
	    open("https://github.com/Linch1/wiinsta-instagram-manager");
	    console.log("un")
	});
	$( "a.help-link" ).click( evt => {
	    let modal = $(evt.currentTarget).attr("data-reveal-id");
	    console.log(modal)
	    setTimeout( () => {
	    	let elem = $(`#${modal}`).find(".getting-started-guide")[0];
	    	if ( elem ) elem.slick.setPosition();
	    }, 250);
	});
};