# Import dependencies
from flask import Flask, request, render_template, redirect, jsonify, Response
import os
import json

# Initialize app object
app = Flask(__name__, template_folder=os.path.abspath("../pages"), static_folder=None)

# File request handler
@app.route('/<path:path>')
def get_resource(path):
    def get_file(filename):  # pragma: no cover
        try:
            src = os.path.join(filename)
            return open(src).read()
        except IOError as exc:
            return str(exc)
    mimetypes = {
        ".css": "text/css",
        ".html": "text/html",
        ".js": "application/javascript",
    }
    complete_path = os.path.join("../pages", path)
    ext = os.path.splitext(path)[1]
    if ext == ".html":
        return Response("You do not have permission to access this resource.", 401)
    mimetype = mimetypes.get(ext, "text/html")
    content = get_file(complete_path)
    return Response(content, mimetype=mimetype)


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
        try:
            f = open("../data/messages.json","r")
            message_data = json.load(f)
            f.close()
            if len(message_data) >= 10:
                del message_data[0]
            new_msg = {}
            new_msg["sender"] = request.form["sender"]
            new_msg["content"] = request.form["content"]
            new_msg["time"] = request.form["time"]
            message_data.append(new_msg)
            with open('../data/messages.json', 'w') as f:
                json.dump(message_data, f, ensure_ascii=False, indent=4)
                f.close()
                return "True"
        except:
            return "False"

# Initialize web server
if __name__ == '__main__':
	app.run(debug=True)