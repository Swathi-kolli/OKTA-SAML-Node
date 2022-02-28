var express = require('express');
var connect = require('connect');
var cookie = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')
var auth = require('./auth');
var path = require('path');
var low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);
const defaultData = { users: {

} }
db.defaults(defaultData).write();

var app = express();



// app.configure(function() {
//     app.use(express.logger());
//     app.use(connect.compress());
    app.use(cookie());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(session({ secret: "roomapplication session" }));
    app.use(auth.initialize());
    app.use(auth.session());
    app.use(express.static('public'));
//});

//Get Methods
app.get('/', auth.protected, function(req, res) {
    res.sendfile('index.html');
});

app.get('/home', auth.protected, function(req, res) {
    res.sendfile('index.html');
});

app.post('/hello', function(req, res) {
    const dbData = db.get();
    const sessions = dbData.__wrapped__.sessions;
    console.log("sessionssssss", sessions);
    console.log("response");
    res.json({
        "commands": [
            {
            "type": "com.okta.assertion.patch",
            "value": [
                    {
                    "op": "replace",
                    "path": "/subject/nameId",
                    "value": "Nischolas@tecnics.com"
                    },
                ]
            }

        ]
    });
});

// app.post('/saml/integrate',function(req, res) {

//     // res.send('Helllo');
// });

//auth.authenticate check if you are logged in
app.get('/login', auth.authenticate('saml', { failureRedirect: '/', failureFlash: true }), function(req, res) {
    res.redirect('/');
});

//POST Method to save the data
app.post('/save/users', (req, res) => {
    console.log("REQUEST", req.cookies['connect.sid'], req.user);
    const selectedUsers = req.body.user;
    const sessionId = req.cookies['connect.sid'];
    data = db.get();
    // console.log("data", data, "wrapped", data.__wrapped__,"sessions",data.__wrapped__.sessions)
    sessionsData = data.__wrapped__.sessions;
    // console.log("sessionIDDD", sessionsData);
    sessionsData[sessionId] = selectedUsers;
    // console.log("UpdatedSessionData", sessionsData);


    db.get('sessions').update(sessionsData).write();
    // console.log("finalData", db.get('sessions'))
    // res.send("sent");
    // res.sendStatus(200);

    res.redirect('https://dev-18365449.okta.com/home/dev-18365449_nodejs2_1/0oa3z0lu7lkeX3Jtb5d7/aln3z0rta4AiR9OtJ5d7');
    // res.send("https://dev-18365449.okta.com/home/dev-18365449_nodejs2_1/0oa3z0lu7lkeX3Jtb5d7/aln3z0rta4AiR9OtJ5d7");
})

//POST Methods, redirect to home successful login
app.post('/login/callback', auth.authenticate('saml', { failureRedirect: '/', failureFlash: true }), function(req, res) {
    res.redirect('/home');
});

//code for importing static files
app.use(express.static(path.join(__dirname, 'public')));
var currentPort = app.listen(3000);
console.log("Server started at PORT " + currentPort);