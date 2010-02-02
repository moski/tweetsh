#!/usr/bin/env ruby
require 'rubygems'
require 'sinatra'
require 'twitter_oauth'
require 'lib/authentication'
require 'json'

require 'wrappers/base'
require 'wrappers/user'
require 'wrappers/users'
require 'wrappers/tweet'
require 'wrappers/tweets'


require 'lib/extend/twitter_oauth/user'


mime :json, "application/json"

configure do
  set :sessions, true
  @@config = YAML.load_file("config/oauth.yml") rescue nil || {}
end

helpers do
  include Sinatra::Authentication
end


before do
  next if request.path_info =~ /ping$/
  @user = session['current_user']
  load_client
  #@rate_limit_status = @client.rate_limit_status
end

# Yep, its that simple :) ....
post '/twitter/users' do
  data = @client.show(params['user'])
  user = User.new(data)
  user.path = params['path']
  user.to_json
end

post '/twitter/user_timeline' do
  # Get the username from the url, the structure for the incoming path is:
  # /home/USERNAME/timeline 
  username = (params['path'] =~ /\/([A-Za-z_0-9]+)\/timeline/) ? $1 : ""
  data = @client.user_timeline(:screen_name => username)
  tweets = Tweets.new(data)
  tweets.to_json
end



# Handels the requests for the friends && followers
# Possible actions (/friends/ for /followers/)
post %r{/twitter/users/(friends|followers)} do |action|
  # Extract the username
  username = (params['path'] =~ /\/([A-Za-z_0-9]+)\/friends|followers/) ? $1 : ""
  data = @client.send("#{action}_with_cursor" ,  :screen_name => username)
  users = data.has_key?('error') ? Base.new(data) : Users.new(data)
  users.to_json
end

post '/twitter/followers' do
  # Get the username from the url, the structure for the incoming path is:
  # /home/USERNAME/friends 
  username = (params['path'] =~ /\/([A-Za-z_0-9]+)\/followers/) ? $1 : ""
  data = @client.followers(:screen_name => username)
  users = data.has_key?('error') ? Base.new(data) : Users.new(data)
  users.to_json
end


# store the request tokens and send to Twitter
get '/oauth/connect' do
  request_token = @client.request_token(
    :oauth_callback => @@config['callback_url']
  )
  session[:request_token] = request_token.token
  session[:request_token_secret] = request_token.secret
  redirect request_token.authorize_url.gsub('authorize', 'authenticate') 
end


# auth URL is called by twitter after the user has accepted the application
# this is configured on the Twitter application settings page
get '/oauth/auth' do
  # Exchange the request token for an access token.
  
  begin
    @access_token = @client.authorize(
      session[:request_token],
      session[:request_token_secret],
      :oauth_verifier => params[:oauth_verifier]
    )
  rescue OAuth::Unauthorized
  end
  
  if @client.authorized?
      # Storing the access tokens so we don't have to go back to Twitter again
      # in this session.  In a larger app you would probably persist these details somewhere.
      session[:access_token] = @access_token.token
      session[:secret_token] = @access_token.secret
      current_user = from_access_token
  end
  redirect '/'
end



get '/info' do
  puts "---------------------------"
  puts session['current_user']['screen_name']
  puts "-------------------------------"
end








get '/' do
  #redirect '/timeline' if logged_in?
  erb :home
end

get '/timeline' do
  @tweets = @client.friends_timeline
  erb :timeline
end

get '/mentions' do
  @tweets = @client.mentions
  erb:timeline
end

get '/retweets' do
  @tweets = @client.retweets_of_me
  erb:timeline
end

get '/retweeted' do
  @tweets = @client.retweeted_by_me
  erb:timeline
end

post '/update' do
  @client.update(params[:update])
  redirect '/timeline'
end

get '/messages' do
  @sent = @client.sent_messages
  @received = @client.messages
  erb :messages
end

get '/search' do
  params[:q] ||= 'sinitter OR twitter_oauth'
  @search = @client.search(params[:q], :page => params[:page], :per_page => params[:per_page])
  erb :search
end





get '/disconnect' do
  session['current_user'] = nil
  session[:request_token] = nil
  session[:request_token_secret] = nil
  session[:access_token] = nil
  session[:secret_token] = nil
  redirect '/'
end

# useful for site monitoring
get '/ping' do 
  'pong'
end

helpers do 
  def partial(name, options={})
    erb("_#{name.to_s}".to_sym, options.merge(:layout => false))
  end
end