# Import dependencies
from flask import Flask, request, render_template, redirect, jsonify
import os
import json

# Initialize app object
# The static folder will be in /pages
app = Flask(__name__, template_folder=os.path.abspath("../pages"), static_folder=None)

# '/'
@app.route("/", methods=["GET"])
def landing():
    return render_template("landing/index.html")

# '/message_board'
@app.route("/message_board", methods=["GET"])
def message_board():
	return render_template("msgboard/index.html")
    
# '/message_board/api'
@app.route("/message_board/api", methods=["GET","POST"])
def message_board_api():
    if request.method == "GET":
        f = open("../data/messages.json","r")
        message_data = json.load(f)
        f.close()
        return jsonify(message_data)
    elif request.method == "POST":
        pass

#Cooper: Make REST API that can:
# GET the last 10 messages from ../data/messages.json
# -- Return the JSON object --
# POST a new message to ../data/messages.json
# -- Return true if successful --
# -- Return false if unsuccessful --
# -- When a message is posted, delete the oldest message if there are more than 10 messages --
# (Thanks copilot for autocompleting my comments)


# Initialize web server
if __name__ == '__main__':
	app.run(debug=True)