import ChatBot from '@/components/ChatBot';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-chat p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-4">
            🇮🇳 Incredible India Travel Guide
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover amazing places with your AI-powered travel companion
          </p>
        </div>
        
        <div className="bg-card rounded-xl shadow-chat h-[600px] overflow-hidden">
          <ChatBot />
        </div>
        
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Ask about timings, locations, amenities, or general information about Indian tourist spots!</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
