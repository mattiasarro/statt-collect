require 'rubygems'
require 'bundler'
Bundler.require

require './config/db'

get '/track' do
  
  time = Time.parse(params[:time]) || Time.now
  
  doc = {
    ip: params[:ip],
    cl_user_id: params[:cl_user_id],
    cookie_id: params[:cookie_id],
    time: time,
    
    http_referer: params[:http_referer],
    uri_string: params[:uri_string],
    query_parameters: params[:query_parameters]
  }
  
  loads = db.collection('loads')
  loads.insert(doc)
  
  doc.to_s # display this
end

def db
  connection = Mongo::Connection.from_uri(settings.db_uri)
  connection.db(settings.db_name, :strict => false)
end