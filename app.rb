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
  
  unless @site.visitors.find(params[:visitor_id])
    create_visitor(@site.id, params[:visitor_id])
    show_pixel
  else
    pass # 404 - visitor already exists
  end
end

def create_visitor(site_id, visitor_id)
  # old version for inserting an embedded document
  # cmd = "db.sites.update({_id: ObjectId('#{site_id}')},{ '$push': { 'visitors': {_id: ObjectId('#{visitor_id}')}}},true);"
  cmd = "db.site_#{site_id}_visitors.insert({'_id': ObjectId('#{visitor_id}'), 'site_id': ObjectId('#{site_id}')});"
  Site.collection.database.command("$eval" => cmd, "nolock" => true)
end

get '/sites/:site_id/track.png' do
  puts "GET /sites/#{params[:site_id]}/track.png?#{params.to_query}"
  
  if params[:time]
    @time = Time.parse(params[:time])
  else
    @time = Time.now
  end
  @time = @time.strftime("%F %T")
  
  @site = Site.find(params[:site_id])
  @visitor = @site.visitors.find(params[:visitor_id])
  if @site and @visitor
    previous_loads = @visitor.loads.desc(:time)
    previous = previous_loads.find_by(uri_string: params[:http_referer])
    load_id = insert_load(previous)
    if previous
      top = load.time - previous.time
      previous.update_attributes(next_id: load_id, time_on_page: top)
    end
    
    if params[:cl_user_id]
      @visitor.update_attributes(current_cl_user_id: params[:cl_user_id])
      @visitor.add_to_set :cl_user_ids, params[:cl_user_id]
    end
  end
  
  show_pixel
end

def previous
  
end

def insert_load(prev=nil)
  cmd  = "db.site_#{@site.id}_loads.insert({"
  cmd += "'visitor_id': ObjectId('#{params[:visitor_id]}'),"
  cmd += "'previous_id': ObjectId('#{prev.id}')," if prev
  cmd += "'uri_string': '#{params[:uri_string]}'," if params[:uri_string]
  cmd += "'http_referer': '#{params[:http_referer]}'," if params[:http_referer]
  cmd += "'title': '#{params[:title]}'," if params[:title]
  cmd += "'user_agent': '#{params[:user_agent]}'," if params[:user_agent]
  cmd += "'screenx': '#{params[:screenx]}'," if params[:screenx]
  cmd += "'browserx': '#{params[:browserx]}'," if params[:browserx]
  cmd += "'browsery': '#{params[:browsery]}'," if params[:browsery]
  cmd += "'ip': '#{request.ip}',"
  cmd += "'time': new ISODate('#{@time}'),"
  cmd += "'cl_user_id': '#{params[:cl_user_id]}'," if params[:cl_user_id]
  cmd += "'query_parameters': '#{params[:query_parameters]}'," if params[:query_parameters]
  
  cmd += "'site_id': ObjectId('#{@site.id}')"
  cmd += "});"
  
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
