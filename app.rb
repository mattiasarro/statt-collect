require 'sinatra'
require './collect_config'

get '/track' do
  doc = {
    ip: params[:ip],
    user_id: params[:user_id],
    time: Time.now
  }
  
  
  loads = db.collection('loads')
  loads.insert(doc)
  
  doc.to_s # display this
end

def db
  connection = Mongo::Connection.from_uri(settings.db_uri)
  connection.db(settings.db_name, :strict => false)
end