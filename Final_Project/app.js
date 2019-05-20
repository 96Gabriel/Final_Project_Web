var express = require("express"),
    consolidate = require("consolidate"),
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    body_parser = require("body-parser"),
    app = express(),
    session = require("express-session"),
    https = require("https"),
    fs = require("fs"),
    crypto = require("crypto"),
    database;

app.engine('html', consolidate.hogan);
app.set("views", "static");
app.use(express.static(__dirname + "/public"));
app.use(body_parser.urlencoded({ extended: true }));
const users = "users";
const events = "events"

function hash_password(password){
    var hash = crypto.createHmac('sha256', password)
                     .update("I love apples")
                     .digest("hex");
    return hash;
}

app.use(session({
    secret: 'even_map_louvain_9849814u'
}));

MongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true }, (err, db) => {
    dbo = db.db("events_db");
    if (err) throw err;
    database = dbo;
});

function getMaxIndexSpecial(arr){
    var max = 0;
    var maxIndex = 0;
    for(var l = 0; l < arr.length; l++){
        if(max < arr[l].num){
            max = arr[l].num;
            maxIndex = l;
        }
    }
    return l;
}

function deleteEntriesSpecial(arr){
    for(var m = 0; m < arr.length; m++){
        if(arr[m].num === 0){
            arr.splice(m, 1);
        }
    }
    return arr;
}

app.get("/", function (req, res) {
    var username;
    if(req.session.username){
        username = req.session.username;
    }else{
        username = "Username";
    }
    res.render("home.html", {username: username});
});

app.get("/map", function (req, res) {
    database.collection(events).find({}, (err, doc) => {
        if (err) throw err;
        var events = {};
        events.arr = [];
        doc.each(function (err, doc) {
            events.arr.push(doc);
        });
        res.render("map.html", events);
    });
});

app.get("/search", function(req, res){
    var search_query = req.query.text;
    database.collection(events).find({ $text: {$search: search_query}}, (err, doc) => {
        if (err) throw err;
        var events = {};
        events.arr = [];
        doc.each(function (err, doc) {
            events.arr.push(doc);
        });
        res.render("map.html", events);
    });

});

app.get("/login", function (req, res) {
    if(!req.session.username){
        res.render("login.html");
    }else{
        res.redirect("/");
    }
});

app.post("/login", function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var hash = hash_password(password);
    console.log(hash);
    var query = {"username": username, "password": hash};
    database.collection(users).findOne(query, function(err, result){
        if(err) throw err; 
        if(result){ 
            req.session.username = username;
            res.redirect("/");
        }else{
            res.redirect("/login");
        }
    });
});

app.post("/sign_up", function(req, res){
    var username = req.body.username2;
    var password = req.body.password2;
    var confirm_password = req.body.confirmPassword;

    var hash1 = hash_password(password);
    var hash2 = hash_password(confirm_password);
    if(hash1 != hash2){
        res.redirect("/login");
    }else{
        var new_user = {"username": username, "password": hash1};
        database.collection(users).findOne(new_user, function(err, result){
            if(err) throw error;
            if(result){
                res.redirect("/login");
            }else{
                database.collection(users).insertOne(new_user, function(err, doc){
                    if(err) throw error;
                    req.session.username = username;
                    res.redirect("/");
                });
            }
        });
    }
});

app.get("/event", function (req, res) {
    res.render("event.html");
});

app.post("/event", function (req, res) {
    if (req.session.username) {
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

        database.collection(events).insertOne(new_event, function (err, doc) {
            if (err) throw error;
            res.redirect("/map");
        });
    }else{
        res.redirect("login");
    }
});

app.use(express.static('main'));

https.createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
    passphrase: 'maps'
}, app).listen(8080);
