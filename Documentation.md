# 🤖 Wiinsta DOCS

> ⛔ **DISCLAIMER 1**: This is an **unofficial** library and offers no warranty! The developers and contributors of the project do not assume any responsibility in case of ban of your account. Use of instagram bots does not comply with the terms of the service: use this software at your own risk. A "bot" is legal software, but the use of a bot continuously violates the terms of use of Instagram and you risk a: __soft ban__ (such as limited actions or follow-up) or you risk __ban__ with suspension for a few days (or permanent). All trademarks and logos belong to their respective owners.

> ⛔ **DISCLAIMER 2**: The **API** (on which the bot is partially based) **login** ( just for the first login of the profile ) can **cause** the creation of a **warning email** about a new access to instagram from a new device (samsung phone usually)

## 🎁 Support: Donate
> This project is **free**, and I try to provide excellent **free support**. Why donate? I work on this project several hours a week or in my spare time and try to keep it up to date and working. This cannot be done without your financial support, even small. There are professional bots that saves passwords on the cloud for €14/month: we want to protect your passwords and offer you a better product than others storing all the datas locally on your machine. A lower donation would allow continuous development, ever better quality and the realization of this dream. **THANK YOU!**

[![](https://img.shields.io/badge/buy%20me-coffee-4B788C.svg)](https://ko-fi.com/linch1)

![](https://img.shields.io/badge/bitcoin-1EyJ7niABw5L4LWvLj8M6bQCENjX8QCmNa-E38B29.svg) 
![](https://img.shields.io/badge/ethereum-0x8af8e8f4950db92ddb76597bafc1d35f97a914b1-4E8EE9.svg)

# DOCS

> 🔵 **ACTIONS**: With the term **actions** are identified the buttons at the start of each page. Then name of the button can be read  by hovering the mouse on it.

> ⚫ **LABELS**: Each _input_, _label_, _button_ has a label on it with a small description of the element, it is readable by hovering the mouse on it.

> 🔴 **API**: This bot uses a [Nodejs instagram-private-api](ttps://github.com/dilame/instagram-private-api
) for upload medias. If you have the 2FA enabled for do the **login** you are going to insert two times the 2FA code, once for thw _browser_ login and once for the _api_ login.

> :pencil2: **LIST FIELDS**: Each **list** field to fill in the bot settings has to respect the following format: _elem1 **&** elem2 **&** elem3 ...._

# 📎 DOCS Index
Instagram api manual:
  - 📒 [Dashboard](#-dashboard)
    - :hammer: **In development**
  - 📘 [Profiles](#-profiles)
    - 🎬 [actions](#-actions)
    - :cyclone: [Login datas](#cyclone-login)
    - :cyclone: [Interactions](#cyclone-interactions)
    - :cyclone: [Interactions Values](#cyclone-interactions-values)
    - :cyclone: [Interactions Limits](#cyclone-interactions-limits)
    - :cyclone: [Images Collector](#cyclone-images-collector)
    - :cyclone: [Auto Post](#cyclone-auto-post)
    - :cyclone: [Auto Story](#cyclone-auto-story)
  - 📕 [Images](#-images)
    - 🎬 [actions](#-actions-1)
    - :cyclone: [Images Collector](#cyclone-images-collector-1)
  - 📗 [Posts](#-posts)
    - 🎬 [actions](#-actions-2)
    - :cyclone: [Auto post](#cyclone-auto-post-1)
  - 📙 [Stories](#-stories)
    - 🎬 [actions](#-actions-3)
    - :cyclone: [Auto Story](#cyclone-auto-story-1)
  - 📔 [Stats](#-stats)
  - 📒 [Logs](#-logs)
  - 💢 [Issues](#-issues)



## 📒 DASHBOARD

- :hammer: **In development**

## 📘 PROFILES

- :octocat: From this panel you can manage the **account settings**, **create/delete** new profiles and **start/stop bots**.
- :octocat: All the given datas are stored **LOCALLY** on your machine. There are no _cloud_ services so all the informations are securely saved and **ONLY YOU** can read them.

#### 🎬 **ACTIONS**:

- :zap: **Run**: Runs the bot of the current selected profile.
- :zap: **Save settings**: Save the settings of the selected profile. Each time that you edit something be sure to save it before running the bot.
- :zap: **Api login**: Does the login in the private api for the selected profile
- :zap: **New profile creation**:
    1. Write the profile name in the **_Create new profile_ field**. If you want to reuse the settings already wrote for another profile before than write the name in the _Create new profile_ field select the wanted profile.
    2. Compile the setting
    3. Click the **_Save settings_** button and the profile will automatically created.
- :zap: **Run All**: Runs all the bots of the saved profiles.
- :zap: **Stop**: Stop the bot of the selected profile. For stop a bot is possible to simply close the window of the bot.
- :zap: **Stop All**: Stop all the running bots.
- :zap: **Clear Fields**: Clears all the fields withot saving/deleting anithing.
- :zap: **Delete Profile**: Delete the selected profile and all the related datas ( _except for the images_ )
- :zap:**Clear Session**: Clear all the datas of the session in the browser and in the api.

#### :cyclone: **Login**:
  - :zap: _username_ : your login username
  - :zap: _password_ : your login password
  - :octocat: if the account has **2FA** enabled and the **Auto post/story** is active the code will be sent twice, once for thw **API login** and once for the **Brwoser** login.
  - :octocat: The login is made only once (if the previous session is valid). It can be made again by _clearing the profile session_ with the action **Clear Session**
#### :cyclone: **Interactions**:
  - :zap: _follow public_ : Allow the bot to  the **public profiles**
  - :zap: _follow private_ : Allow the bot to follow the **private profiles**
  - :zap: _follow no post_ : Allow the bot to follow **profiles without posts**
  - :zap: _left comment_ : Allow the bot to **left a custom comment** under the posts of the visited user
  - :zap: _left like_ : Allow the bot to **left a like** under the posts of the visited user
  - :zap: _left message_ : Allow the bot to **left a dm** to the visited user
  - :zap: _unfollow_ : Allow the bot to **unfollow someone**
    - **The _unfollow_ action is made only on _profiles that the bot has previously followed_**.
  
#### :cyclone: **Interactions Values**:
  - :octocat: Each interaction value is **valid** only if the **corresponding interaction status is active**. For example if you set _**number of likes** = 3_ but the _**left like interaction** is not active_ the number of likes are **ignored**
  
  - :zap: _number of likes_: The number of likes that the bot has to left on the visited profile. if _number of likes = 3_ it will like the last 3 post of the user.
  - :zap: _pages for profile collection_ : A **list** of pages from where the bot collect the profiles with which interact. ( **&** separator )
  - :zap: _number of comments_ : The number of comments that the bot has to left on the visited profile.
  - :zap: _comment_ : A **list** of commets from where the bot can choiche for pick a comment to left. ( **&** separator )
  - :zap: _message_ : A **list** of messages from where the bot can choiche for pick a text to send to the visited user. ( **&** separator )
  - :zap: _delay_ : The delay that the bot has to sleep before to start another **Interactions cycle** with the next user. _Interactions with user1 + unfollow_ ---> **sleep delay**  ---> _Interactions with user2 + unfollow_ ---> **sleep delay** ---> ....
  - :zap: _start unfollow_: The number of people that the bot has to follow before that it starts to unfollow someone. if _start unfollow = 100_ it will start to unfollow after 100 profiles followed.
  - :zap: _random actions_: This setting randomize the actions:
    - likes: The bot will left a random number of likes, from 1 to _number of likes_.
    - comments: The bot will left a random number of comments, from 1 to _number of comments_.
    - follow: The bot will follow or not the visited profile.
    - unfollow: The bot will unfollow or not someone.
    - messages: THe bot will send or not a dm to the visited profile.
  - :zap: _random time_: This settings randomize the _sleep delay_ between one interaction cycle and another.
    - The bot will sleep from **delay**/2 to 2 * **delay**
  - :zap: _collect following time_: The delay that the bot has for scrape your profile following list and find who it has to unfollow by comparing your following list with the previously followed peoples.
  - :zap: _collect to follow time_: The delay that the bot has for scrape the followers list of the _pages for profile collection_ and save the scraped profiles for interact with them.
  
#### :cyclone: **Interactions Limits**:
  - :zap: _follow per day_ : The maximum range of follow to left in one day.
  - :zap: _likes per day_ : The maximum range of likes to left in one day.
  - :zap: _unfollow per day_: The maximum range of unfollow to left in one day.
  - :zap: _comment per day_ : The maximum range of commets to left in one day.
  - :zap: _message per day_ : The maximum range of messages to left in one day.
  
#### :cyclone: **Images Collector**:
  - :zap: _hashtags_: The hashtags **list** from where you want the bot to collect the images from, you can add too profiles name. **@** for profiles, **#** for hashtags, **!** for absolute paths of folders ( **&** separator ) ex: ( #hashtag1 & #hashtag2 & @profile1 & @profile2 & !abs/path/to/folder).
  - :zap: _collect images_: Allow the bot to **automatically collect new images** each given delay.
  - :zap: _collect images delay_: The **delay** that the bot has to wait **before collect again the images**.
  
#### :cyclone: **Auto Post**:
  - :octocat: By **default** in eache **_random post_** the owner of the posted image will be tagged in the post.
  - :zap: _auto post_: Allow the bot to do auto posts.
  - :zap: _random post_: Allow the bot to create a **random post from the collected images**.
  - :zap: _random post delay_: The **delay** that the bot has **to wait before** post a **new random post** 
  - :zap: _captions_: The captions **list** that the bot will use for create the random post. ( **&** separator )
  
#### :cyclone: **Auto Story**:
  - :zap: _auto story_: Allow the bot to do auto stories.
  - :zap: _random story_: Allow the bot to create a **random story from the collected images**.
  - :zap: _random story delay_: The **delay** that the bot has **to wait before** post a **new random story** 


## 📕 IMAGES

- :octocat: From this panel you can **manage the collected images** and **run the profiles images collector** for collect new images.
- :octocat: The collected images are not downloaded but the ig images links are stored in a file, so they doesn't fill your disk space!
- :octocat: Be aware that the ig videos links are temporary, usually a video link expires after few days so don't collect videos and hope that they will remain there for months.


#### 🎬 **ACTIONS**:
- :zap: **Run**: Runs the **image collector of the selected profile**. It collects the most popular images/videos and their owner of the given hashtags, and the latest (12-18) posts of a given profile. ( usually each hashtag has 9 popular medias).
- :zap: **Save settings**: Save the settings of the selected profile. Each time that you edit something be sure to save it before running the bot.
- :zap: **Run All**: Runs all the **images collectors** of the saved profiles.
- :zap: **Stop**: Stop the **image collector** of the selected profile. Is possible to simply close the window of the collector too.
- :zap: **Stop All**: Stop all the **images collectors**.
- :zap: **Delete All Images**: **Delete** all the **images of the hastas** related to the selected profile. The **deleted images are gone too for all the others profiles**. All the **profiles shares the images**, if you have two profiles _A_ and _B_ and both have the hashtag _#pizza_ if you delete on or more images of the hashtag _#pizza_ from the profile _A_ the images are deleted too for the profile _B_.
- :zap: **Delete Profile**: Delete the selected profile and all the related datas ( _except for the images_ )
- :zap:**Clear Session**: Clear all the datas of the session in the browser and in the api.

#### :cyclone: **Images Collector**:
  - :zap: _hashtags_: The hashtags **list** from where you want the bot to collect the images from, you can add too profiles name. **@** for profiles, **#** for hashtags, **!** for absolute paths of folders ( **&** separator ) ex: ( #hashtag1 & #hashtag2 & @profile1 & @profile2 & !abs/path/to/folder).
  - :zap: _collect images_: Allow the bot to **automatically collect new images** each given delay.
  - :zap: _collect images delay_: The **delay** that the bot has to wait **before collect again the images**.

## 📗 POSTS

- :octocat: From this panel you can **manage/schedule posts**.

#### 🎬 **ACTIONS**:
- :zap: **Random Post**: generate random posts based on the given 

- :zap: **Add Post**: Add a post **_card_** at the bottom of the page that can be filled with custom datas for create a scheduled post. The supported files are **.mp4** for **videos** and **.jpg** for **images**. You can add too a tag **list** containing the users to tag. ( **&** separator ).
- :zap: **Save settings**: Save the settings of the selected profile. Each time that you edit something be sure to save it before running the bot.
- :zap: **Delete All posts**: Remove all the **Scheduled posts** of the selected profile.
- :zap: **Delete Profile**: Delete the selected profile and all the related datas ( _except for the images_ )
- :zap: **Clear Session**: Clear all the datas of the session in the browser and in the api.

**For Generate a Random Posts:**
  1. Fill the **_random posts number_** field with the posts to generate.
  2. Fill the **_random posts start date_** field with the date that indidicates the start of the pubblication of the posts.
  3. Select the _capiton type_ between:
    - **random caption**: take a random caption from the given _captions_.
    - **default caption**: take the caption collected with the post.
    - **default + random**: use the default one and adds to it a random caption from the given _captions_.
  4. Click the **_random posts_** button, this will generate 'n' posts with random videos/images previously collected from the bot, the posts dates start from the given date and each time that a new random post is created this date is incremented with the number given in the **_random post delay_** field.

#### :cyclone: **Auto Post**:
  - :octocat: By **default** in eache **_random post_** the owner of the posted image will be tagged in the post.
  - :zap: _auto post_: Allow the bot to do auto posts.
  - :zap: _random post_: Allow the bot to create a **random post from the collected images**.
  - :zap: _random post delay_: The **delay** that the bot has **to wait before** post a **new random post** 
  - :zap: _captions_: The captions **list** that the bot will use for create the random post. ( **&** separator )
  - :octocat: _captions_ **special words**:
    - **@owner** : when the bot will post the image/video will replace this word with the source ( so the owner of the post ) of the post.

## 📙 STORIES

- :octocat: From this panel you can **manage/schedule stories**.

#### 🎬 **ACTIONS**:
- :zap: **Random Stories**: 
  1. Fill the **_random stories number_** field with the posts to generate.
  2. Fill the **_random story start date_** field with the date that indidicates the start of the pubblication of the posts.
  3. Click the **_random stories** button, this will generate 'n' stories with random videos/images previously collected from the bot, the stories dates start from the given date and each time that a new random story is created this date is incremented with the number given in the **_random story delay_** field.
- :zap: **Add Story**: Add a story **_card_** at the bottom of the page that can be filled with custom datas for create a scheduled story. The supported files are **.mp4** for **videos** and **.jpg** for **images**.
- :zap: **Save settings**: Save the settings of the selected profile. Each time that you edit something be sure to save it before running the bot.
- :zap: **Delete All Stories**: Remove all the **Scheduled posts** of the selected profile.
- :zap: **Delete Profile**: Delete the selected profile and all the related datas ( _except for the images_ )
- :zap: **Clear Session**: Clear all the datas of the session in the browser and in the api.

#### :cyclone: **Auto Story**:
  - :zap: _auto story_: Allow the bot to do auto stories.
  - :zap: _random story_: Allow the bot to create a **random story from the collected images**.
  - :diamonds: _random story delay_: The **delay** that the bot has **to wait before** post a **new random story** 

## 📔 STATS

- :octocat: This is a **view only panel**. When the bot is active it _stores_ the interactions that it does and some datas relative to your profile for create **ANALYTICS GRAPHS**. The following **graphs** are aviable.
  - **Daily** stats
  - **Likes** interaction
  - **Comments** interaction
  - **Follow** interaction
  - **Unfollow** interaction
  - **Visited** profiles
  - Profile **uploaded posts** count: No
  - **Following**
  - **Followers** 
  
## 📒 LOGS

- :octocat: This is a **view only panel**. There are stored all the bot logs, basically what it does and when it does it. If you see that something isn't working just checks the logs for see if something bad happend.
- With the **_logs filter_** u can choose to view only a specific type of logs:
  - errors
  - info
  - warnings
  - success
- :octocat: Sometimes the error are displayed too in the upper alert box!

## 💢 ISSUES
- :octocat: For any problem or help request open an issue.


## 💫 License
* Code and Contributions Licese
> Copyright (c) 2020 Linch1-Wiinsta: Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

>THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

* Images and logos have **CC BY-NC 4.0 License**
* Documentations and Translations have **CC BY 4.0 License**

###### Copyleft (c) 2019-2020 [Linch1](https://ptk.dev)
<div id="license"></div>


