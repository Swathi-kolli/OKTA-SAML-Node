var express = require('express');
var connect = require('connect');
var cookie = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
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
app.use(express.json());

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);




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
    const nameId = req.user.nameID
    console.log("nameId", nameId)
    const users = db.get().__wrapped__.users
    console.log("users", users[nameId])   

    res.render('index.html', {users:users[nameId]});
});


app.post('/update-saml', function(req, res) {
    console.log("helloo");
    const dbData = db.get();
    const sessions = dbData.__wrapped__.sessions;
    console.log("requestBody", req.body);
    const samlHookSessionPayload = JSON.stringify((req.body.data.context.session));
    const sessionId = JSON.parse(samlHookSessionPayload).id;
    // console.log("response",sessionId);
    const selectedUser = sessions[sessionId];
    console.log("selectedUser", selectedUser)
    res.json({
        "commands": [
            {
                "type": "com.okta.assertion.patch",
                "value": [
                    {
                        "op": "replace",
                        "path": "/subject/nameId",
                        "value": selectedUser,
                    },
                ]
            }
            
        ]
    });
});

app.get('/users',auth.protected,function(req, res) {
    console.log("users based on name", req.user)
    
    res.send({users: []});
});

//auth.authenticate check if you are logged in
app.get('/login', auth.authenticate('saml', { failureRedirect: '/', failureFlash: true }), function(req, res) {
    res.redirect('/');
});

//POST Method to save the data
app.post('/save/users', (req, res) => {
    console.log("REQUEST12333",req.body.user, req.body.session);
    
    // getSessionId()
    
    const selectedUsers = req.body.user;
    const sessionId = req.body.session;
    const data = db.get();
    // console.log("data", data, "wrapped", data.__wrapped__,"sessions",data.__wrapped__.sessions)
    const sessionsData = data.__wrapped__.sessions;
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