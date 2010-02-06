module TwitterOAuth
  class Client
    
    # The favorites method defined in twitter oauth doesn't allow u
    # to specifiy the user using the screen_name param. So i am remaning the favorites to old_favorites
    # and re-writting favorites.
    #alias old_favorites favorites 
    alias_method :old_favorites, :to_s
    
    
    def favorites(options = {})
      puts "XXXXXXXXXXXXXXXXXX"
      puts options.inspect
      args = options.map{|k,v| "#{k}=#{v}"}.join('&')
      get("/favorites.json?#{args}")
    end
  end
end