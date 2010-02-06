module TwitterOAuth
  class Client
    # Find the mentions given the username.
    # This function doesn't rely on twitter mentions api because api only returns
    # mentions for the authenticated users. So i am using the search api get it.
    def public_mentions(username,options)
      puts "username == #{username}"
      search("@#{username}", options)
    end
  end
end