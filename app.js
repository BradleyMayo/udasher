var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');
var db = require('./database')

var passport = require('passport'); 
var fbStrategy = require('passport-facebook').Strategy; 


//**********Login with Facebook**********//

 passport.serializeUser(function(user, done){
    done(null, user.id); 
 }); 

passport.deserializeUser(function(id, done) { 
      done(null, id);
}); 

passport.use(new fbStrategy({
	clientID:   '518622688201529',
	clientSecret: '361bb8cfd629edb54779a005376006f5',
	callbackURL: "http://localhost:8000/auth/facebook/callback"
},
function(acessToken, refreshToken, profile, done){
	db.addUserWithFB(profile); 
	done(null, profile); 
}));


var app = express();


//---------------------------------------------------------------
//Express Configuration  

//Set Enviromnet
app.set('port', process.env.PORT || 8000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());

//These two lines have to be directly before and after eachother
app.use(express.cookieParser());
app.use(express.session( { secret: '498f99f3bbee4ae3a075eada02488464' } ));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


//Facebook routing-------------------------------------------------
 
app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/new_user_fb ', failureRedirect: '/auth/facebook' }));

//Local Routing-----------------------------------------------------

app.get('/', routes.index);
app.get('/find_trips', routes.find_trips);
app.get('/find_items', routes.find_items);
app.get('/post_trips', routes.post_trips);
app.get('/post_items', routes.post_items);
app.get('/signup', routes.signup);
app.get('/login_page', routes.login_page)
app.get('/logout', routes.logout);
app.get('/new_user_fb', routes.new_user_fb);
app.get('/trip/:id', routes.trip);
app.get('/item/:id', routes.item);
app.get('/attach_item/:trpid/:itmid', routes.attach_item);

//Local Data Handling----------------------------------------------

app.post('/login', routes.login);
app.post('/new_user ', routes.new_user);
app.post('/new_trip', routes.new_trip);
app.post('/new_item', routes.new_item);
app.post('/find_trips', routes.sort_trips);
app.post('/find_items', routes.sort_items);

//Error Handling---------------------------------------------------
/*
app.error(function(err, req, res, next){
	if (err instanceof NotFound){
		res.render('404.ejs');
	}
	else {
		next(err);
	}
});
*/

