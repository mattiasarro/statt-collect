var http = require('http');
var url = require("url");
var env = process.argv[2];
switch (env) {
  case "development":
    var mongo_host = "127.0.0.1";
    var mongo_port = 27017;
    var mongo_db = "statt";
    
    var host = "http://127.0.0.1";
    var port = process.env.PORT || 9393;
    
    break;
  case "test":
    var mongo_host = "127.0.0.1";
    var mongo_port = 27017;
    var mongo_db = "statt_test"

    var host = "http://127.0.0.1";
    var port = process.env.PORT || 9394;
    
    break;
  case "production":
  default:
    var mongo_host = "ds039737.mongolab.com";
    var mongo_port = 39737;
    var mongo_db = "heroku_app8278754";
    
    var mongo_user = "heroku_app8278754";
    var mongo_pass = "taj0lgc7qv3nrcg0bj56t63see";
    
    var host = "http://statt-collect.herokuapp.com";
    var port = process.env.PORT || 5000;
}

// /usr/local/share/npm/bin/supervisor statt-collect.js development

var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;

var server = new Server(mongo_host, mongo_port, {});
var db = new Db(mongo_db, server, {safe:true});
if (mongo_user) {
  db.authenticate(mongo_user, mongo_pass, function(err, res){
    if (err) {
      console.log("unable to authenticate with user("+mongo_user+")");
    }
  });
}

var Collector = require('./libs/collector').Collector;
var build_doc = require('./libs/collector').build_doc;
var pixel = require('./libs/pixel');

db.open(function(e, db) {
  http.createServer(function (request, response) {
    var pathname = url.parse(request.url).pathname;
    var attr = url.parse(request.url, true)["query"];
    var site_id = attr["site_id"];
    var loads_coll = "site_"+ site_id +"_loads";
    var visitors_coll = "site_"+ site_id +"_visitors";
    
    db.collection(loads_coll, {safe:false}, function(e, loads) {
      if (e) { console.log("ERROR "+e); }
      db.collection(visitors_coll, {safe:false}, function(e, visitors) {
        if (e) { console.log("ERROR "+e); }
        var collector = new Collector(loads,visitors);
        
        
        switch (pathname) {
          case "/track.js":
            show("/public/track.js", response);
            break;
          case "/track.png":
            var msg = "track " + attr["uri_string"];
            // msg += ": " + request.url;
            console.log(msg);
            response.writeHead(200, pixel.headers);
            response.end(pixel.data);
            
            var doc = build_doc(request);
            collector.insert_load(doc);
            
            break;
          case "/new_visitor.png":
            console.log("new_visitor "+ attr["visitor_id"]);
            response.writeHead(200, pixel.headers);
            response.end(pixel.data);
            
            collector.insert_visitor(request);
            
            break;
          default:
            console.log("incorrect path "+ pathname);
            response.writeHead(200, {'Content-Type': 'text/plain'});
            response.end("unknown route");
        }
        
      });
    });
  }).listen(port);
  console.log('Loading '+env+' environment.');
  console.log('Server running at '+host+':'+port+'/');
}); // end db

function show(path, response) {
  var fs = require('fs'),
      http = require('http');
  
  fs.readFile(__dirname + path, function (err,data) {
    if (err) {
      response.writeHead(404);
      response.end(JSON.stringify(err));
      return;
    }

    response.writeHead(200, {'Content-Type': 'text/javascript'});
    response.end(data);
  });
}