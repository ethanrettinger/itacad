const app = require("express")();
const express = require("express");
const http = require("http").Server(app);
const port = process.env.PORT || 3000;
const util = require("util");
const fs = require('fs');
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/public/index.html");
});
app.get('/styles.css', function(req, res){
    res.sendFile(__dirname + '/public/styles.css');
});
app.get('/script.js', function(req, res){
    res.sendFile(__dirname + '/public/script.js');
});

// on GET request to /api send back all messages in JSON format from data/messages.json
app.get("/api", function(req, res) {
    res.sendFile(__dirname + "/data/messages.json");
    console.log('Requested')
});

// on POST request to /api add message to data/messages.json
app.use(express.json());

app.post('*', (req, res) => {
  req.body; // JavaScript object containing the parse JSON
  res.json(req.body);
});
http.listen(port, function() {
    console.log("Listening on *:" + port);
});