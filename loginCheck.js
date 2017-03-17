var Nightmare = require('nightmare'),
  nightmare = Nightmare({show:true});

module.exports = function * (){
	 yield nightmare.goto('https://accounts.craigslist.org/login/home')
    .wait(2000)
    .title()
    .end()
    .then(function(result){
      loggedIn = (result === 'craigslist account');
    })
  return loggedIn
}