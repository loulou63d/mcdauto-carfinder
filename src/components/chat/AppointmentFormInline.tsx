import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CheckCircle } from 'lucide-react';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export function AppointmentFormInline() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', phone: '', date: '', time: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.date || !form.time) return;
    setLoading(true);
    try {
      await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          action: 'create_appointment',
          actionData: {
            customer_name: form.name,
            customer_email: form.email,
            customer_phone: form.phone || null,
            preferred_date: form.date,
            preferred_time: form.time,
            appointment_type: 'test_drive',
          },
        }),
      });
      setSubmitted(true);
    } catch { /* silent */ }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="my-2 p-4 rounded-xl border bg-primary/5 text-center">
        <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
        <p className="text-sm font-semibold text-primary">
          {t('chatbot.appointmentConfirmed', { defaultValue: 'Termin bestätigt!' })}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{form.date} - {form.time}</p>
      </div>
    );
  }

  return (
    <div className="my-2 p-3 rounded-xl border bg-card space-y-2.5">
      <p className="text-xs font-semibold">{t('chatbot.bookAppointment', { defaultValue: 'Termin vereinbaren' })}</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-[10px]">{t('contact.name', { defaultValue: 'Name' })}</Label>
          <Input className="h-8 text-xs" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div>
          <Label className="text-[10px]">{t('contact.email', { defaultValue: 'E-Mail' })}</Label>
          <Input className="h-8 text-xs" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
        </div>
        <div>
          <Label className="text-[10px]">{t('chatbot.date', { defaultValue: 'Datum' })}</Label>
          <Input className="h-8 text-xs" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
        </div>
        <div>
          <Label className="text-[10px]">{t('chatbot.time', { defaultValue: 'Uhrzeit' })}</Label>
          <Input className="h-8 text-xs" type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
        </div>
      </div>
      <Button size="sm" className="w-full h-8 text-xs" onClick={handleSubmit} disabled={loading || !form.name || !form.email || !form.date || !form.time}>
        {loading ? '...' : t('chatbot.confirm', { defaultValue: 'Bestätigen' })}
      </Button>
    </div>
  );
}
