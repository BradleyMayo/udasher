/*
Imports necesary libraries from either the node_modules folder (as designated by the lack of './')
or from local modules (with the './' heading).
*/
var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');
var profile = require('./objects/profile'); 

//Creates an express application using the default function of the express module
var app = express();

//Initiates the use of cookies to store session information using a key to encrypt
app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));//key needs to be changed for real services

//---------------------------------------------------------------
//Express Configuration  

//Set Enviromnet
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//Sets the port the server listens on
app.listen(8000);

//Creates the actual http server while integrating the app made by express
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
//-----------------------------------------------------------------
/*
Sets the functions called by the server for each specific extension
Most of the functions are stored in the routes folder.
*/
app.get('/', routes.home); 
app.get('/trips', routes.trips); 
app.get('/signup', routes.signup)
app.get('/user/:id', routes.profile); 

app.get('/welcome', function(req, res) {
    if (req.session.logged) res.send('Welcome back!');
    else {
        req.session.logged = true;
        res.send('Welcome!');
    }
});
//-----------------------------------------------------------------

app.post('/new_user', routes.new_user);





