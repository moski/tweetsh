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
    
    def logged_in?
      return session[:user]
    end
    
    # Inclusion hook to load the config file
    def self.included(base)
      @@config = YAML.load_file("config/oauth.yml") rescue nil || {}
    end
  end
end