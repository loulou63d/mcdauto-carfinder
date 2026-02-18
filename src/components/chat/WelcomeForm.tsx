import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot } from 'lucide-react';

export interface CustomerInfo {
  title: string;
  lastName: string;
  country: string;
}

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
  { code: 'OTHER', label: 'Autre / Other' },
];

export function WelcomeForm({ onSubmit }: { onSubmit: (info: CustomerInfo) => void }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState('');

  const canSubmit = title && lastName.trim() && country;

  return (
    <div className="flex-1 p-5 flex flex-col">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <Bot className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-semibold text-base">{t('chatbot.welcomeTitle', { defaultValue: 'Willkommen bei MCD AUTO' })}</h3>
        <p className="text-muted-foreground text-xs mt-1">{t('chatbot.welcomeSubtitle', { defaultValue: 'Bitte füllen Sie diese Informationen aus, um fortzufahren.' })}</p>
      </div>

      <div className="space-y-4 flex-1">
        <div>
          <Label className="text-xs mb-1.5 block">{t('chatbot.civility', { defaultValue: 'Anrede' })}</Label>
          <div className="flex gap-2">
            {[{ val: 'Herr', label: t('chatbot.mr', { defaultValue: 'Herr' }) }, { val: 'Frau', label: t('chatbot.mrs', { defaultValue: 'Frau' }) }].map(opt => (
              <button
                key={opt.val}
                onClick={() => setTitle(opt.val)}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  title === opt.val ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-muted border-border'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-xs mb-1.5 block">{t('chatbot.lastName', { defaultValue: 'Nachname' })}</Label>
          <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder={t('chatbot.lastNamePlaceholder', { defaultValue: 'Ihr Nachname' })} className="text-sm" />
        </div>

        <div>
          <Label className="text-xs mb-1.5 block">{t('chatbot.country', { defaultValue: 'Land' })}</Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder={t('chatbot.selectCountry', { defaultValue: 'Land auswählen' })} />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map(c => (
                <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={() => canSubmit && onSubmit({ title, lastName, country })} disabled={!canSubmit} className="w-full mt-4">
        {t('chatbot.startChat', { defaultValue: 'Chat starten' })}
      </Button>
    </div>
  );
}
