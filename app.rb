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

get '/sites/:site_id/track.png' do
  puts "GET /sites/#{params[:site_id]}/track.png?#{params}"
  
  time = Time.now
  
  doc = {
    visitor_id: params[:visitor_id],
    resource: params[:resource],
    http_referer: params[:http_referer],
    title: params[:title],
    user_agent: params[:user_agent],
    screenx: params[:screenx],
    browserx: params[:browserx],
    browsery: params[:browsery],
    time: time,
        
    ip: params[:ip],
    cl_user_id: params[:cl_user_id],
    
    uri_string: params[:uri_string],
    query_parameters: params[:query_parameters]
  }
  
  @site = Site.find(params[:site_id])
  @site.loads.create(doc)
  doc.to_s # display this
  
  
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


def db
  connection = Mongo::Connection.from_uri(settings.db_uri)
  connection.db(settings.db_name, :strict => false)
end


b = File.join(File.dirname(__FILE__), "..", "display", "app", "models")
require File.join(b, "site")
require File.join(b, "visitor")
require File.join(b, "load")

# class Site
#   include Mongoid::Document
#   embeds_many :loads
#   embeds_many :visitors
# end
# class Visitor
#   include Mongoid::Document
#   embedded_in :site
# end
# class Load
#   include Mongoid::Document
#   embedded_in :site
#   
#   field :ip
#   field :cl_user_id # optional
#   field :cookie_id
#   field :time, type: Time
#   field :time_on_page, type: Integer # in seconds
#   
#   field :http_referer
#   field :uri_string
#   field :query_parameters
#   
#   after_create :set_previous
#   after_create :set_cl_user_ids
#   
#   def set_cl_user_ids
#     if self.cl_user_id
#       visitor.add_to_set :cl_user_ids, self.cl_user_id
#       visitor.current_cl_user_id = self.cl_user_id
#       visitor.save
#     end
#   end
#   
#   def set_previous
#     puts "setting previous for #{self.id}"
#     previous_loads = visitor.loads.desc(:time)
#     self.previous = previous_loads.find_by(uri_string: self.http_referer)
#     if self.previous
# 
#       self.previous.next = self
#       self.previous.time_on_page = (self.time - self.previous.time).round
#       self.previous.save
#       self.save
#       puts "self.previous found: #{self.site.loads.find(self.id).previous_id}"
#     end
#   end
# end