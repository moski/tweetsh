class Base
  # A hash containing all the attributes.
  attr_accessor :attributes
  
  def initialize(attributes={})
    @attributes = attributes
  end
  
  ##
  # Handles getters and setters for the first level of the hash.
  #
  #   record.title
  #   record.title = "Ruby: One Lang to rule them all, One Lang to find them, One Lang to bring them all and in the darkness bind them."
  def method_missing(method_symbol, *arguments)
    method_name = method_symbol.to_s

    case method_name[-1..-1]
    when "="
      @attributes[method_name[0..-2]] = arguments.first
    when "?"
      @attributes[method_name[0..-2]] == true
    else
      # Returns nil on failure so forms will work
      @attributes.has_key?(method_name) ? @attributes[method_name] : nil
    end
  end
  
  # Convert the object to a json string
  def to_json(*a)
    {
      'json_class'   => self.class.name,
      'data'         => @attributes
    }.to_json(*a)
  end
end