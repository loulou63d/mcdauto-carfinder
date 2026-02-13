import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/contexts/CartContext';
import { Trash2, ShoppingCart, CreditCard, Shield, FileText, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const Cart = () => {
  const { t } = useTranslation();
  const { lang = 'de' } = useParams();
  const { items, removeFromCart, clearCart } = useCart();

  const total = items.reduce((sum, i) => sum + Number(i.vehicle.price), 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-heading font-bold text-foreground">{t('cart.title')}</h1>
          <span className="text-sm text-muted-foreground">({items.length} {t('cart.items')})</span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground mb-6">{t('cart.empty')}</p>
            <Link to={`/${lang}/search`}>
              <Button>{t('cart.browseCta')}</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const v = item.vehicle;
                const img = v.images?.[0];
                return (
                  <div key={v.id} className="bg-card rounded-lg border p-4 flex gap-4">
                    <Link to={`/${lang}/vehicle/${v.id}`} className="shrink-0">
                      {img ? (
                        <img src={img} alt={`${v.brand} ${v.model}`} className="w-28 h-20 object-cover rounded-md" />
                      ) : (
                        <div className="w-28 h-20 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">{v.brand}</div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/${lang}/vehicle/${v.id}`} className="font-heading font-bold text-foreground hover:text-primary transition-colors">
                        {v.brand} {v.model}
                      </Link>
                      <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground mt-1">
                        <span>{v.year}</span>
                        <span>{v.mileage.toLocaleString('de-DE')} km</span>
                        <span>{t(`energyValues.${v.energy}`, { defaultValue: v.energy })}</span>
                      </div>
                      <div className="mt-2 flex items-end justify-between">
                        <div>
                          {v.monthly_price && (
                            <span className="text-sm text-primary font-bold">{v.monthly_price} €{t('featured.perMonth')}</span>
                          )}
                        </div>
                        <span className="text-lg font-heading font-bold">{Number(v.price).toLocaleString('de-DE')} €</span>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(v.id)} className="self-start p-2 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}

              {items.length > 1 && (
                <div className="text-right">
                  <Button variant="ghost" size="sm" onClick={clearCart} className="text-muted-foreground">
                    <Trash2 className="w-4 h-4 mr-1" /> {t('cart.clearAll')}
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar summary */}
            <div className="space-y-6">
              {/* Total */}
              <div className="bg-card rounded-lg border p-5">
                <h3 className="font-heading font-bold text-foreground mb-3">{t('cart.summary')}</h3>
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>{t('cart.subtotal')}</span>
                  <span>{total.toLocaleString('de-DE')} €</span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between font-heading font-bold text-lg">
                  <span>{t('cart.total')}</span>
                  <span>{total.toLocaleString('de-DE')} €</span>
                </div>
                <Link to={`/${lang}/contact`}>
                  <Button className="w-full mt-4" size="lg">
                    <CreditCard className="w-4 h-4 mr-2" /> {t('cart.checkout')}
                  </Button>
                </Link>
              </div>

              {/* Conditions sections */}
              {/* Payment options */}
              <div className="bg-card rounded-lg border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <h3 className="font-heading font-bold text-foreground">{t('cart.paymentTitle')}</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{t('cart.paymentCash')}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{t('cart.paymentInstallments')}</span>
                  </div>
                </div>
              </div>

              {/* Import & Warranty */}
              <div className="bg-card rounded-lg border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="font-heading font-bold text-foreground">{t('cart.importTitle')}</h3>
                </div>
                <ul className="space-y-2">
                  {['importOrigin', 'importWarranty', 'importDelivery', 'importManufacturer', 'importRetraction'].map((k) => (
                    <li key={k} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{t(`cart.${k}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Admin services */}
              <div className="bg-card rounded-lg border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="font-heading font-bold text-foreground">{t('cart.adminTitle')}</h3>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                  {['adminRegistration', 'adminCOC', 'adminNonPledge', 'adminInspection', 'adminServiceBook', 'adminInvoices'].map((k) => (
                    <li key={k} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{t(`cart.${k}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
