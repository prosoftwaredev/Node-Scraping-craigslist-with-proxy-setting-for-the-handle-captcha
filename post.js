var Nightmare = require('nightmare'),
    vo = require('vo'),
    nightmare = Nightmare({show:true},{
    switches: {
        'proxy-server': 'http://127.0.0.1:24000'
    }
});
require('nightmare-upload')(Nightmare);
var url = 'http://' + process.argv[2] + '.craigslist.org/';

module.exports = function * (ad, track) {
    console.log('Processing ad', track);
    if(track == 0){
        yield nightmare.goto(url)
            .wait(2000)
            .click('#postlks #post')
            .wait(2000)
            .click('input[value=so]')
            .click('.pickbutton')
            .wait(2000)
            .click('.selection-list li input')
            .wait(2000)
            // if(track == 0) {
                .insert('#inputEmailHandle', 'justinbauer200@gmail.com')
                .insert('#inputPassword', 'justin654321')
                .click('.login-box .accountform-btn')
                .wait(3000)
            // }
            .insert('#contact_phone', ad.reply_phone_number)
            .insert('#PostingTitle', ad.title_of_post)
            .insert('#GeographicArea', ad.city)
            .insert('#postal_code', '84097')

            .insert('#PostingBody', ad.body_of_text)
            .click('.bigbutton') // continue to image uplaoder
            .wait(2000)
            .click('.bigbutton') // done w images
            .wait(2000)
            .click('.bigbutton') // publish
            .wait(2000)
    } else {
        yield nightmare.goto(url)
            .wait(2000)
            .click('#postlks #post')
            .wait(2000)
            .click('input[value=so]')
            .click('.pickbutton')
            .wait(2000)
            .click('.selection-list li input')
            .wait(2000)
            .insert('#contact_phone', ad.reply_phone_number)
            .insert('#PostingTitle', ad.title_of_post)
            .insert('#GeographicArea', ad.city)
            .insert('#postal_code', '84097')

            .insert('#PostingBody', ad.body_of_text)
            .click('.bigbutton') // continue to image uplaoder
            .wait(2000)
            .click('.bigbutton') // done w images
            .wait(2000)
            .click('.bigbutton') // publish
            .wait(2000)
    }
}