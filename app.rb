require 'rubygems'
require 'bundler'
Bundler.require

require './config/db'
Mongoid.load!("config/mongoid.yml")

set :public_folder, 'public'

get '/track.png' do
  
  puts params
  
  content_type 'image/png'
  File.read("pixel.png")
end

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
  
  @site = Site.find(params[:site_id])
  @site.loads.create(doc)
  doc.to_s # display this
end

def db
  connection = Mongo::Connection.from_uri(settings.db_uri)
  connection.db(settings.db_name, :strict => false)
end

class Site
  include Mongoid::Document
  embeds_many :loads
end
class Load
  include Mongoid::Document
  embedded_in :site
  
  field :ip
  field :cl_user_id # optional
  field :cookie_id
  field :time, type: Time
  field :time_on_page, type: Integer # in seconds
  
  field :http_referer
  field :uri_string
  field :query_parameters
end