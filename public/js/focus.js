window.addEventListener('load', start);

function start(){

    $('#run-focus').click( evt => {
        console.log('clicked')
        if (!is_valid_profile()) return;
        focus(getCurrentUser());
    });

    $('#run-focus-all').click( evt => {
        let profiles = getAllProfiles();
        for (let i=0; i<profiles.length; i++){
            let profile = profiles[i];
            collect_images(profile);
        }
    });

}


/*
@info: run the focus task for the selected profile
*/
function focus(profile){
    let settings = getProfileSettings(profile);
    let hashtags = settings['hashtags'];
    let bot = getProfileBot(profile);

    if (is_running(profile)) {
        show_popup(profile, 'profile busy', getUserAvatarPath(profile), "This profile is busy with other active tasks, stop them and run it again");
        return;
    }

    if(bot) {
        show_popup(profile, 'working', getUserAvatarPath(profile), "focus process has started");
        bot.focus()
    }

    else{
        let bot = new instabot(profile);
        setProfileBot(profile, bot);
        (async () => {
            await bot.setup();
            bot.focus();
        })();
        show_popup(profile, 'processing', getUserAvatarPath(profile), "The focus process will start soon");
    }
    
}