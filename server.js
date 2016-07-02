//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var express = require('express');
var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  TwitterStrategy = require('passport-twitter').Strategy;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var UserClass = require("./models/user.js");
var BookClass = require("./models/book.js");
var TradeClass = require("./models/trade.js");

var router = express();
var server = http.createServer(router);

router.use(express.static(path.resolve(__dirname, 'client')));

router.set('view engine', 'jade');
router.set('views', process.cwd() + '/client');

var User = new UserClass();
var BookStore = new BookClass();
var TradeStore = new TradeClass();

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne(username, function(err, user) {
      if (err) {
        console.log(err);
        return done(err);
      }
      if (!user) {
        console.log('user is null');
        return done(null, false, {
          message: 'Incorrect username.'
        });
      }
      if (!user.validPassword(password)) {
        console.log('password is not valid')
        return done(null, false, {
          message: 'Incorrect password.'
        });
      }
      console.log('done');
      return done(null, user);
    });
  }
));

passport.use(new TwitterStrategy({
    consumerKey: 'kymbvbHBcTYXGfLEjQTywzBYJ',
    consumerSecret: 'pgpn8aGoDvlz0LU6Xf9JW2zOQRY9WXWWaoARpkEjwPC7Osjxxa',
    callbackURL: 'http://fingerection-fcc-pinterest.herokuapp.com/twitter_callback'
  },
  function(token, tokenSecret, profile, cb) {
    // In this example, the user's Twitter profile is supplied as the user
    // record.  In a production-quality application, the Twitter profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    return cb(null, profile);
  }));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(user, cb) {
  cb(null, user);
});

router.use(require('express-session')({
  secret: 'justlikethestar',
  resave: false,
  saveUninitialized: false
}));


router.use(cookieParser());
router.use(bodyParser());
router.use(passport.initialize());
router.use(passport.session());


var urls = ['https://img3.doubanio.com/lpic/s28748605.jpg',
'https://img3.doubanio.com/lpic/s28719862.jpg',
'https://img3.doubanio.com/lpic/s28805134.jpg',
'https://img3.doubanio.com/lpic/s28851745.jpg',
'https://img3.doubanio.com/lpic/s28737406.jpg'];

var titles = ['纸上染了蓝','镜（全6册）','你的坚持，终将美好','遗失在西方的中国史','不再独自旅行'];
// initial Book
for(var i=0; i<urls.length; i++) {
  BookStore.create(titles[i], urls[i], 'admin');
}

router.get('/', function(req, res) {
  var books = BookStore.getAll();
  res.render('index', {
    user: req.user,
    books: books
  });
});

router.get('/login', function(req, res) {
  res.render('login', {
    user: req.user
  });
});

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: false
  })
);

router.get('/twitter_login',
  passport.authenticate('twitter'));

router.get('/twitter_callback', 
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

router.get('/signup', function(req, res) {
  res.render('signup', {
    user: req.user,
    message: ""
  });
});

router.post('/signup', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  if (User.isExist(username)) {
    res.render('signup', {
      user: req.user,
      message: "user exists"
    });
  }
  else {
    User.create(username, password);
    res.redirect('/login');
  }
});

router.get('/logout',
  function(req, res) {
    req.logout();
    res.redirect('/');
  });
  
router.get('/newtrade', require('connect-ensure-login').ensureLoggedIn(), function(req, res) {
  var sendbookid = req.query.sendbookid || 0;
  var receivebookid = req.query.receivebookid || 0;
  var books = BookStore.getAll();
  var mybooks = [];
  var theirbooks = [];
  for(var i=0; i<books.length; i++) {
    if(books[i].author === req.user.username) {
      mybooks.push(books[i]);
    }
    else{
      theirbooks.push(books[i]);
    }
  }
  var data = {
    user: req.user,
    sendbookid: sendbookid,
    receivebookid: receivebookid,
    mybooks: mybooks,
    theirbooks: theirbooks
  };
  res.render('newtrade', data);
});

router.post('/newtrade', require('connect-ensure-login').ensureLoggedIn(), function(req, res) {
  var sendbookid = req.body.sendbookid;
  var receivebookid = req.body.receivebookid;
  var sendbook = BookStore.getById(sendbookid);
  var receivebook = BookStore.getById(receivebookid);
  TradeStore.create(sendbook, receivebook, 'my');
  res.send({status:1});
});

router.get('/trade', require('connect-ensure-login').ensureLoggedIn(), function(req, res) {
  var tradeToMe = TradeStore.getTradeToMe(req.user.username);
  var tradeFromMe = TradeStore.getTradeFromMe(req.user.username);
  var data = {
    user: req.user,
    tradeToMe: tradeToMe,
    tradeFromMe: tradeFromMe
  };
  res.render('trade', data);
});

router.post('/trade', require('connect-ensure-login').ensureLoggedIn(), function(req, res) {
  var action = req.body.action;
  var tradeid = req.body.tradeid;
  var author = req.user.username;
  
  if (action === 'accept') {
    TradeStore.accept(tradeid, author);
    var trade = TradeStore.getById(tradeid);
    BookStore.getById(trade.sendbook.id).finished = 1;
    BookStore.getById(trade.receivebook.id).finished = 1;
  }
  else if (action === 'delete') {
    TradeStore.delete(tradeid, author);
  }
  res.send({status:1});
});


router.get('/profile', require('connect-ensure-login').ensureLoggedIn(), function(req, res) {
  res.render('profile', {
    user: req.user
  });
});

router.post('/profile', require('connect-ensure-login').ensureLoggedIn(), function(req, res) {
  var address = req.body.address;
  var username = req.user.username;
  var user = User.findOne(username, function(err, user){
    user.address= address;
    req.user.address = address;
    res.redirect('/');
  });
});
  
router.get('/create', require('connect-ensure-login').ensureLoggedIn(), function(req, res) {
  res.render('create', {
    user: req.user
  });
});

router.post('/create', require('connect-ensure-login').ensureLoggedIn(), function(req, res) {
  var title = req.body.title, url = req.body.url;
  var author = req.user.username;
  BookStore.create(title, url, author);
  res.redirect('/');
});

router.get('/my', require('connect-ensure-login').ensureLoggedIn(), function(req, res) {
  var author = req.user.username;
  var books = BookStore.getAll(author);
  res.render('my', {
    user: req.user,
    books: books
  });
});

router.post('/my', require('connect-ensure-login').ensureLoggedIn(), function(req, res) {
  var action = req.body.action;
  var bookid = req.body.bookid;
  var author = req.user.username;
  if (action == 'delete'){
    BookStore.delete(bookid, author);
  }
  res.redirect('/my');
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
