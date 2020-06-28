# CS50's Web Programming with Python and JavaScript, Project 2, FLACK

---

## Objectives
Build an online messaging service using Flask, similar in spirit to Slack. 
Users will be able to sign into your site with a display name, create channels (i.e. chatrooms) to communicate in, as well as see and join existing channels. 
Once a channel is selected, users will be able to send and receive messages with one another in real time. 
Finally, you’ll add a personal touch to your chat application of your choosing!


## Folders:
### templates/ 
Contains the html/jinja templates used by the application. Templates can also include some javascript code and imports.
-base_layout.html: core bootstrap layout
-landing.html: main page where the app lives
-login.html: username/login page, for the first connection or after a user logs out
-create_room.html: separate page with a form to create a new chatroom
-about.html : what the project is about
-contact.html: link to github only 
### static/
Static files such as images and css files are there. 
The javascript code specific to this app is in the index.js file. 

## Individual files:

### application.py 
The python code to run the Flask application.

### requirements.txt:
Will contain the package dependencies to install in order to run the application. 
Generated via pip freeze > requirements.txt

## Notes: special touches 
    1) optional notification sound played when a new message is received
    2) notification inside the chatroom about which users enter/exit the chatroom
    3) optional room details displayed on top of the chat area
	4) message time stamp is displayed for two different time zones