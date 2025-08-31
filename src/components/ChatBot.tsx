import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, MapPin, Clock, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import placesData from '@/data/main.json';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  placeData?: any;
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "🙏 Namaste! I'm your travel guide for incredible places in India. Ask me about any tourist destination, timings, amenities, or travel tips!",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findRelevantPlace = (query: string) => {
    const queryLower = query.toLowerCase();
    
    return placesData.places.find(place => {
      const nameMatch = place.name.toLowerCase().includes(queryLower);
      const categoryMatch = place.category.some(cat => 
        cat.toLowerCase().includes(queryLower) || queryLower.includes(cat.toLowerCase())
      );
      const infoMatch = place.info.toLowerCase().includes(queryLower);
      const addressMatch = place.location.address.toLowerCase().includes(queryLower);
      
      return nameMatch || categoryMatch || infoMatch || addressMatch;
    });
  };

  const generateResponse = (query: string) => {
    const place = findRelevantPlace(query);
    
    if (!place) {
      return {
        content: "Sorry, that information is not available. I can only help with places and destinations in my knowledge base. Try asking about popular tourist spots, temples, monuments, or specific cities in India!",
        placeData: null
      };
    }

    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('timing') || queryLower.includes('hours') || queryLower.includes('open')) {
      const hoursInfo = Array.isArray(place.hours) 
        ? place.hours.map(h => `${h.days}: ${h.open} - ${h.close}`).join(', ')
        : 'Hours information not available';
      return {
        content: `⏰ **${place.name}** is open:\n${hoursInfo}`,
        placeData: place
      };
    }
    
    if (queryLower.includes('address') || queryLower.includes('location') || queryLower.includes('where')) {
      return {
        content: `📍 **${place.name}** is located at:\n${place.location.address}`,
        placeData: place
      };
    }
    
    if (queryLower.includes('amenities') || queryLower.includes('facilities')) {
      const amenities = [];
      if (place.amenities.family_friendly) amenities.push('Family Friendly');
      if (place.amenities.pet_friendly) amenities.push('Pet Friendly');
      
      return {
        content: `🏢 **${place.name}** amenities:\n${amenities.length ? amenities.join(', ') : 'Basic amenities available'}`,
        placeData: place
      };
    }
    
    return {
      content: `ℹ️ **${place.name}**\n\n${place.info}\n\n📍 ${place.location.address}`,
      placeData: place
    };
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(input);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.content,
        timestamp: new Date(),
        placeData: response.placeData,
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-hero p-4 rounded-t-xl shadow-card">
        <div className="flex items-center gap-3">
          <div className="bg-background/20 p-2 rounded-full">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary-foreground">India Travel Guide</h2>
            <p className="text-primary-foreground/80 text-sm">Your AI assistant for exploring India</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4 bg-gradient-chat" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 max-w-[80%]",
                message.type === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                message.type === 'user' 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-secondary-foreground"
              )}>
                {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              
              <div className="space-y-2">
                <Card className={cn(
                  "p-3 shadow-card transition-smooth",
                  message.type === 'user' 
                    ? "bg-primary text-primary-foreground ml-auto" 
                    : "bg-card"
                )}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </p>
                </Card>
                
                {message.placeData && (
                  <Card className="p-4 bg-gradient-card border-primary/20 shadow-card">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">{message.placeData.name}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {Array.isArray(message.placeData.hours) && message.placeData.hours[0] 
                              ? `${message.placeData.hours[0].open} - ${message.placeData.hours[0].close}`
                              : 'Hours vary'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Info className="w-3 h-3 text-muted-foreground" />
                          <div className="flex gap-1">
                            {message.placeData.amenities.family_friendly && (
                              <span className="bg-secondary px-2 py-1 rounded text-xs">Family Friendly</span>
                            )}
                            {message.placeData.amenities.pet_friendly && (
                              <span className="bg-secondary px-2 py-1 rounded text-xs">Pet Friendly</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {message.placeData.map_link && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => window.open(message.placeData.map_link, '_blank')}
                        >
                          <MapPin className="w-3 h-3 mr-1" />
                          View on Map
                        </Button>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <Card className="p-3 bg-card shadow-card">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-200"></div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-card border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Ask about places in India..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 transition-smooth focus:shadow-chat"
            disabled={isTyping}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className="transition-spring hover:scale-105"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;