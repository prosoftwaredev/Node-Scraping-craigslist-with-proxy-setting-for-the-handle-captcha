var Nightmare = require('nightmare'),
  nightmare = Nightmare({show:true});

  var loggedIn;
  console.log('Attempting login...')
  nightmare.goto('https://accounts.craigslist.org/login/home')
    .wait(2000)
    .insert('#inputEmailHandle', 'final.fantasy.dev@gmail.com')
    .insert('#inputPassword', 'jamesdev')
    .click('.login-box .accountform-btn')
    .wait(2000)
    .title()
    .end()
    .then(function(result){
      loggedIn = (result === 'craigslist account');
    })
    console.log(loggedIn);