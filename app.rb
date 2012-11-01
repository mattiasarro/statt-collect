require 'rubygems'
require 'bundler'
Bundler.require

require './config/db'
Mongoid.load!("config/mongoid.yml")

set :public_folder, 'public'
set :views, File.dirname(__FILE__) + '/views'

# If 1st party cookie not set, user does a XmlHttpRequest
get '/sites/:site_id/new_visitor.png' do
  puts "GET /sites/#{params[:site_id]}/new_visitor.png?visitor_id=#{params[:visitor_id]}"
  
  @site = Site.find(params[:site_id])
  
  # # Could do this to support multiple domains:
  # if cookie set
  #   if visitor found
  #     VisitorAlias.create(to_id: params[:visitor_id])
  #   else
  #     create new visitor
  #     response.set_cookie("statt-#{@site.id}-visitor_id", 
  #                         value: params[:visitor_id], 
  #                         expires: 1.year.from_now)
  #   end
  # else # cookie not set
  #   if visitor found
  #     404
  #   else
  #     create visitor
  #     set cookie
  #   end
  # end
  
  unless @site.visitors.find(params[:visitor_id])
    create_visitor(@site.id, params[:visitor_id])
    show_pixel
  else
    pass # 404 - visitor already exists
  end
end

get '/track.png' do
  puts params
  show_pixel
end

def create_visitor(site_id, visitor_id)
  # Insert a new visitor embedded under the corresponding Site;
  # need a raw MongoDB call - no way to set _id otherwise 
  cmd = "db.sites.update({_id: ObjectId('#{site_id}')},{ '$push': { 'visitors': {_id: ObjectId('#{visitor_id}')}}},true);"
  Site.collection.database.command("$eval" => cmd, "nolock" => true)
end



def show_pixel
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
  embeds_many :visitors
end
class Visitor
  include Mongoid::Document
  embedded_in :site
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