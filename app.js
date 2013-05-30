var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');
var profile = require('./objects/profile'); 

var app = express();

app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));

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

app.listen(8000);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
//-----------------------------------------------------------------

app.get('/', routes.index); 
app.get('/all_trips', routes.all_trips); 
app.get('/all_items', routes.all_items);
app.get('/post_trips', routes.post_trips); 
app.get('/post_items', routes.post_items)
app.get('/user/:id', routes.profile); 
app.get('/home', routes.home)

app.get('/welcome', function(req, res) {
    if (req.session.logged) res.send('Welcome back!');
    else {
        req.session.logged = true;
        res.send('Welcome!');
    }
});
//-----------------------------------------------------------------

app.post('/new_user', routes.new_user);





