import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, Upload, CreditCard, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';

const Checkout = () => {
  const { t } = useTranslation();
  const { lang = 'de' } = useParams();
  const { items } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bankDetails, setBankDetails] = useState({ iban: '', bic: '', name: '', motif: '' });

  // Check auth - redirect if not logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate(`/${lang}/login?redirect=/${lang}/checkout`);
      } else {
        setUser(session.user);
        setName(session.user.user_metadata?.full_name || '');
        setEmail(session.user.email || '');
        setPhone(session.user.user_metadata?.phone || '');
      }
      setAuthLoading(false);
    });

    // Fetch bank details
    supabase.from('site_settings').select('key, value').in('key', ['bank_iban', 'bank_bic', 'bank_name', 'bank_motif']).then(({ data }) => {
      if (data) {
        const details = { iban: '', bic: '', name: '', motif: '' };
        data.forEach(s => {
          if (s.key === 'bank_iban') details.iban = s.value;
          if (s.key === 'bank_bic') details.bic = s.value;
          if (s.key === 'bank_name') details.name = s.value;
          if (s.key === 'bank_motif') details.motif = s.value;
        });
        setBankDetails(details);
      }
    });
  }, [lang, navigate]);

  const total = items.reduce((sum, i) => sum + Number(i.vehicle.price), 0);
  const deposit = Math.ceil(total * 0.2);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile) {
      toast({ title: t('checkout.receiptRequired'), variant: 'destructive' });
      return;
    }
    if (!name.trim() || !email.trim() || !address.trim() || !city.trim() || !postalCode.trim() || !country.trim()) {
      toast({ title: t('checkout.fillRequired'), variant: 'destructive' });
      return;
    }

    const fullAddress = `${address.trim()}, ${postalCode.trim()} ${city.trim()}, ${country.trim()}`;

    setSubmitting(true);
    try {
      // Upload receipt
      const ext = receiptFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('order-receipts')
        .upload(fileName, receiptFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('order-receipts')
        .getPublicUrl(fileName);

      // Create order
      const vehicleDetails = items.map(i => ({
        id: i.vehicle.id,
        brand: i.vehicle.brand,
        model: i.vehicle.model,
        price: i.vehicle.price,
        year: i.vehicle.year,
      }));

      const { error: orderError } = await supabase.from('orders').insert({
        user_id: user!.id,
        customer_name: name.trim(),
        customer_email: email.trim(),
        customer_phone: phone.trim() || null,
        vehicle_ids: items.map(i => i.vehicle.id),
        vehicle_details: vehicleDetails,
        total_price: total,
        deposit_amount: deposit,
        receipt_url: urlData.publicUrl,
        delivery_address: fullAddress,
        lang,
      });

      if (orderError) throw orderError;

      // Send order confirmation email in client's language
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            type: 'order_confirmation',
            lang,
            to: email.trim(),
            data: {
              vehicles: vehicleDetails,
              totalPrice: total,
              depositAmount: deposit,
              siteUrl: window.location.origin,
            },
          },
        });
      } catch (err) {
        console.error('Order notification error:', err);
      }

      setSuccess(true);
      // Don't clear cart - it stays until admin confirms the order
    } catch (err: any) {
      toast({ title: t('common.error'), description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (items.length === 0 && !success) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20 text-center">
          <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground mb-6">{t('cart.empty')}</p>
          <Link to={`/${lang}/search`}>
            <Button>{t('cart.browseCta')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20 text-center max-w-lg">
          <div className="bg-card rounded-xl border p-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">{t('checkout.successTitle')}</h2>
            <p className="text-muted-foreground mb-6">{t('checkout.successMessage')}</p>
            <Link to={`/${lang}/account`}>
              <Button>{t('account.viewOrders', { defaultValue: 'Voir mes commandes' })}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to={`/${lang}/cart`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> {t('common.back')}
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <CreditCard className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-heading font-bold text-foreground">{t('checkout.title')}</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer info */}
            <div className="bg-card rounded-lg border p-5 space-y-4">
              <h3 className="font-heading font-bold text-foreground">{t('checkout.customerInfo')}</h3>
              <div>
                <Label htmlFor="name">{t('contact.name')} *</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required maxLength={100} />
              </div>
              <div>
              <Label htmlFor="email">{t('contact.email')} *</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required maxLength={255} />
              </div>
              <div>
                <Label htmlFor="phone">{t('contact.phone')}</Label>
                <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} maxLength={20} />
              </div>
            </div>

            {/* Delivery address */}
            <div className="bg-card rounded-lg border p-5 space-y-4">
              <h3 className="font-heading font-bold text-foreground">{t('checkout.deliveryAddress')}</h3>
              <div>
                <Label htmlFor="address">{t('checkout.address')} *</Label>
                <Input id="address" value={address} onChange={e => setAddress(e.target.value)} required maxLength={200} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postalCode">{t('checkout.postalCode')} *</Label>
                  <Input id="postalCode" value={postalCode} onChange={e => setPostalCode(e.target.value)} required maxLength={10} />
                </div>
                <div>
                  <Label htmlFor="city">{t('checkout.city')} *</Label>
                  <Input id="city" value={city} onChange={e => setCity(e.target.value)} required maxLength={100} />
                </div>
              </div>
              <div>
                <Label htmlFor="country">{t('checkout.country')} *</Label>
                <Input id="country" value={country} onChange={e => setCountry(e.target.value)} required maxLength={60} />
              </div>
            </div>

            {/* Deposit info */}
            <div className="bg-card rounded-lg border p-5 space-y-4">
              <h3 className="font-heading font-bold text-foreground">{t('checkout.depositTitle')}</h3>
              <div className="bg-primary/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">{t('checkout.depositInfo')}</span>
                </div>
                <p className="text-sm text-muted-foreground">{t('checkout.depositInstruction')}</p>
              </div>
              <div className="flex justify-between items-center text-lg font-heading font-bold">
                <span>{t('checkout.depositAmount')}</span>
                <span className="text-primary">{deposit.toLocaleString('de-DE')} €</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>IBAN:</strong> {bankDetails.iban}</p>
                <p><strong>BIC:</strong> {bankDetails.bic}</p>
                <p><strong>{t('checkout.beneficiary', { defaultValue: 'Bénéficiaire' })}:</strong> {bankDetails.name}</p>
                {bankDetails.motif && <p><strong>{t('checkout.motif')}:</strong> {bankDetails.motif}</p>}
              </div>
            </div>

            {/* Receipt upload */}
            <div className="bg-card rounded-lg border p-5 space-y-4">
              <h3 className="font-heading font-bold text-foreground">{t('checkout.receiptTitle')}</h3>
              <p className="text-sm text-muted-foreground">{t('checkout.receiptDesc')}</p>
              
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  required
                />
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${receiptFile ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'}`}>
                  {previewUrl && receiptFile?.type.startsWith('image/') ? (
                    <img src={previewUrl} alt="Receipt" className="max-h-40 mx-auto rounded-md mb-2" />
                  ) : (
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  )}
                  <p className="text-sm font-medium text-foreground">
                    {receiptFile ? receiptFile.name : t('checkout.uploadCta')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{t('checkout.uploadHint')}</p>
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? t('common.loading') : t('checkout.submitOrder')}
            </Button>
          </form>

          {/* Order summary */}
          <div className="space-y-4">
            <div className="bg-card rounded-lg border p-5">
              <h3 className="font-heading font-bold text-foreground mb-4">{t('cart.summary')}</h3>
              <div className="space-y-3">
                {items.map(item => {
                  const v = item.vehicle;
                  const img = v.images?.[0];
                  return (
                    <div key={v.id} className="flex gap-3">
                      {img ? (
                        <img src={img} alt={`${v.brand} ${v.model}`} className="w-20 h-14 object-cover rounded-md shrink-0" />
                      ) : (
                        <div className="w-20 h-14 bg-muted rounded-md shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{v.brand} {v.model}</p>
                        <p className="text-xs text-muted-foreground">{v.year} • {v.mileage.toLocaleString('de-DE')} km</p>
                      </div>
                      <span className="font-bold text-sm shrink-0">{Number(v.price).toLocaleString('de-DE')} €</span>
                    </div>
                  );
                })}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>{t('cart.total')}</span>
                <span>{total.toLocaleString('de-DE')} €</span>
              </div>
              <div className="flex justify-between font-heading font-bold text-lg text-primary">
                <span>{t('checkout.depositAmount')}</span>
                <span>{deposit.toLocaleString('de-DE')} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
