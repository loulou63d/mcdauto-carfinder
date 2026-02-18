import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function UploadReceiptInline({ orderId }: { orderId?: string }) {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      setError(t('chatbot.fileTooLarge', { defaultValue: 'Datei zu groß (max. 10 MB)' }));
      return;
    }
    setError('');
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const ext = file.name.split('.').pop();
      const path = `receipts/${orderId || crypto.randomUUID()}_${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('order-receipts').upload(path, file);
      if (uploadErr) throw uploadErr;
      setUploaded(true);
    } catch (e: any) {
      setError(e.message || t('chatbot.uploadError', { defaultValue: 'Upload fehlgeschlagen' }));
    } finally {
      setUploading(false);
    }
  };

  if (uploaded) {
    return (
      <div className="my-2 p-4 rounded-xl border bg-primary/5 text-center">
        <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
        <p className="text-sm font-semibold text-primary">
          {t('chatbot.receiptUploaded', { defaultValue: 'Beleg erfolgreich hochgeladen!' })}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {t('chatbot.receiptReview', { defaultValue: 'Unser Team wird ihn innerhalb von 24h prüfen.' })}
        </p>
      </div>
    );
  }

  return (
    <div className="my-2 p-3 rounded-xl border bg-card space-y-2.5">
      <div className="flex items-center gap-2">
        <Upload className="w-4 h-4 text-primary" />
        <p className="text-xs font-semibold">{t('chatbot.uploadReceipt', { defaultValue: 'Überweisungsbeleg hochladen' })}</p>
      </div>
      <p className="text-[10px] text-muted-foreground">
        {t('chatbot.uploadHint', { defaultValue: 'Bild oder PDF Ihres Überweisungsbelegs (max. 10 MB)' })}
      </p>

      <input ref={inputRef} type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />

      {file ? (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs flex-1 truncate">{file.name}</span>
          <button onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ''; }} className="text-xs text-destructive hover:underline">✕</button>
        </div>
      ) : (
        <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={() => inputRef.current?.click()}>
          {t('chatbot.selectFile', { defaultValue: 'Datei auswählen' })}
        </Button>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {file && (
        <Button size="sm" className="w-full h-8 text-xs" onClick={handleUpload} disabled={uploading}>
          {uploading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
          {uploading ? t('chatbot.uploading', { defaultValue: 'Wird hochgeladen...' }) : t('chatbot.sendReceipt', { defaultValue: 'Beleg senden' })}
        </Button>
      )}
    </div>
  );
}
