import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Bot, MessageCircle, Zap, Brain, Car, Globe, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const typingTexts = [
  'SUV unter 20.000€?',
  'BMW ou Audi ?',
  'Finanzierung möglich?',
  '¿Comparar vehículos?',
];

const TypingEffect = () => {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = typingTexts[textIndex];
    const timeout = deleting ? 30 : 60;

    const timer = setTimeout(() => {
      if (!deleting && charIndex < current.length) {
        setCharIndex(c => c + 1);
      } else if (!deleting && charIndex === current.length) {
        setTimeout(() => setDeleting(true), 1500);
      } else if (deleting && charIndex > 0) {
        setCharIndex(c => c - 1);
      } else {
        setDeleting(false);
        setTextIndex(i => (i + 1) % typingTexts.length);
      }
    }, timeout);

    return () => clearTimeout(timer);
  }, [charIndex, deleting, textIndex]);

  return (
    <span className="text-primary-foreground/90">
      {typingTexts[textIndex].slice(0, charIndex)}
      <span className="animate-pulse text-accent">|</span>
    </span>
  );
};

const FloatingOrb = ({ delay, size, x, y }: { delay: number; size: number; x: string; y: string }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ width: size, height: size, left: x, top: y }}
    animate={{
      y: [0, -20, 0, 15, 0],
      opacity: [0.15, 0.35, 0.15],
      scale: [1, 1.1, 1],
    }}
    transition={{ duration: 6, delay, repeat: Infinity, ease: 'easeInOut' }}
  >
    <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-accent/20 blur-xl" />
  </motion.div>
);

const features = [
  { icon: Brain, labelKey: 'aiAgent.feat1' },
  { icon: Car, labelKey: 'aiAgent.feat2' },
  { icon: Globe, labelKey: 'aiAgent.feat3' },
  { icon: Zap, labelKey: 'aiAgent.feat4' },
];

export default function AIAgentSection() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative overflow-hidden py-20 md:py-28">
      {/* Deep dark background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(216,73%,6%)] via-[hsl(228,67%,12%)] to-[hsl(216,73%,6%)]" />

      {/* Animated grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(hsl(228 67% 55% / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(228 67% 55% / 0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating orbs */}
      <FloatingOrb delay={0} size={200} x="10%" y="20%" />
      <FloatingOrb delay={2} size={140} x="75%" y="10%" />
      <FloatingOrb delay={4} size={100} x="60%" y="70%" />
      <FloatingOrb delay={1} size={160} x="85%" y="55%" />

      {/* Glowing line accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/15 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary/80">
                {t('aiAgent.badge', { defaultValue: 'AI-Powered' })}
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-white leading-tight">
              {t('aiAgent.title', { defaultValue: 'Ihr persönlicher' })}{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[hsl(228,67%,65%)] via-[hsl(280,60%,65%)] to-[hsl(356,78%,60%)] bg-clip-text text-transparent">
                  {t('aiAgent.titleHighlight', { defaultValue: 'KI-Berater' })}
                </span>
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-[hsl(280,60%,55%)] to-accent rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
              </span>
            </h2>

            <p className="mt-5 text-base md:text-lg text-white/60 max-w-lg leading-relaxed">
              {t('aiAgent.description', {
                defaultValue: 'Unser KI-Agent hilft Ihnen rund um die Uhr bei der Fahrzeugsuche, Finanzierung und Terminvereinbarung – in 5 Sprachen.',
              })}
            </p>

            {/* Feature pills */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              {features.map((feat, i) => (
                <motion.div
                  key={feat.labelKey}
                  initial={{ opacity: 0, y: 12 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 hover:bg-white/10 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <feat.icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white/80">
                    {t(feat.labelKey, {
                      defaultValue: i === 0 ? 'Intelligente Suche' : i === 1 ? 'Fahrzeugvergleich' : i === 2 ? '5 Sprachen' : 'Sofortige Antworten',
                    })}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="mt-8"
            >
              <Button
                onClick={() => window.dispatchEvent(new CustomEvent('open-chatbot'))}
                className="bg-gradient-to-r from-primary to-[hsl(280,60%,50%)] hover:from-primary/90 hover:to-[hsl(280,60%,45%)] text-white font-bold px-8 py-6 text-base rounded-full shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 group"
              >
                <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                {t('aiAgent.cta', { defaultValue: 'Jetzt mit dem KI-Berater chatten' })}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Right: Interactive mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            {/* Glow behind the mockup */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/15 blur-3xl rounded-3xl scale-110" />

            {/* Chat window mockup */}
            <div className="relative bg-[hsl(216,60%,8%)] border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-primary/10">
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-gradient-to-r from-primary/20 to-transparent">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[hsl(280,60%,50%)] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[hsl(142,71%,45%)] border-2 border-[hsl(216,60%,8%)]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">MCD AUTO AI</div>
                  <div className="text-[11px] text-white/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[hsl(142,71%,45%)] inline-block" />
                    {t('aiAgent.online', { defaultValue: 'Online – Antwortet sofort' })}
                  </div>
                </div>
                <div className="ml-auto flex gap-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="p-5 space-y-4 min-h-[320px]">
                {/* Assistant message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.6 }}
                  className="flex gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%]">
                    <p className="text-sm text-white/80 leading-relaxed">
                      {t('aiAgent.mockMsg1', {
                        defaultValue: 'Willkommen! 👋 Ich bin Ihr KI-Berater. Wie kann ich Ihnen helfen?',
                      })}
                    </p>
                  </div>
                </motion.div>

                {/* User message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 1 }}
                  className="flex justify-end"
                >
                  <div className="bg-gradient-to-r from-primary to-[hsl(228,67%,55%)] rounded-2xl rounded-br-md px-4 py-3 max-w-[75%]">
                    <p className="text-sm text-white">
                      {t('aiAgent.mockMsg2', { defaultValue: 'Ich suche ein SUV unter 20.000€' })}
                    </p>
                  </div>
                </motion.div>

                {/* AI response with card preview */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 1.4 }}
                  className="flex gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="space-y-2 max-w-[85%]">
                    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-md px-4 py-3">
                      <p className="text-sm text-white/80 leading-relaxed">
                        {t('aiAgent.mockMsg3', {
                          defaultValue: 'Ich habe 3 SUVs gefunden, die zu Ihnen passen könnten:',
                        })}
                      </p>
                    </div>
                    {/* Mini vehicle cards */}
                    <div className="flex gap-2">
                      {['Peugeot 3008', 'Renault Kadjar', 'Hyundai Tucson'].map((name, i) => (
                        <motion.div
                          key={name}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={isInView ? { opacity: 1, scale: 1 } : {}}
                          transition={{ delay: 1.7 + i * 0.15 }}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl p-2.5 hover:bg-white/10 transition-colors cursor-default"
                        >
                          <div className="w-full h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-1.5">
                            <Car className="w-4 h-4 text-white/30" />
                          </div>
                          <div className="text-[10px] font-bold text-white/70 truncate">{name}</div>
                          <div className="text-[10px] text-accent font-bold">
                            {(15990 + i * 2000).toLocaleString('de-DE')} €
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Input bar */}
              <div className="px-5 pb-5">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <MessageCircle className="w-4 h-4 text-white/30 shrink-0" />
                  <div className="flex-1 text-sm">
                    <TypingEffect />
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-[hsl(280,60%,50%)] flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
