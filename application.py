import os
from flask import Flask, render_template, request, session, redirect, url_for, flash
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_session import Session
from pytz import timezone
from datetime import datetime

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0  # to force css reloading

# use Sessions, filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)  # to store information specific to a user from one request to the next

socketio = SocketIO(app)

channels = {'Lounge': {}}  # dict of all open channels, each channel should be a list
# Warm welcome message in the lounge
channels['Lounge']['description'] = 'This space is for all users'
stamp = datetime.now(timezone('Asia/Singapore')).strftime("%d/%m/%Y %H:%M:%S") + ' (SG/HK) | ' + datetime.now(timezone('Europe/Zurich')).strftime("%d/%m/%Y %H:%M:%S") + ' (CH/FR)'
channels['Lounge']['messages'] = []
channels['Lounge']['messages'].append({'user': 'Admin', 'msg': 'Welcome!', 'msg_time': stamp})



@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/contact")
def contact():
    return render_template("contact.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")
    elif request.method == "POST":
        session.clear()
        session['username'] = request.form.get('username')
        return redirect('/home')


@app.route("/logout", methods=["GET", "POST"])
def logout():
    session.clear()
    return redirect('/home')


@app.route("/")
@app.route("/home")
def home():
    if not session.get('username'):
        flash("Please log in first", 'info')
        return redirect(url_for('login'))
    else:
        return render_template("landing.html",
                               user_username=session['username'],
                               channels=list(channels.keys()))


@socketio.on("send_message")
def send_message(data):
    """ Sends a message to a specific channel """
    sg = datetime.now(timezone('Asia/Singapore'))
    zch = datetime.now(timezone('Europe/Zurich'))
    msg_time = sg.strftime("%d/%m/%Y %H:%M:%S") + ' (SG/HK) | ' + zch.strftime("%d/%m/%Y %H:%M:%S") + ' (CH/FR)'
    room_name = data['channel']
    msg_details = {"user": data["user"],
                   "msg": data["msg"],
                   "msg_time": msg_time}
    # Max 100 message per room
    if len(channels[room_name]['messages']) >= 100:
        channels[room_name]['messages'].pop(0)
    channels[room_name]['messages'].append(msg_details)
    # Emit message to clients
    emit("receive_message", msg_details, room=data["channel"])


@app.route("/create_room", methods=["GET", "POST"])
def new_room():
    """ Creates a new room/channel """
    if request.method == "GET":
        return render_template('create_room.html')
    else:
        room_name = request.form.get('name')
        room_description = request.form.get('description')
        if channels.get(room_name):
            flash('This room already exists', 'info')
            return render_template('create_room.html')
        else:
            channels[room_name] = {}
            channels[room_name]['description'] = room_description
            channels[room_name]['messages'] = []
            flash('New room created', 'success')
            # other users must be notified too (otherwise only a page reload would show any new room)
            socketio.emit('new room', room_name, broadcast=True)
            return redirect(url_for('home'))


@socketio.on("change channel")
def change_channel(previous_channel, new_channel, user):
    """ Changes channel """
    # Remove user from previous channel
    leave_room(previous_channel)
    if previous_channel != new_channel:
        leave_message = user + " has left the room"
        emit("room_change", leave_message, room=previous_channel)

    # Add user to new channel
    join_room(new_channel)
    if previous_channel != new_channel:
        join_message = user + " has entered the room"
        emit("room_change", join_message, room=new_channel)
    data = {"channel": new_channel,
            "channel info": channels[new_channel]['description'],
            "messages": channels[new_channel]['messages']}
    emit("join_channel", data)


if __name__ == '__main__':
    app.run()

"""

-special touches:
    1) optional notification sound played when a new message is received
    2) notification inside the chatroom about which users enter/exit the chatroom
    3) optional room details displayed on top of the chat area
    4) message time stamp is displayed for two different time zones
    
"""
