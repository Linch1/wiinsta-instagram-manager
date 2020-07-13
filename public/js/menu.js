window.addEventListener('load', start);

function start(){
	$('.title-bar .close').click( evt => {
		mainWin.close();
	});

	$('.title-bar .minimize').click( evt => {
		mainWin.minimize();
	});

	$('.title-bar .maximize').click( evt => {
		mainWin.maximize();
	});

}