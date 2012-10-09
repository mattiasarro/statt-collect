require 'rubygems'
require 'bundler'

Bundler.require

get '/track' do
  db = Mongo::Connection.new.db('statt', :strict => false)
  coll = db.collection('visits')
  
  doc = {ip: params[:ip]}
  coll.insert(doc)
  doc.to_s # display this
end