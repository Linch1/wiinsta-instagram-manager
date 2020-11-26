/*
types:

block ( start a new section )
t ( text field )
c ( checkbox )
nr ( no render in the gui )
n ( number )
at ( array text, each word have to be separated by the & char)
di ( dictionary )
*/
datas = {
  "LOGIN DATAS": 
  {
      "type": "block"
  },
  "username":
    {
      "type": "t",
      "description": "your login username"
    },
  "password":
    {
      "type": "t",
      "description": "your login password"
    },
  "profile_image":
    {
      "type": "nr"
    },
  "profile_avatar":
    {
      "type": "nr"
    },
  "today_followers":
    {
      "type": "nr"
    },
  "today_following":
    {
      "type": "nr"
    },
  "blocked_actions_time":
    {
      "type": "nr",
      "description": "your login password"
    },
  "session_id":
    {
      "type": "nr",
      "description": "the current session id"
    },
  "INTERACTIONS": 
  {
      "type": "block"
  },
  "follow_public":
    {
      "type": "c",
      "description": "check if you want to follow public accounts"
    },
  "follow_private":
    {
      "type": "c",
      "description": "check if you want to follow private accounts"
    },
  "follow_noPost":
    {
      "type": "c",
      "description": "check if you want to follow accounts without posts"
    },
  "left_comment":
    {
      "type": "c",
      "description": "check if you want to left comments under posts"
    },
  "left_like":
    {
      "type": "c",
      "description": "check if you want to left likes under posts"
    },
  "left_message":
    {
      "type": "c",
      "description": "check if you want to send direct messages"
    },
  "unfollow":
    {
      "type": "c",
      "description": "check if you want to unfollow"
    },
  "INTERACTIONS VALUES": 
    {
        "type": "block"
    },
  "number_of_likes":
    {
      "type": "n",
      "description": "the number of likes that you want to left on each account",
      "default": 1
    },
  "pages_for_porifle_collection":
    {
      "type": "at",
      "description": "The pages from where the bot collects the profiles to interact with (have to be public or followed by your profile)"
    },
  "number_of_comments":
    {
      "type": "n",
      "description": "the number of comments that you want to left on each account",
      "default": 1
    },
  "comment":
    {
      "type": "at",
      "description": "comments that you want to left ( each comment is separate by '&' char ex: nice pic & wow amazin post & ecc..)"
    },
  "message":
    {
      "type": "at",
      "description": "messages that you want to send ( each message is separate by '&' char ex: hello & Hy I'm marco & ecc..)"
    },
  "delay":
    {
      "type": "n",
      "description": "the delay that the bot has to wait between two interactions cycles (seconds)",
      "default": 300
    },
  "start_unfollow":
    {
      "type": "n",
      "description": `number of accounts to be followed before the bot start to do 
                      the unfollow action( the bot unfollows only the accountd that it have followed previously ).
                      Ex: if set to 50 this field, the bot will start to unfollow someone only once he has followed 50 profiles`,
      "default": 100                
    },
  "random_actions":
    {
      "type": "c",
      "description": `check if you want to randomize the actions ( the current parameters are used as max range ) ex: if u said number of likes = 3 
                      the bot will put 1 to 3 likes. This prevent Instagram to find a pattern in the bot actions. For the follow and unfollow (if you activated them )
                      actions it will randomatically choice to left them or not`
    },
  "random_time":
    {
      "type": "c",
      "description": `check if you want to randomize the delay time between two interactions cycles. If we call 'x' the delay that u gave the random time will be taken in the range [x/2, 2*x]`
    },
  "followed_range":
    {
      "type": "nr",
      "description": "it is a counter that keep trak of how many people the account has followed ( not edit this )"
    },
 
  "collect_following_time":
    {
      "type": "n",
      "description": " the delay that the bot has for scrape your following list and find who unfollow(seconds) [ 10 is enaugh usually ]",
      "default": 10
    },
  "collect_to_follow_time":
    {
      "type": "n",
      "description": " the delay that the bot has for collect the profiles with which interact (seconds) [ 10 is enaugh usually ]",
      "default": 10
    },
  "INTERACTIONS LIMITS": 
    {
        "type": "block"
    },
  "follow_per_day":
    {
      "type": "n",
      "description": " the max number of follow actions per day ",
      "default": 100
    },
  "likes_per_day":
    {
      "type": "n",
      "description": "the max number of likes actions per day",
      "default": 200
    },
  "unfollow_per_day":
    {
      "type": "n",
      "description": "the max number of unfollow actions per day",
      "default": 100
    },
  "comment_per_day":
    {
      "type": "n",
      "description": "the max number of comments actions per day",
      "default": 100
    },
  "message_per_day":
    {
      "type": "n",
      "description": "the max number of direct messages (dm) per day",
      "default": 100
    },
  
  "IMAGES COLLECTOR": 
    {
        "type": "block"
    },
  "hashtags":
  {
    "type": "at",
    "description": "the hastags that the bot uses for collect images ( write each hashtag separate by '&' char ex: #photos &  @profile1 & #sunshine & @profile2 )"
  },
  "collect_images":
  {
    "type": "c",
    "description": "check if you want that the bott collects the most popular images from the given hashtags"
  },
  "collect_images_delay":
  {
    "type": "n",
    "description": "the delay between two images collections cicles ( in minutes -> 120 = 2 Hours)",
    "default": 300
  },
  "collect_images_last_time":
  {
    "type": "nr",
    "description": " collect images parameter "
  },
  "AUTO POST": 
    {
        "type": "block"
    },
  "auto_post":
  {
    "type": "c",
    "description": " check if you want the bot to auto post, if u click the PLUS green symbol you can add a scheduled post "
  },
  "random_post":
  {
    "type": "c",
    "description": ` check if you want the bot to make a random post. he picks the images/videos from the files that he has 
                     previously collected. (works only if auto-post is activated)`
  },
  "random_post_delay":
  {
    "type": "n",
    "description": " delay between two random posts ( in minutes -> 120 = 2 Hours) ",
    "default": 180
  },
  "random_post_last_time":
  {
    "type": "nr",
    "description": " random post parameter "
  },
  "captions":
  {
    "type": "at",
    "render": "textarea",
    "description": " the captions that the bot uses for auto posts ( write each caption separate by '&' char )"
  },
  "captions_to_use":
  {
    "type": "nr",
    "default": "[]",
    "description": "The captions that have to be used for upcoming publish of scheduled post"
  },
  "scheduled_posts": 
    {
      "type": "di",
      "description": " schedule an auto post "
    },
  "AUTO STORY": 
    {
        "type": "block"
    },
  "scheduled_stories": 
  {
    "type": "di",
    "description": " schedule an auto story"
  },
  "auto_story":
    {
      "type": "c",
      "description": " check if you want the bot to do auto stories "
    },
  "random_story":
    {
      "type": "c",
      "description": "check if you want the bot to do random stories ( works only if auto-story is activated )"
    },
  "random_story_delay":
    {
      "type": "n",
      "description": "the delay between two random stories  ( in minutes -> 120 = 2 Hours)",
      "default": 180
    },
  "random_story_last_time":
    {
      "type": "nr",
      "description": "random story param "
    },
  "FOCUS COMMENTS": 
    {
        "type": "block",
        "description": "the post link on wich you want to left the comments"
    },
  "focus_post":
    {
      "type": "t",
      "description": "the link of the post under what you want to left the comments"
    },
  "focus_comment":
    {
      "type": "at",
      "description": "the comments that you want to left ( write each comment separate by '&' char )"
    },
  "focus_delay": {
      "type": "n",
      "description": "ammount of time to wait before on comment and another"
    },
  "focus_in_flow": {
      "type": "c",
      "description": "check if you want the bot to do the focus action while he is interacting with other users ( in this case the 'focus delay' will be overwritten by the 'delay' in the interactions section ) "
    }
   
}

module.exports = { datas: datas };