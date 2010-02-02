# A class that contains an array of tweets
class Users
  attr_accessor :users
  attr_accessor :attributes
  
  def initialize(data)
    @users = []
    data['users'].each do |user|
      @users << User.new(user)
    end
    
    data.delete('users')
    @attributes = data
  end
  
  # Convert the object to a json string
  def to_json(*a)
    {
      'json_class'   => self.class.name,
      'data'         => {:users => @users , :attributes => @attributes}
    }.to_json(*a)
  end
end