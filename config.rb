configure :development do
  dev_db_name = 'statt'
  set :db_uri, "mongodb://localhost/#{dev_db_name}"
  set :db_name, dev_db_name
end

configure :test do
  test_db_name = 'statt_test'
  set :db_uri, "mongodb://localhost/#{test_db_name}"  
  set :db_name, test_db_name
end

configure :production do
  prod_db_name = 'heroku_app8278754'
  set :db_uri, "mongodb://heroku_app8278754:taj0lgc7qv3nrcg0bj56t63see@ds039737.mongolab.com:39737/#{prod_db_name}"
  set :db_name, prod_db_name
end