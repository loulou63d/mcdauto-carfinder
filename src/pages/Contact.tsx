import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Contact = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t('contact.success'));
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div>
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-heading font-bold">
            {t('contact.title')}
          </motion.h1>
          <p className="mt-3 opacity-80">{t('contact.subtitle')}</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('contact.name')} *</label>
                  <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('contact.email')} *</label>
                  <Input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('contact.phone')}</label>
                  <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('contact.subject')} *</label>
                  <Input required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('contact.message')} *</label>
                <Textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
              </div>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8">
                {t('contact.send')}
              </Button>
            </form>

            <div className="space-y-6">
              <div className="p-6 bg-muted rounded-lg">
                <h3 className="font-heading font-bold mb-4">{t('contact.address')}</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3"><MapPin className="w-4 h-4 mt-0.5 shrink-0" /><span>123 Avenue de l'Automobile<br/>13300 Salon-de-Provence<br/>France</span></div>
                  <div className="flex items-center gap-3"><Phone className="w-4 h-4 shrink-0" /><span>+33 4 90 00 00 00</span></div>
                  <div className="flex items-center gap-3"><Mail className="w-4 h-4 shrink-0" /><span>contact@mcdauto.fr</span></div>
                </div>
              </div>
              <div className="p-6 bg-muted rounded-lg">
                <h3 className="font-heading font-bold mb-3 flex items-center gap-2"><Clock className="w-4 h-4" />{t('contact.hours')}</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{t('contact.hoursWeekday')}</p>
                  <p>{t('contact.hoursSaturday')}</p>
                  <p>{t('contact.hoursSunday')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
