import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Travel data from main.json
const travelData = [
  {
    "id": 1,
    "name": "Red Fort",
    "type": "Historical Monument",
    "location": "Delhi, India",
    "timings": "9:30 AM - 4:30 PM (Closed on Mondays)",
    "amenities": ["Parking", "Guided Tours", "Museum", "Light & Sound Show"],
    "description": "A historic fortified palace of the Mughal emperors for nearly 200 years."
  },
  {
    "id": 2,
    "name": "Taj Mahal",
    "type": "Monument",
    "location": "Agra, Uttar Pradesh, India",
    "timings": "6:00 AM - 7:00 PM (Closed on Fridays)",
    "amenities": ["Parking", "Guided Tours", "Photography", "Cafeteria"],
    "description": "An ivory-white marble mausoleum, one of the Seven Wonders of the World."
  },
  {
    "id": 3,
    "name": "Jama Masjid",
    "type": "Mosque",
    "location": "Delhi, India",
    "timings": "7:00 AM - 12:00 PM, 1:30 PM - 6:30 PM",
    "amenities": ["Prayer Hall", "Minaret Climbing", "Photography"],
    "description": "One of the largest mosques in India, built by Mughal Emperor Shah Jahan."
  },
  {
    "id": 4,
    "name": "Gateway of India",
    "type": "Monument",
    "location": "Mumbai, Maharashtra, India",
    "timings": "Open 24 hours",
    "amenities": ["Boat Rides", "Street Food", "Photography", "Shopping"],
    "description": "An arch-monument built during the British Raj in Mumbai."
  },
  {
    "id": 5,
    "name": "Hawa Mahal",
    "type": "Palace",
    "location": "Jaipur, Rajasthan, India",
    "timings": "9:00 AM - 4:30 PM",
    "amenities": ["Museum", "Photography", "Architecture Tour"],
    "description": "A palace in Jaipur, made of red and pink sandstone."
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    console.log('Received message:', message);

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use OpenAI to understand the query and search through the data
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful travel assistant for India. You have access to information about these places: ${JSON.stringify(travelData)}. 

Your task is to:
1. Analyze the user's question
2. If the question is about any of the places in the data (timings, location, amenities, description), provide a helpful answer using ONLY the information from the data
3. If the question is completely outside the scope of the provided travel data, respond with exactly: "Sorry, that information is not available in my travel database."
4. Format your responses nicely and be conversational
5. If asked about timings, location, amenities, or descriptions, provide that specific information
6. If asked generally about a place, provide comprehensive information including timings, location, amenities, and description

Always be helpful and friendly, but stick to the data provided.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    console.log('Generated reply:', reply);

    // Check if we found relevant places for additional context
    const relevantPlaces = travelData.filter(place => 
      message.toLowerCase().includes(place.name.toLowerCase()) ||
      reply.toLowerCase().includes(place.name.toLowerCase())
    );

    return new Response(JSON.stringify({ 
      reply,
      places: relevantPlaces.length > 0 ? relevantPlaces : null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Sorry, I encountered an error processing your request. Please try again.',
      reply: 'Sorry, I encountered an error processing your request. Please try again.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});