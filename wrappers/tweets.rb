# A class that contains an array of tweets
class Tweets
  attr_accessor :tweets
  
  def initialize(tweets=[])
    @tweets = []
    tweets.reverse_each do |tweet|
      @tweets << Tweet.new(tweet)
    end
  end
  
  
  def self.convertSearchResults2TweetsHash(search_results)
    results = search_results['results']
    converted = []
    # Map the returned value in original user object reposnce, , missing few params but will do.
    user_keys = {'profile_image_url' => 'profile_image_url' , 'from_user' => 'screen_name' , 'from_user_id' => 'id'}
    results.reverse_each do |result|
      h = {}
      h['user'] = {}
      user_keys.each do |key,val|
        h['user'][val] = result[key] 
        result.delete(key)
      end
      h.merge!(result)
      converted << h
    end
    search_results.delete('results')
    converted
  end
  
  # Convert the object to a json string
  def to_json(*a)
    {
      'json_class'   => self.class.name,
      'data'         => @tweets
    }.to_json(*a)
  end
end