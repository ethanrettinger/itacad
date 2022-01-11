# Import dependencies
from flask import Flask, request, render_template, redirect
import os

# Initialize app object
app = Flask(__name__, template_folder=os.path.abspath("../pages"), static_folder=None)

# '/'
@app.route("/", methods=["GET"])
def landing():
    return render_template("landing/index.html")

# '/message_board'
@app.route("/message_board", methods=["GET"])
def message_board():
	return render_template("msgboard/index.html")

# Initialize web server
if __name__ == '__main__':
	app.run(debug=True)