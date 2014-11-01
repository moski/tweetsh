#!/usr/bin/env ruby
$:.unshift "."
require 'rubygems'
require 'sinatra'

# The Oauth engine used to interact and authenticate with twitter
# configuration is located in config/oauth.yml
require 'twitter_oauth'

# A simple interface to deal with sessions and oauth client
require 'lib/authentication'

# Most of the data we send back is json, so we need a json parser
require 'json'

# A simple wrapper class to the json string coming from twitter.
Dir["wrappers/*.rb"].each {|r| require r}


# Extend the twitter_oauth library by adding few more functions to the Client class
Dir["lib/extend/twitter_oauth/*.rb"].each {|r| require r}

# Asset packger configuration
# I tried to package the js files using Dir["public/js/**/*.js"] but i had an issue with the ordering, some files
# has to be included before others.
# this will do for now
require 'sinatra/bundles'
stylesheet_bundle(:all, %w(main))
javascript_bundle(:all,
['usr/include/shell.h', 'utilites.jquery', 'usr/bin/keyboard','usr/bin/shell', 'usr/bin/commands',
 'usr/bin/pipe', 'usr/bin/iostream', 'usr/bin/clear', 'usr/include/inode.h', 'usr/bin/twitter_FS',
 'usr/bin/syscalls', 'usr/bin/pwd', 'usr/bin/cd', 'usr/bin/callbacks', 'usr/bin/twitter',
 'usr/bin/ls', 'usr/bin/parsers', 'usr/bin/ssh' , 'usr/bin/exit', 'usr/bin/head',
 'usr/bin/tail', 'usr/bin/wc', 'usr/bin/wall', "usr/bin/man" , "usr/bin/reverse"])

# Set the Mime-type for json
# NOTE: (invalid syntax) after upgrading to sintra 1.0 a .. but seems everthing
#       is still working fine
#mime :json, "application/json"


# Enable sessions and Load the Conf file.
configure do
  #set :sessions, true
  use Rack::Session::Pool
  @@config = YAML.load_file("config/oauth.yml") rescue nil || {}
end

# Include the Authentication helper
# Sinatra::Authentication defines the interface when dealing with
# session/current_user and loading the twitter_oauth client, please
# check lib/authentication.rb for mare information
helpers do
  include Sinatra::Authentication
end

# Just like the rails before_filter, these filter will get exectued
# each request.
# load_client: created the client object we use to interact with twitter
# @TODO:
# => Re-integrate the rate_limit_status call .. but must deal with caching layer first
before do
  next if request.path_info =~ /ping$/
  load_client
  #@rate_limit_status = @client.rate_limit_status
end

# Load the homepage, it can't be any simpler
get '/' do
  erb :home
end

# Pinging the site, useful for site monitoring
# Note: This function will skip all the before filter.
get '/ping' do
  'pong'
end

# Return information about a given user given the username
# The path var must be re-attached to the user object because
# we need it in the callback to create the user home folder
# Please check js/user/bin/callbacks.js for more information
post '/twitter/users' do
  user = User.new(@client.show(params['user']))

  user.path = params['path']
  user.to_json
end

# Handel everything under timelines(public/user/home)
# @TODO:
# => Integrate pagination
post %r{/twitter/timelines/(user_timeline|home_timeline|public_timeline)} do |action|
  # Extract the username
  screen_name = (params['path'] =~ /\/([A-Za-z_0-9]+)\/timelines\/(timeline|personal)/) ? $1 : nil

  #(user_timeline|friends_timeline|mentions|retweeted_by_me|retweeted_to_me|retweets_of_me)
  # Setup the options
  options = {}
  options[:screen_name] = screen_name unless screen_name.nil?

  # Get the data and parse it
  data   = @client.send(action ,  options)
  tweets = (data.is_a?(Hash) && data.has_key?('errors')) ? Base.new(data) : Tweets.new(data)

  puts tweets.inspect


  # return data
  tweets.to_json
end

