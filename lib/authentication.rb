module Sinatra
  module Authentication
    def load_client
      @client = TwitterOAuth::Client.new(
          :consumer_key    =>  @@config['consumer_key'],
          :consumer_secret =>  @@config['consumer_secret'],
          :token => session[:access_token],
          :secret => session[:secret_token]
      )
    end
    
    # Load the user, either from session or from access token
    def current_user
      @current_user ||= (from_session || from_access_token)
    end
    
    # Store the given user in session
    def current_user=(new_user)
      session['current_user'] = new_user ? new_user : nil
      @current_user = new_user || false
    end
    
    # check if the user is logged in or not 
    def logged_in?
      return session['current_user']
    end
    
    # Inclusion hook to load the config file
    def self.included(base)
      @@config = YAML.load_file("config/oauth.yml") rescue nil || {}
    end
    
    
    # Load the user from session
    def from_session
      self.current_user = session['current_user'] if session['current_user']
    end
    
    # Load the user from acess token
    def from_access_token
      data = @client.info()
      self.current_user = data unless (data.has_key?('error'))
    end
  end
end