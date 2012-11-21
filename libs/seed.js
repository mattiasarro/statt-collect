ObjectId = require('mongodb').ObjectID;

var vid1 = ObjectId("50a002c01b47f8b988000001");
var vid2 = ObjectId("50a002c01b47f8b988000002");
var pg1 = "http://example.com/";
var pg2 = "http://example.com/blog/";
var pg3 = "http://example.com/blog/posts/article-name";

var doc1 = {
  "title": "Load 1 :: Home Page",
  "uri_string": pg1, 
  "http_referer": "http://google.com/search?q=example",
  "visitor_id": vid1,
  "time": new Date(2012, 11, 14,  18,0,0)
}
var doc2 = {
  "title": "Load 2 :: Blog",
  "uri_string": pg2, 
  "http_referer": pg1,
  "visitor_id": vid1,
  "time": new Date(2012, 11, 14,  19,0,0)
}
var doc3 = {
  "title": "Load 3 :: Index (user 2)",
  "uri_string": pg1, 
  "http_referer": "http://yahoo.com",
  "visitor_id": vid2,
  "time": new Date(2012, 11, 14,  20,0,0)
}

var doc4 = {
  "title": "Load 4 :: Blog Post",
  "uri_string": pg3, 
  "http_referer": pg2,
  "visitor_id": vid1,
  "time": new Date(2012, 11, 14,  21,0,0),
  "cl_user_id": "john-doe"
}

var v1 = {
  "_id": vid1
}

function drop_and_seed(loads,visitors) {  
  loads.drop();
  loads.insert(doc1, {safe:true}, function (err, docs) {
    console.log("Inserted '"+ docs[0]["title"] +"'");
    loads.insert(doc2, {safe:true}, function (err, docs) {
      console.log("Inserted '"+ docs[0]["title"] +"'");
      loads.insert(doc3, {safe:true}, function(err, docs){
        console.log("Inserted '"+ docs[0]["title"] +"'");
        visitors.insert(v1, {safe:true}, function(err,docs){
          
          c = new Collector(loads,visitors);
          c.insert_load(doc4);
          
        }); // end v1
      }); // end doc3
    }); // end doc2
  }); // end doc1
}