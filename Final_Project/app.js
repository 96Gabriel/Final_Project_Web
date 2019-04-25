var express = require("express"),
    consolidate = require("consolidate"),
    app = express();

app.engine('html', consolidate.hogan);
app.set("views", "static");
app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
    res.render("home.html");
});

app.get("/login", function (req, res) {
    res.render("login.html");
});

app.get("/event", function (req, res) {
    res.render("event.html");
});

app.get("/map", function (req, res) {
    res.render("map.html");
});

app.use(express.static('main'));
app.listen(8080);

