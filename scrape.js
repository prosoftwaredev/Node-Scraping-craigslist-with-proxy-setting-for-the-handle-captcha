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
var config = require('./config.js');
var vars = require('./vars.js');
var cert= fs.readFileSync(vars.cert_path);

async.each(config, eachUrl, 
	function(err) {
		if (err) {
			console.log(err);
		}
		else {
			console.log('OK');
		}
})

function eachUrl(url, callback) {
	
	const URL = url.url;
	

	var proxy_url = vars.proxy_url;
	
	var search_text = URL.substr(URL.indexOf("search/") + 7); 
    
	const base_url = URL.replace('/search/', '').replace(search_text, '');
	
	const city_name = base_url.replace('https://', '').replace('.craigslist.org', '');

	var total_count;
	var count = 0;
	var json = [];
	var config_json = [];
	var download_dir_init = './download';
	
	if(!fs.existsSync(download_dir_init)){
		fs.mkdir(download_dir_init);
	}

	var city_dir = './download' + '/' + city_name;
		
	if (!fs.existsSync(city_dir)){
	    fs.mkdirSync(city_dir);
	}
	
	var download_dir = './download' + '/' + city_name + '/' + search_text.replace('/', '');
	
	if (!fs.existsSync(download_dir)){
	    fs.mkdirSync(download_dir);
	}
	
	scrape_data(URL, function (err) {
		if (err) {
			console.log(err);
			process.exit(0);
		}
	});
	
	function get_urls_by_page(url, next) {
		
			var options = {
		        url: url,
		        ca: cert,
		        requestCert: true,
		        rejectUnauthorized: true
		    };
		
		    var new_req = request.defaults({
			        'proxy': proxy_url
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
		        ca: cert,
		        requestCert: true,
		        rejectUnauthorized: true
		    };
		
		    var new_req = request.defaults({
			        'proxy': proxy_url
		    });
		
			new_req(options, function(err, response, html) {
				console.log("callback" + task.idx + "*******************");
				var $ = cheerio.load(html);
	
				json[task.idx]['URL'] = URL;
				json[task.idx]['date_of_scrape'] = new Date();
				json[task.idx]['date_of_posting'] = $('div.postinginfos').find('.postinginfo').eq(1).find('time').attr('datetime');
	            json[task.idx]['date_of_update'] = $('body > section > section > section > div.postinginfos > p:nth-child(3) > time').attr('datetime');
				json[task.idx]['title_of_post'] = $('.postingtitletext #titletextonly').text();
				json[task.idx]['body_of_text'] = $('#postingbody').text().replace(/\n/g,'').replace('                    QR Code Link to This Post                    ','');
				json[task.idx]['data_latitude'] = $('#map').attr('data-latitude');
				json[task.idx]['data_longitude'] = $('#map').attr('data-longitude');
				json[task.idx]['first_img_url'] = $('div.swipe-wrap div.first img').attr('src');
	            json[task.idx]['service_type'] = $('body > section > header > nav > ul > li.crumb.category > p > a').text();
	            json[task.idx]['service_section'] = $('body > section > header > nav > ul > li.crumb.section > p > a').text();
	            json[task.idx]['area'] = $('body > section > header > nav > ul > li.crumb.area > p > a').text();
	            json[task.idx]['subarea'] = $('body > section > header > nav > ul > li.crumb.subarea > p > a').text();
	            
				var reply_url = base_url + $('body a#replylink').attr('href');
	            
				var options = {
			        url: reply_url,
			        ca: cert,
			        requestCert: true,
			        rejectUnauthorized: true
			    };
			
			    var new_req = request.defaults({
				        'proxy': proxy_url
			    });
			
				new_req(options, function(error,reponse, body) {
					var $ = cheerio.load(reponse.body);
					$('.reply-tel-number').html() == null? json[task.idx]['reply_phone_number'] = '':json[task.idx]['reply_phone_number'] = $('.reply-tel-number').html().replace('\n            &#x260E; ', '').replace('\n        ', '').replace('\next. 201',  '');
					$('.reply-email-address a').html() == null? json[task.idx]['reply_email'] = '':json[task.idx]['reply_email'] = $('.reply-email-address a').html();
					if ($('.reply-tel-number').html() != null) {
						json[task.idx]['phone_type'] = 'Mobile Phone';
					} else {
						json[task.idx]['phone_type'] = '';
					}
					console.log('-----------------------------------------------');
					console.log(json[task.idx]);
					
				    fs.readFile(download_dir + '/' + 'output.json', 'utf8', function readFileCallback(err, data){
					    if (err){
					    	
					    	var Json = [];
					    	Json.push(json[task.idx]);
					        fs.writeFile(download_dir + '/' + 'output.json', JSON.stringify(Json, null, 4), function(err){
								console.log('File successfully written! - Check your project directory for the output.json file');
							})
					    } else {
						    obj = JSON.parse(data); //now it an object
						    for (var i = 0 ; i < obj.length ; i ++) {
						    	if (obj[i]["url"] == json[task.idx]["url"]) {
						    		console.log('uuuuuuuuuuuuuuuuuuuuu');
						    		return false;
						    	}
						    }
						    obj.push(json[task.idx]);
						    // console.log(json[task.idx]);
						    // return false; //add some data
						    
						    fs.writeFile(download_dir + '/' + 'output.json', JSON.stringify(obj, null, 4), 'utf8', function(err, data) {
						    	if (err) {

						    	}
						    	else {
						    		console.log(data)
						    	}
						    }); // write it back 
						}
					});

					callback();
					  	
				});
					
			})
	
		});
	
		var delta;
	
		count % 120 == 0 ? delta = 120: delta = count % 120;
		
		for (var idx = count - delta; idx < count; idx ++) {
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
				else scrape_data(base_url+'/search/' + search_text + '?s=' + count, cb);
			})
	}
}


