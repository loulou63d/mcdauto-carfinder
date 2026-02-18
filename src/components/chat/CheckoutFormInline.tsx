import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, CheckCircle } from 'lucide-react';

const COUNTRIES = [
  { code: 'DE', label: 'Deutschland' },
  { code: 'FR', label: 'France' },
  { code: 'ES', label: 'España' },
  { code: 'PT', label: 'Portugal' },
  { code: 'IT', label: 'Italia' },
  { code: 'BE', label: 'Belgique' },
  { code: 'CH', label: 'Schweiz' },
  { code: 'AT', label: 'Österreich' },
  { code: 'NL', label: 'Nederland' },
  { code: 'LU', label: 'Luxembourg' },
];

export function CheckoutFormInline({ onSubmit }: { onSubmit?: (address: Record<string, string>) => void }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ street: '', city: '', postalCode: '', country: '' });
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = form.street.trim() && form.city.trim() && form.postalCode.trim() && form.country;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    onSubmit?.(form);
  };

  if (submitted) {
    return (
      <div className="my-2 p-4 rounded-xl border bg-primary/5 text-center">
        <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
        <p className="text-sm font-semibold text-primary">
          {t('chatbot.addressSaved', { defaultValue: 'Lieferadresse gespeichert!' })}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{form.street}, {form.postalCode} {form.city}</p>
      </div>
    );
  }

  return (
    <div className="my-2 p-3 rounded-xl border bg-card space-y-2.5">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary" />
        <p className="text-xs font-semibold">{t('chatbot.deliveryAddress', { defaultValue: 'Lieferadresse' })}</p>
      </div>
      <div className="space-y-2">
        <div>
          <Label className="text-[10px]">{t('chatbot.street', { defaultValue: 'Straße und Hausnummer' })}</Label>
          <Input className="h-8 text-xs" value={form.street} onChange={e => setForm(p => ({ ...p, street: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px]">{t('chatbot.postalCode', { defaultValue: 'PLZ' })}</Label>
            <Input className="h-8 text-xs" value={form.postalCode} onChange={e => setForm(p => ({ ...p, postalCode: e.target.value }))} />
          </div>
          <div>
            <Label className="text-[10px]">{t('chatbot.city', { defaultValue: 'Stadt' })}</Label>
            <Input className="h-8 text-xs" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
          </div>
        </div>
        <div>
          <Label className="text-[10px]">{t('chatbot.country', { defaultValue: 'Land' })}</Label>
          <Select value={form.country} onValueChange={v => setForm(p => ({ ...p, country: v }))}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {COUNTRIES.map(c => (
                <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button size="sm" className="w-full h-8 text-xs" onClick={handleSubmit} disabled={!canSubmit}>
        {t('chatbot.confirmAddress', { defaultValue: 'Adresse bestätigen' })}
      </Button>
    </div>
  );
}
