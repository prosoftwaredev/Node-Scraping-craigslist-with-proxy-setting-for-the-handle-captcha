var Nightmare = require('nightmare'),
  vo = require('vo'),
  nightmare = Nightmare({show:true});
require('nightmare-upload')(Nightmare);
var url = 'http://' + process.argv[2] + '.craigslist.org/';

module.exports = function * (ad, track) {
  console.log('Processing ad', track);
  yield nightmare.goto(url)
    .wait(2000)
    .click('#postlks #post')
    .click('input[value=so]')
    .click('.pickbutton')
    .wait(1000)
    .click('selection-list li input')
    .wait(1000)
    .click('#contact_phone_ok')
    .click('#contact_text_ok')
    .insert('#contact_phone', ad.phone)
    .insert('#PostingTitle', ad.title)
    .insert('#GeographicArea', ad.city)
    .insert('#postal_code', ad.zip)
    .insert('#PostingBody', ad.body)
    .click('#wantamap')
    .click('.bigbutton') // continue to image uplaoder
    .wait(1000)
    .click('.bigbutton') // done w images
    .wait(1000)
    .click('.bigbutton') // publish
    .wait(1000)
}