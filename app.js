var express = require('express');
var jsdom = require("jsdom").jsdom;
var app = express();

var config = {
	'host' : 'https://news.ycombinator.com/',
}

var helper = {
	getNews : function(){
		var walk = function(node){
			if(node.nodeType === 1 && node.tagName.toLowerCase() === "td" 
				&& node.classList.contains("title")){
				// Procesa dependiendo si es 
				console.log(node.innerHTML);
			}
			var child = node.firstChild;
			while(child){
				walk(child);
				child = child.nextSibling;
			}
		}
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
		var html = window.document.querySelector("html");
		console.log(html);
	});

		
});

app.listen(3000);