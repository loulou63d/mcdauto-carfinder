import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Package, Clock, CheckCircle, LogOut, User, ChevronRight, ExternalLink, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { User as SupaUser } from '@supabase/supabase-js';

interface Order {
  id: string;
  created_at: string;
  vehicle_details: any[];
  total_price: number;
  deposit_amount: number;
  receipt_url: string | null;
  status: string;
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  pending: { label: 'En attente de validation', icon: Clock, className: 'bg-accent text-accent-foreground' },
  confirmed: { label: 'Confirmée', icon: CheckCircle, className: 'bg-primary text-primary-foreground' },
  completed: { label: 'Terminée', icon: CheckCircle, className: 'bg-primary/80 text-primary-foreground' },
  cancelled: { label: 'Annulée', icon: Clock, className: 'bg-destructive text-destructive-foreground' },
};

const Account = () => {
  const { t } = useTranslation();
  const { lang = 'de' } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SupaUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);

  const downloadInvoice = async (orderId: string) => {
    setDownloadingInvoice(orderId);
    try {
      const { data, error } = await supabase.functions.invoke('send-invoice', {
        body: { orderId, action: 'get_html' },
      });
      if (error) throw error;
      
      const blob = new Blob([data.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-MCD-${orderId.substring(0, 8).toUpperCase()}.html`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Facture téléchargée' });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setDownloadingInvoice(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate(`/${lang}/login?redirect=/${lang}/account`);
        return;
      }

      setUser(session.user);

      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (data) setOrders(data as Order[]);
      setLoading(false);
    };
    init();
  }, [lang, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate(`/${lang}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground">
                {user?.user_metadata?.full_name || user?.email}
              </h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> {t('auth.logout')}
          </Button>
        </div>

        <Separator className="mb-8" />

        {/* Orders */}
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-bold text-lg text-foreground">
            {t('account.myOrders', { defaultValue: 'Mes commandes' })}
          </h2>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">{t('account.noOrders', { defaultValue: 'Aucune commande pour le moment' })}</p>
              <Link to={`/${lang}/search`}>
                <Button>{t('cart.browseCta')}</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const config = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              return (
                <Card key={order.id}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <StatusIcon className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      <Badge className={config.className}>{config.label}</Badge>
                    </div>

                    {/* Vehicles */}
                    <div className="space-y-2 mb-3">
                      {(order.vehicle_details as any[])?.map((v: any, i: number) => (
                        <div key={i} className="flex justify-between items-center bg-muted/50 rounded-md p-2 text-sm">
                          <span className="font-medium">{v.brand} {v.model} ({v.year})</span>
                          <span className="font-bold">{Number(v.price).toLocaleString('de-DE')} €</span>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-3" />

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('cart.total')}</span>
                      <span>{Number(order.total_price).toLocaleString('de-DE')} €</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-primary">
                      <span>{t('checkout.depositAmount')}</span>
                      <span>{Number(order.deposit_amount).toLocaleString('de-DE')} €</span>
                    </div>

                    {order.receipt_url && (
                      <div className="mt-3">
                        <a href={order.receipt_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                          <ExternalLink className="w-3 h-3" /> {t('account.viewReceipt', { defaultValue: 'Voir le reçu' })}
                        </a>
                      </div>
                    )}

                    {order.status === 'completed' && (
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadInvoice(order.id)}
                          disabled={downloadingInvoice === order.id}
                        >
                          {downloadingInvoice === order.id ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <FileText className="w-3 h-3 mr-1" />
                          )}
                          {t('account.downloadInvoice', { defaultValue: 'Télécharger la facture' })}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
