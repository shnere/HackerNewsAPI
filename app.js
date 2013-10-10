var express = require('express');
var jsdom = require("jsdom").jsdom;
var app = express();

var config = {
	'host' : 'https://news.ycombinator.com/',
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
			if(details[i].querySelector('a[href^="user"]')){
				news[i].author = details[i].querySelector('a[href^="user"]').textContent;
			}else{
				news[i].author = "";
			}
			// Get time
			news[i].time = details[i].innerHTML.match(timeRegex) || "";
			if(news[i].time !== ""){
				news[i].time = news[i].time[0];
			} 

			// Get Comments
			news[i].commentCount = details[i].innerHTML.match(commentsRegex) || 0;
			if(news[i].commentCount !== 0){
				news[i].commentCount = news[i].commentCount[0];
			}

		}
		return news;
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

app.listen(3000);