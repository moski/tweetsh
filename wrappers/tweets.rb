# A class that contains an array of tweets
class Tweets
  attr_accessor :tweets
  
  def initialize(tweets=[])
    @tweets = []
    tweets.each do |tweet|
      @tweets << Tweet.new(tweet)
    end
  end
  
  # Convert the object to a json string
  def to_json(*a)
    {
      'json_class'   => self.class.name,
      'data'         => @tweets
    }.to_json(*a)
  end
end