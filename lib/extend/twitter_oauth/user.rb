module TwitterOAuth
  class Client
    # Returns the 100 last friends
    def friends_with_cursor(options = {})
      # Equivalent to options.reverse_merge({:cursor => -1}) in rails
      options = {:cursor => -1}.merge(options)
      args = options.map{|k,v| "#{k}=#{v}"}.join('&')
      get("/statuses/friends.json?#{args}")
    end 
    
    # Returns the 100 last followers
    def followers_with_cursor(options = {})
      # Equivalent to options.reverse_merge({:cursor => -1}) in rails
      options = {:cursor => -1}.merge(options)
      args = options.map{|k,v| "#{k}=#{v}"}.join('&')
      get("/statuses/followers.json?#{args}")
    end
  end
end