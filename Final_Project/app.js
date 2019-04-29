var express = require("express"),
    consolidate = require("consolidate"),
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    body_parser = require("body-parser"),
    app = express(),
    database;

app.engine('html', consolidate.hogan);
app.set("views", "static");
app.use(express.static(__dirname + "/public"));
app.use(body_parser.urlencoded({extended: true}));

MongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true } ,(err, db) => {
    dbo = db.db("events_db");
    if(err) throw err;
    database = dbo;
});

app.get("/", function (req, res) {
    res.render("home.html");
});

app.get("/map", function (req, res) {
    database.collection("events").find({}, (err, doc) => {
        if(err) throw err;
        var events = {};
        events.arr = [];
        doc.each(function(err, doc){
            events.arr.push(doc);
        });
        res.render("map.html", events);
    });
});

app.get("/login", function (req, res) {
    res.render("login.html");
});

app.get("/event", function (req, res) {
    res.render("event.html");
});

app.post("/event", function(req, res){
    var name = req.body.name;
    var address = req.body.address;
    var date = req.body.date;
    var time = req.body.time;
    var description = req.body.description;
    var latitude = req.body.latitude;
    var longitude = req.body.longitude;

    var new_event = {
        name: name,
        location: address,
        description: description,
        day: date,
        time: time,
        latitude: latitude,
        longitude: longitude 
    };

    database.collection("events").insertOne(new_event, function(err, doc){
        if(err) throw error;
        res.redirect("/map");
    });
});

app.use(express.static('main'));
app.listen(8080);

