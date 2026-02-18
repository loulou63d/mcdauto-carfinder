import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Trash2, Send, Loader2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Markdown from 'react-markdown';
import { WelcomeForm, type CustomerInfo } from './WelcomeForm';
import { VehicleCardInline } from './VehicleCardInline';
import { AppointmentFormInline } from './AppointmentFormInline';
import { EstimateFormInline } from './EstimateFormInline';
import { VehicleCompareInline } from './VehicleCompareInline';
import { CheckoutFormInline } from './CheckoutFormInline';
import { UploadReceiptInline } from './UploadReceiptInline';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const SESSION_KEY = 'mcd-chat-session';
const CUSTOMER_KEY = 'mcd-chat-customer';

type Msg = { role: 'user' | 'assistant'; content: string };

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function parseInlineComponents(content: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\[VEHICLE_CARD:(\{[\s\S]*?\})\]|\[VEHICLE_COMPARE:(\{[\s\S]*?\})\]|\[APPOINTMENT_FORM\]|\[ESTIMATE_FORM\]|\[CHECKOUT_FORM\]|\[UPLOAD_RECEIPT(?::(\{[\s\S]*?\}))?\]|\[SIGNUP_FORM\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index);
      parts.push(<div key={`md-${lastIndex}`} className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2"><Markdown>{text}</Markdown></div>);
    }

    if (match[0] === '[APPOINTMENT_FORM]') {
      parts.push(<AppointmentFormInline key={`apt-${match.index}`} />);
    } else if (match[0] === '[ESTIMATE_FORM]') {
      parts.push(<EstimateFormInline key={`est-${match.index}`} />);
    } else if (match[0] === '[CHECKOUT_FORM]') {
      parts.push(<CheckoutFormInline key={`chk-${match.index}`} />);
    } else if (match[0].startsWith('[UPLOAD_RECEIPT')) {
      let orderId: string | undefined;
      try { if (match[3]) orderId = JSON.parse(match[3]).orderId; } catch {}
      parts.push(<UploadReceiptInline key={`upl-${match.index}`} orderId={orderId} />);
    } else if (match[0] === '[SIGNUP_FORM]') {
      parts.push(<div key={`signup-${match.index}`} className="my-2 p-3 rounded-lg bg-primary/5 border text-sm text-center">
        <a href={`/${document.documentElement.lang || 'de'}/login`} className="text-primary font-semibold hover:underline">Konto erstellen →</a>
      </div>);
    } else if (match[2]) {
      try {
        const data = JSON.parse(match[2]);
        const vehicles = data.vehicles || data;
        if (Array.isArray(vehicles)) {
          parts.push(<VehicleCompareInline key={`cmp-${match.index}`} vehicles={vehicles} />);
        }
      } catch {}
    } else if (match[1]) {
      try {
        const data = JSON.parse(match[1]);
        parts.push(<VehicleCardInline key={`vc-${match.index}`} vehicle={data} />);
      } catch { /* skip invalid JSON */ }
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push(<div key={`md-end`} className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2"><Markdown>{content.slice(lastIndex)}</Markdown></div>);
  }

  return parts;
}

export default function Chatbot() {
  const { t } = useTranslation();
  const { lang = 'de' } = useParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerInfo | null>(() => {
    try { return JSON.parse(localStorage.getItem(CUSTOMER_KEY) || 'null'); } catch { return null; }
  });
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Listen for open-chatbot event
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-chatbot', handler);
    return () => window.removeEventListener('open-chatbot', handler);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  // Load conversation on open
  useEffect(() => {
    if (!open || !customer) return;
    (async () => {
      try {
        const resp = await fetch(CHAT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
          body: JSON.stringify({ action: 'get_or_create_conversation', sessionId: getSessionId() }),
        });
        const data = await resp.json();
        if (data.conversationId) {
          setConversationId(data.conversationId);
          if (data.messages?.length > 0) {
            setMessages(data.messages.filter((m: any) => m.role !== 'system'));
          }
        }
      } catch (e) { console.error('Failed to load conversation:', e); }
    })();
  }, [open, customer]);

  const saveMessage = useCallback(async (convId: string, role: string, content: string) => {
    try {
      await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ action: 'save_message', actionData: { conversationId: convId, role, content } }),
      });
    } catch { /* silent */ }
  }, []);

  const handleWelcome = (info: CustomerInfo) => {
    setCustomer(info);
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(info));
  };

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    setInput('');

    const userMsg: Msg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    if (conversationId) saveMessage(conversationId, 'user', msg);

    let assistantSoFar = '';
    const allMsgs = [...messages, userMsg];

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: allMsgs, customer, sessionId: getSessionId() }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        let errMsg = t('chatbot.errorGeneric', { defaultValue: 'Ein Fehler ist aufgetreten.' });
        if (resp.status === 429) errMsg = t('chatbot.errorRateLimit', { defaultValue: 'Zu viele Anfragen. Bitte warten Sie einen Moment.' });
        if (resp.status === 402) errMsg = t('chatbot.errorCredits', { defaultValue: 'Service vorübergehend nicht verfügbar.' });
        setMessages(prev => [...prev, { role: 'assistant', content: errMsg }]);
        setIsLoading(false);
        return;
      }

      if (!resp.body) throw new Error('No body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant' && prev.length > allMsgs.length) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: 'assistant', content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
            }
          } catch { /* ignore */ }
        }
      }

      if (conversationId && assistantSoFar) {
        saveMessage(conversationId, 'assistant', assistantSoFar);
      }
    } catch (e) {
      console.error('Chat error:', e);
      setMessages(prev => [...prev, { role: 'assistant', content: t('chatbot.errorGeneric', { defaultValue: 'Ein Fehler ist aufgetreten.' }) }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = async () => {
    setMessages([]);
    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ action: 'new_conversation', sessionId: getSessionId() }),
      });
      const data = await resp.json();
      if (data.conversationId) setConversationId(data.conversationId);
    } catch { /* silent */ }
  };

  const suggestions = [
    t('chatbot.sugSuv', { defaultValue: 'SUV unter 20.000€' }),
    t('chatbot.sugBmw', { defaultValue: 'BMW oder Audi' }),
    t('chatbot.sugFinance', { defaultValue: 'Finanzierung' }),
    t('chatbot.sugTestDrive', { defaultValue: 'Probefahrt' }),
    t('chatbot.sugEstimate', { defaultValue: 'Fahrzeug schätzen' }),
  ];

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-2xl flex items-center justify-center transition-shadow"
            aria-label="Chat"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-4rem)] bg-card rounded-2xl shadow-2xl border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-primary text-primary-foreground rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span className="font-semibold text-sm">MCD AUTO</span>
                <span className="text-[10px] bg-primary-foreground/20 px-2 py-0.5 rounded-full">AI Agent</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={handleNewConversation} className="p-1.5 hover:bg-primary-foreground/10 rounded-lg transition-colors" title={t('chatbot.newConversation', { defaultValue: 'Neue Konversation' })}>
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-primary-foreground/10 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            {!customer ? (
              <WelcomeForm onSubmit={handleWelcome} />
            ) : (
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && !isLoading && (
                    <div className="space-y-3">
                      <div className="bg-muted rounded-xl rounded-tl-sm p-3 text-sm max-w-[85%]">
                        {t('chatbot.welcome', {
                          name: `${customer.title} ${customer.lastName}`,
                          defaultValue: `Willkommen, ${customer.title} ${customer.lastName}! Wie kann ich Ihnen helfen?`,
                        })}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.map((s, i) => (
                          <button key={i} onClick={() => sendMessage(s)} className="text-xs bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1.5 transition-colors">
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-xl p-3 text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted text-foreground rounded-bl-sm'
                      }`}>
                        {msg.role === 'assistant' ? parseInlineComponents(msg.content) : msg.content}
                      </div>
                    </div>
                  ))}

                  {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-xl rounded-bl-sm p-3">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="border-t p-3">
                  <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={t('chatbot.inputPlaceholder', { defaultValue: 'Ihre Nachricht...' })}
                      className="flex-1 text-sm"
                      disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
