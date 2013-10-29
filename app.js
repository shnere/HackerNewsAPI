var express = require('express'),
	app = express(),
	jsdom = require("jsdom").jsdom,
	async = require("async"),
	config = {
		host : 'https://news.ycombinator.com/',
	};

// Async function, recieves object and loops asynchronously by callling "loopFunction"
var async = function(o){
	var i = 0,
	length = o.length, 
	url = "";

	var loop = function(url){
		i++;
		if(i === o.length){
			o.callback();
			return;
		}
		o.loopFunction(loop, i, url);
	}
	loop("");
}

var helper = {
	getNews : function(document){
		var news = [];

		var titles = document.querySelectorAll('td.title:not([align="right"])');
		for(var i = 0; i < titles.length; i++){
			if(i === 30){
				break;
			}
			anchor = titles[i].querySelector("a") || "";
			comhead = titles[i].querySelector("span") || "";
			var obj = {
				title : anchor === "" ? "" : anchor.textContent,
				url : anchor.getAttribute("href") || "",
				comhead : comhead === "" ? "" : comhead.textContent.slice(2, -2)
			};
			news.push(obj);
		}

		var details = document.querySelectorAll('td.subtext');
		var timeRegex = /\d+\s\w+\s+ago/;
		var commentsRegex = /\d+\s+comments/;
		for(var i = 0; i < news.length; i++){
			if(details[i].querySelector('span')){
				news[i].points = details[i].querySelector('span').textContent.split(' ')[0];
			}else{
				news[i].points = 0;
			}
			// Get author
			if(details[i].querySelector('a[href^="user"]')){
				news[i].author = details[i].querySelector('a[href^="user"]').textContent;
			}else{
				news[i].author = "";
			}

			// Get post id
			if(details[i].querySelector('a[href^="item"]')){
				news[i].postUrl = config.host + details[i].querySelector('a[href^="item"]').getAttribute("href");
			}else{
				news[i].postUrl = "";
			}

			// Get time
			news[i].time = details[i].innerHTML.match(timeRegex) || "";
			if(news[i].time !== ""){
				news[i].time = news[i].time[0];
			} 

			// Get Comments
			news[i].commentCount = details[i].innerHTML.match(commentsRegex) || 0;
			if(news[i].commentCount !== 0){
				news[i].commentCount = news[i].commentCount[0].split(' ')[0];
			}

		}
		return news;
	},
	getNextUrl : function(document){
		// Using document.querySelector('a[href^="/x"]').getAttribute("href"); doesn't work because first elementURL is news2
		// Fallback: traverse each anchor and look for a node with "More"
		var anchors = document.querySelectorAll('a');
		for(var i = 0; i < anchors.length; i++){
			if(anchors[i].textContent === "More"){
				//console.log("attr: "+anchors[i].outerHTML);
				return anchors[i].getAttribute("href").slice(1);
			}
		}
		return "";
	}
}

app.get('/', function(req, res){
	res.type('application/json');
	res.send(JSON.stringify({
		name: "HackerNewsAPI",
		description: "Hacker News API",
		version: "0.0.1"
	}, null, '\t'));
});

app.get('/news', function(req, res){

	jsdom.env(config.host, function(err, window){
		var news = helper.getNews(window.document);
	
		res.type('application/json');
		res.send(JSON.stringify(news, null, '\t'));
	});
	
});

app.get(/^\/page\/(\d+)$/, function(req, res){
	// Get x page
	var page 	= parseInt(req.params[0]),
		url 	= '',
		news 	= [];
	if(page === 1){
		res.redirect('/news');
		return;
	}
	
	/*
		TODO same as pages (getting next urls) but wihtout concatenating arrays
	*/
	
});


app.get(/^\/news\/(\d+)$/, function(req, res){
	var pages 	= parseInt(req.params[0]),
		url 	= '',
		news 	= [];
	if(pages === 1){
		res.redirect('/news');
		return;
	}
	
	// Traverse asynchronously *pages times calling loopFunction, when finished do callback
	async({
		length : pages+1,
		// Get DOM from url and concatenates it to news array
		loopFunction: function(loop, i, url){
			console.log("llamo dom: "+config.host+url);
			jsdom.env(config.host+url, function(err, window){
				news = news.concat(helper.getNews(window.document));
				url = (i === 1 ? 'news2' : helper.getNextUrl(window.document) );
				console.log("Iteration " + i + " url: " + url);
				loop(url);
			});

		},
		callback: function(){
			// Done
			res.type('application/json');
			res.send(JSON.stringify(news, null, '\t'));
		}
	});
	
});


app.listen(3000);