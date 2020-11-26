window.addEventListener('load', start);

function go_to(page){
	let new_page = $(`.page.${page}`);
	if(getCurrentPage()){
		reset();
		if(getCurrentPage()[0] == new_page[0]) return;
	}

	let pages = $(".page");
	pages.each( index => {
		$(pages[index]).css("display", "none");
	});
	ProfilesDatas["currentPage"] = new_page;
	ProfilesDatas["currentPageName"] = page;
	getCurrentPage().css("display", "block");
	getCurrentPage()[0].scrollIntoView();
	populate_profiles();
	populate_form();

	if(page != "images"){
		delete_images();
	}
	if(page != "posts"){
		clear_posts_container();
	}
	if(page != "posts"){
		clear_stories_container();
	}
	if(page != "logs"){
		clear_logs();
	}
	if(page != "dashboard"){
		clear_dashboard();
	} else {
		populate_dashboard();
	}
}

function is_page(page){
	return getCurrentPage().attr("class").includes(page);
}

function start(){

	go_to("profiles");

	$('.nav-section').click( evt => {
		let target = $(evt.currentTarget);
		let link = target.find("a").data("page");
		go_to(link);
	});

}