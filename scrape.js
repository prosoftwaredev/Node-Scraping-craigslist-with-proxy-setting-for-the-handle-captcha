/******************************************************
 *
 * This is a node based webscraper that:
 * 1. Scrapes a web page and get a list of urls
 * 2. Traverses the URLs and scrapes each webpage
 * 3. Collects information from each URL and
 * 4. Outputs to STDOUT or to a file
 *
 ****************************************************/

var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');

const URL = 'https://newjersey.craigslist.org/search/fgs'; 
const base_url = 'https://newjersey.craigslist.org';

var total_count;
var count = 0;
var json = [];
var config_json = [];

scrape_data(URL, function (err) {
	if (err) {
		console.log(err);
		process.exit(0);
	}

	fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){

		console.log('File successfully written! - Check your project directory for the output.json file');
		
	})
	
	fs.writeFile('config.json', JSON.stringify(config_json, null, 4), function(err){

		console.log('File successfully written! - Check your project directory for the output.json file');
		
	})
});

function get_urls_by_page(url, next) {
	
	var options = {
        url: url,
        ca: fs.readFileSync("/etc/ssl/certs/crawlera-ca.crt"),
        requestCert: true,
        rejectUnauthorized: true
    };

    var new_req = request.defaults({
        'proxy': 'http://048d79d5bbae4fc788c350b0c64654dd:@proxy.crawlera.com:8010'
    });

	new_req(options, function(error, response, html){
		if (error || response.statusCode != 200) {
			console.log('Error:' + error);
			process.exit(0);
		}
		var $ = cheerio.load(html);
		if (count == 0) {
			total_count = $('.totalcount').eq(0).text();
		}

		$('ul.rows li p a.result-title').each(function(i, elm){
			var url = $(this).attr('href');

			if (url !== undefined){
				config_json[count] = {};
				json[count] = {};
				config_json[count] = base_url + url;
				json[count]['url'] = base_url + url;
				count++;
			}

		});
		next(null);
	});
}


function get_infor_by_page(next) {
	var get_data = async.queue(function(task, callback) {
		var options = {
	        url: json[task.idx]['url'],
	        ca: fs.readFileSync("/etc/ssl/certs/crawlera-ca.crt"),
	        requestCert: true,
	        rejectUnauthorized: true
	    };
	
	    var new_req = request.defaults({
	        'proxy': 'http://048d79d5bbae4fc788c350b0c64654dd:@proxy.crawlera.com:8010'
	    });
	
		new_req(options, function(err, response, html) {
			console.log("callback" + task.idx + "*******************");
			var $ = cheerio.load(html);

			json[task.idx]['date_of_posting'] = $('div.postinginfos').find('.postinginfo').eq(1).find('time').attr('datetime');
			json[task.idx]['title_of_post'] = $('.postingtitletext #titletextonly').text();
			json[task.idx]['body_of_text'] = $('#postingbody').text().replace(/\n/g,'');
			json[task.idx]['data_latitude'] = $('#map').attr('data-latitude');
			json[task.idx]['data_longitude'] = $('#map').attr('data-longitude');
			reply_url = base_url + "/reply/njy" + json[task.idx]['url'].replace(base_url, '').replace('.html', '');
			
			var options = {
		        url: reply_url,
		        ca: fs.readFileSync("/etc/ssl/certs/crawlera-ca.crt"),
		        requestCert: true,
		        rejectUnauthorized: true
		    };
		
		    var new_req = request.defaults({
		        'proxy': 'http://048d79d5bbae4fc788c350b0c64654dd:@proxy.crawlera.com:8010'
		    });
		
			new_req(options, function(error,reponse, body) {
				var $ = cheerio.load(reponse.body);
				$('.reply-tel-number').html() == null? json[task.idx]['reply_phone_number'] = 'NA':json[task.idx]['reply_phone_number'] = $('.reply-tel-number').html().replace('\n            &#x260E; ', '').replace('\n        ', '');
				$('.reply-email-address a').html() == null? json[task.idx]['reply_email'] = 'NA':json[task.idx]['reply_email'] = $('.reply-email-address a').html();
				if ($('.reply-tel-number').html() != null) {
					json[task.idx]['phone_type'] = 'Mobile Phone';
				} else {
					json[task.idx]['phone_type'] = 'NA';
				}
				console.log('-----------------------------------------------');
				console.log(json[task.idx]);
				callback();
			});
		})

	});

	var delta;

	count % 100 == 0 ? delta = 100: delta = count % 100;
	
	for (idx = count - delta; idx < count; idx ++) {
		get_data.push({idx: idx}, function(err) {
			console.log("count " + count);
		});
	}
	get_data.drain = function() {
		next();
	}
}

function scrape_data(url, cb){

	async.waterfall([
		function(next) {
			next(null, url);
		},
		get_urls_by_page,
		get_infor_by_page
		], function(err) {
			if (err) {
				cb(err);
			}
			if (count >= total_count) {
				cb(null);
			}
			else scrape_data(base_url+'/search/fgs?s=' + count, cb);
		})
}

