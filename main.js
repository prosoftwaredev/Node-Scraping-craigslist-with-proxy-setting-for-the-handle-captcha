var Nightmare = require('nightmare'),
  nightmare = Nightmare();
var vo = require('vo');
var ads = require('./ads.js');
var post = require('./post.js');
// var performLogin = require('./performLogin.js');
// var loginCheck = require('./loginCheck.js');

// var run = function * (totalAds) {
  
//   console.log('asd');
//   var loggedIn = yield vo(loginCheck)();
//   switch(loggedIn) {
//     case true:
//       console.log('Logged in succesfully');
//       nightmare.end(); 
//       vo(main)(totalAds);
//       break;
//     case false: 
//       // console.log('Login check failed, trying to login')
//       // loggedIn = yield vo(performLogin)();
//       // console.log(loggedIn);
//       // nightmare.end(); 
//       // loggedIn ? vo(main)(totalAds) : console.log('Unable to log in. Please verify credentials and source code')
//       vo(main)(totalAds)
//       break;
//   }
// };

var main = function * (totalAds) {
  var post = require('./post.js');
  var ads = require('./ads.js');
  for (var i = 0; i < totalAds; i++) {
    console.log('Attempting to post ad', i);
    yield vo(post)(ads[i], i);
    nightmare.end();
  }
  process.exit();
};

vo(main)(ads.length)
// for (var i = 0; i < ads.length; i++) {
//   console.log('Attempting to post ad', i);
// }