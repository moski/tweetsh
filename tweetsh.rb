#!/usr/bin/env ruby
require 'rubygems'
require 'sinatra'
require 'twitter_oauth'
require 'lib/authentication'
require 'json'

require 'wrappers/user'

mime :json, "application/json"

configure do
  set :sessions, true
  @@config = YAML.load_file("config.yml") rescue nil || {}
end

helpers do
  include Sinatra::Authentication
end


before do
  next if request.path_info =~ /ping$/
  @user = session[:user]
  load_client
  #@rate_limit_status = @client.rate_limit_status
end

# Yep, its that simple :) ....
post '/twitter/users' do
  data = @client.show(params['user'])
  user = User.new(data)
  user.to_json
end



get '/' do
  redirect '/timeline' if logged_in?
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

# store the request tokens and send to Twitter
get '/connect' do
  request_token = @client.request_token(
    :oauth_callback => ENV['CALLBACK_URL'] || @@config['callback_url']
  )
  session[:request_token] = request_token.token
  session[:request_token_secret] = request_token.secret
  redirect request_token.authorize_url.gsub('authorize', 'authenticate') 
end

# auth URL is called by twitter after the user has accepted the application
# this is configured on the Twitter application settings page
get '/auth' do
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
      session[:user] = true
      redirect '/timeline'
    else
      redirect '/'
  end
end

get '/disconnect' do
  session[:user] = nil
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