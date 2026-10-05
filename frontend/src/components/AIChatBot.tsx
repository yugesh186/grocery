import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, ShoppingCart } from 'lucide-react';
import { useApp, API_BASE_URL } from '../context/AppContext';
import { Link } from 'react-router-dom';

interface ChatMsg {
  sender: 'ai' | 'user';
  text: string;
  products?: { id: number; name: string; price: number; image_url?: string }[];
}

const AIChatBot: React.FC = () => {
  const { addToCart } = useApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      sender: 'ai',
      text: "Hello! I am your FreshKart AI Assistant. Ask me for recipes, healthy product alternatives, discount offers, or help checking out your cart!"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/ai/chat-assistant?message=${encodeURIComponent(userMsg)}`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, {
          sender: 'ai',
          text: data.reply,
          products: data.suggested_products
        }]);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: "I'm sorry, I'm having trouble connecting to my brain right now." }]);
      }
    } catch {
      setMessages(prev => [...prev, { sender: 'ai', text: "Network connection error. Please try again soon." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      {/* Floating Action Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-emerald-500 text-white rounded-full shadow-premium hover:shadow-premium-hover hover-lift border border-primary/20"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="font-semibold text-sm">Ask Assistant</span>
        </button>
      )}

      {/* Expanded Chat Box */}
      {open && (
        <div className="w-[360px] sm:w-[400px] h-[500px] rounded-2xl glass-panel shadow-premium border border-gray-200/50 dark:border-gray-800/80 flex flex-col overflow-hidden transition-all duration-300">
          
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-primary to-emerald-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <h4 className="font-bold text-sm leading-none">FreshKart AI</h4>
                <span className="text-[10px] text-emerald-100">Smart shopping assistant</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-950/30">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/10">
                    <Bot className="w-4.5 h-4.5" />
                  </div>
                )}
                <div className="space-y-2 max-w-[75%]">
                  <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-800'
                  }`}>
                    {m.text}
                  </div>

                  {/* Suggestion Products Cards inside Chat */}
                  {m.products && m.products.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {m.products.map(p => (
                        <div key={p.id} className="flex items-center justify-between gap-3 p-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-xl shadow-xs">
                          <div className="flex items-center gap-2">
                            <img src={p.image_url} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />
                            <div>
                              <Link to={`/products/${p.id}`} onClick={() => setOpen(false)} className="text-xs font-bold text-gray-800 dark:text-white hover:text-primary block line-clamp-1">
                                {p.name}
                              </Link>
                              <span className="text-xs text-gray-900 dark:text-gray-300 font-extrabold">₹{p.price.toFixed(2)}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => addToCart(p.id)}
                            className="p-1.5 bg-primary-light hover:bg-primary hover:text-white text-primary rounded-lg transition-all"
                            title="Add to cart"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {m.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center shrink-0">
                    <User className="w-4.5 h-4.5" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center animate-spin">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs text-gray-400 font-medium">FreshKart is thinking...</span>
              </div>
            )}
          </div>

          {/* Input Footer Form */}
          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200/60 dark:border-gray-850 flex gap-2">
            <input
              type="text"
              placeholder="Ask for salad recipes or deals..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-full focus:bg-white dark:focus:bg-gray-950 focus:border-primary focus:outline-none text-sm transition-all"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-primary text-white rounded-full hover:bg-primary-dark disabled:bg-gray-100 disabled:text-gray-450 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};

export default AIChatBot;
