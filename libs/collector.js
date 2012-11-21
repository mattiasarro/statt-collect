var BSON = require('mongodb').BSONPure;
function oid(id) {
  return(BSON.ObjectID.createFromHexString(id));
}

function Collector (loads,visitors) {
  this.loads = loads;
  this.visitors = visitors;
  
  this.insert_visitor = function (request) {
    var parsed = url.parse(request.url, true)
    var attr = parsed["query"];
    
    doc = {
      "_id": attr["visitor_id"],
      "site_id": oid(attr["site_id"])
    }
    visitors.insert(doc, {safe:false});
  }
  
  this.insert_load = function (doc) {
    var self = this;
    
    this.previous_loads_cursor(doc).nextObject(function (err, previous_load) {
      if (err) { console.log("ERROR: " + err); } 
      
      if (previous_load) {
        self.insert_with_previous(previous_load, doc);
      } else {
        self.insert_without_previous(doc);
      }

    });
  }
  
  this.previous_loads_cursor = function(doc) {
    var conds = {
      "visitor_id": doc["visitor_id"],
      "uri_string": doc["http_referer"]
    };
    var options = {
      "sort": [['time', 'desc']]
    }
    return(loads.find(conds,options));
  }
  
  this.insert_with_previous = function (previous_load, doc) {
    var self = this;
    
    doc["previous_id"] = previous_load["_id"];
    loads.insert(doc, {safe: true}, function (err, records) {
      var new_load = records[0];
      self.update_previous(previous_load, new_load);
      self.update_visitor(new_load);
    });
  }
  
  this.insert_without_previous = function (doc) {
    var self = this;
    
    loads.insert(doc, {safe:true}, function (err, records) {
      var new_load = records[0];
      self.update_visitor(new_load);
    })
  }
  
  this.update_previous = function (previous_load, new_load) {
    var q = {"_id": previous_load["_id"]};
    var u = {
      $set: {
        "next_id": new_load["_id"],
        "time_on_page": this.time_on_page(previous_load, new_load)
      } 
    };
    loads.update(q, u, {safe:false});
  }
  
  this.time_on_page = function (previous_load, new_load) {
    var ms = new_load["time"] - previous_load["time"];
    return (ms / 1000);
  }

  this.update_visitor = function (load) {
    if (load["cl_user_id"]) {
      q = {"_id": load["visitor_id"]};
      u = {
        $set:      { "current_cl_user_id": load["cl_user_id"] },
        $addToSet: { "cl_user_ids": load["cl_user_id"] }
      };
      visitors.update(q,u,{safe:false});
    }
  }

}

var url = require('url');
function build_doc(request) {
  var parsed = url.parse(request.url, true)
  var attr = parsed["query"];
  
  var doc = {
    "site_id": oid(attr["site_id"]),
    "visitor_id": oid(attr["visitor_id"]),
    "uri_string": attr["uri_string"],
    "ip": request.connection.remoteAddress
  };
  
  if (attr["time"]) {
    doc["time"] = parse_date(attr["time"]);
  } else {
    doc["time"] = new Date();
  }
  
  if (attr["ip"]) { // TODO: check for dev environment
    doc["ip"] = attr["ip"];
  }
  
  if (attr["http_referer"]) { doc["http_referer"] = attr["http_referer"] }
  if (attr["title"])        { doc["title"]        = attr["title"] }
  if (attr["user_agent"])   { doc["user_agent"]   = attr["user_agent"] }
  if (attr["screenx"])      { doc["screenx"]      = attr["screenx"] }
  if (attr["browserx"])     { doc["browserx"]     = attr["browserx"] }
  if (attr["browsery"])     { doc["browsery"]     = attr["browsery"] }
  if (attr["cl_user_id"])   { doc["cl_user_id"]   = attr["cl_user_id"] }
  if (attr["query_parameters"]) { doc["query_parameters"] = attr["query_parameters"] }
  
  return(doc);
}

function parse_date(date_str) {

  var m = date_str.match(/(\d{4})\-(\d{2})\-(\d{2}) (\d{2})\:(\d{2}):(\d{2}) \+(\d{4})/);
  
  var year = m[1];
  var month = parseInt(m[2], 10) - 1;
  var day = m[3];
  var hour = m[4];
  var minute = m[5];
  var second = m[6];
  
  var d = new Date(year, month, day,  hour,minute,second);
  return(d);
}

exports.Collector = Collector;
exports.build_doc = build_doc;