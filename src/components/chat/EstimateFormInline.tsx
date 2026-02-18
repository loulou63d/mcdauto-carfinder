import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Loader2 } from 'lucide-react';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export function EstimateFormInline() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ brand: '', model: '', year: '', mileage: '', energy: '', condition: '', email: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.brand || !form.model) return;
    setLoading(true);
    try {
      await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          action: 'create_estimate',
          actionData: form,
          customer: JSON.parse(localStorage.getItem('mcd-chat-customer') || '{}'),
        }),
      });
      setSubmitted(true);
    } catch { /* silent */ }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="my-2 p-4 rounded-xl border bg-primary/5 text-center">
        <Calculator className="w-8 h-8 text-primary mx-auto mb-2" />
        <p className="text-sm font-semibold">{t('chatbot.estimateSubmitted', { defaultValue: 'Ihre Anfrage wurde gesendet!' })}</p>
        <p className="text-xs text-muted-foreground mt-1">{t('chatbot.estimateResponse', { defaultValue: 'Wir melden uns innerhalb von 24h.' })}</p>
      </div>
    );
  }

  return (
    <div className="my-2 p-3 rounded-xl border bg-card space-y-2.5">
      <p className="text-xs font-semibold">{t('chatbot.estimateTitle', { defaultValue: 'Fahrzeug schätzen lassen' })}</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-[10px]">{t('search.brand', { defaultValue: 'Marke' })}</Label>
          <Input className="h-8 text-xs" value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} placeholder="z.B. BMW" />
        </div>
        <div>
          <Label className="text-[10px]">{t('search.model', { defaultValue: 'Modell' })}</Label>
          <Input className="h-8 text-xs" value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} placeholder="z.B. Serie 3" />
        </div>
        <div>
          <Label className="text-[10px]">{t('vehicle.year', { defaultValue: 'Baujahr' })}</Label>
          <Input className="h-8 text-xs" type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} placeholder="2020" />
        </div>
        <div>
          <Label className="text-[10px]">{t('vehicle.mileage', { defaultValue: 'km' })}</Label>
          <Input className="h-8 text-xs" type="number" value={form.mileage} onChange={e => setForm(p => ({ ...p, mileage: e.target.value }))} placeholder="50000" />
        </div>
        <div>
          <Label className="text-[10px]">{t('vehicle.energy', { defaultValue: 'Kraftstoff' })}</Label>
          <Select value={form.energy} onValueChange={v => setForm(p => ({ ...p, energy: v }))}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Diesel">Diesel</SelectItem>
              <SelectItem value="Essence">Benzin</SelectItem>
              <SelectItem value="Hybride">Hybrid</SelectItem>
              <SelectItem value="Électrique">Elektro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[10px]">{t('chatbot.condition', { defaultValue: 'Zustand' })}</Label>
          <Select value={form.condition} onValueChange={v => setForm(p => ({ ...p, condition: v }))}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">{t('chatbot.condExcellent', { defaultValue: 'Ausgezeichnet' })}</SelectItem>
              <SelectItem value="good">{t('chatbot.condGood', { defaultValue: 'Gut' })}</SelectItem>
              <SelectItem value="fair">{t('chatbot.condFair', { defaultValue: 'Befriedigend' })}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2">
          <Label className="text-[10px]">{t('contact.email', { defaultValue: 'E-Mail' })}</Label>
          <Input className="h-8 text-xs" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" />
        </div>
      </div>
      <Button size="sm" className="w-full h-8 text-xs" onClick={handleSubmit} disabled={loading || !form.brand || !form.model}>
        {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
        {loading ? '...' : t('chatbot.submitEstimate', { defaultValue: 'Schätzung anfordern' })}
      </Button>
    </div>
  );
}