# Handel a call to mentions or public_mentions
# Note: mentions is a direct call to the api, while public_mentions
#       calls the search engine to get the results back.
# @TODO:
# => Integrate pagination
post %r{/twitter/(mentions|public_mentions)} do |action|
  # Extract the username, only used if the call is 2 public_mentions
  screen_name = (params['path'] =~ /\/([A-Za-z_0-9]+)\/(mentions|public_mentions)/) ? $1 : nil

  # Setup the options
  options = {}
  options[:show_user] = true if action == 'public_mentions'

  # If its a a call to the public_mentions, meaning we are calling the search api.
  if(action == 'public_mentions')
    options[:show_user] = true
    data = @client.send(action, screen_name , options)
    tweets = (data.is_a?(Hash) && data.has_key?('errors')) ? Base.new(data) : Tweets.new(Tweets.convertSearchResults2TweetsHash(data))
  else
    data   = @client.send(action ,  options)

    puts "0000000000000"
    puts data.inspect

    tweets = (data.is_a?(Hash) && data.has_key?('errors')) ? Base.new(data) : Tweets.new(data)
  end

  puts tweets.inspect

  # return data
  tweets.to_json
end

# Deal with retweets, it will only work if the user is logged in.
post %r{/twitter/retweets/(by_me|to_me|of_me)} do |action|
  # Setup the options
  options = {}

  # Get the data and parse it
  # we have 3 actions defined in the twitter_oauth:
  # => 1.retweeted_by_me  2.retweeted_to_me   3. retweets_of_me
  # so we need cater for the retweets_ .. a simple if will do.
  action_name = (action == 'of_me') ? "retweets_#{action}" : "retweeted_#{action}"
  data   = @client.send(action_name ,  options)
  tweets = (data.is_a?(Hash) && data.has_key?('errors')) ? Base.new(data) : Tweets.new(data)

  # return data
  tweets.to_json
end

# Handel a call to mentions or public_mentions
# Note: mentions is a direct call to the api, while public_mentions
#       calls the search engine to get the results back.
# @TODO:
# => Integrate pagination
post %r{/twitter/favorites/(public|private)} do |action|
  # Extract the username
  screen_name = (params['path'] =~ /\/([A-Za-z_0-9]+)\/(favorites)/) ? $1 : nil

  # Setup the options
  options = {}

  # Set the screen_name if its a public call.
  options[:screen_name] = screen_name unless screen_name.nil? && action == 'public'

  data   = @client.send("favorites" ,  options)
  tweets = (data.is_a?(Hash) && data.has_key?('errors')) ? Base.new(data) : Tweets.new(data)

  # return data
  tweets.to_json
end

# Handels the requests for the friends && followers
# Possible actions (/friends/ for /followers/)
post %r{/twitter/users/(friends|followers)} do |action|
  # Extract the username
  screen_name = (params['path'] =~ /\/([A-Za-z_0-9]+)\/friends|followers/) ? $1 : nil

  # Setup the options
  options = {}
  options[:screen_name] = screen_name unless screen_name.nil?
  options[:cursor] = params['cursor'] if params.has_key?('cursor')

  # Get the data and parse it
  data = @client.send("#{action}_with_cursor" ,  options)
  users = data.has_key?('errors') ? Base.new(data) : Users.new(data)

  # return data
  users.to_json
end


# Send a tweet
post '/twitter/update' do
  data = @client.update(params[:update])
  tweets = (data.is_a?(Hash) && data.has_key?('errors')) ? Base.new(data) : Tweets.new([data])
  tweets.to_json
end

# store the request tokens and send to Twitter
# PLEASE NOTE:
# when running sinatra + thin ... when u call window.location.replace("/oauth/connect") using chrome,
# the session will get lost , no frakkin idea why, for now, use mongrel or webrick.
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
    redirect '/'
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


# Logout the user by clearing the session and redirect back to the
# the homepage
get '/oauth/disconnect' do
  session['current_user'] = nil
  session[:request_token] = nil
  session[:request_token_secret] = nil
  session[:access_token] = nil
  session[:secret_token] = nil
  redirect '/'
end


helpers do
  def partial(name, options={})
    erb("_#{name.to_s}".to_sym, options.merge(:layout => false))
  end
end

######################### experimental ############################
=begin
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
=end
