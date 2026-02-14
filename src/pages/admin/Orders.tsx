import { useEffect, useState } from 'react';
import { Clock, Mail, Phone, Eye, CheckCircle, Trash2, ExternalLink, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  vehicle_details: any[];
  total_price: number;
  deposit_amount: number;
  receipt_url: string | null;
  status: string;
  admin_notes: string | null;
  delivery_address: string | null;
}

const statusColors: Record<string, string> = {
  pending: 'bg-accent text-accent-foreground',
  confirmed: 'bg-primary text-primary-foreground',
  completed: 'bg-success text-success-foreground',
  cancelled: 'bg-destructive text-destructive-foreground',
};

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  completed: 'Terminée',
  cancelled: 'Annulée',
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [sendingInvoice, setSendingInvoice] = useState(false);
  const { toast } = useToast();

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setOrders(data as Order[]);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    fetchOrders();
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
    toast({ title: `Commande ${statusLabels[status]?.toLowerCase()}` });

    // Auto-send invoice + completion notification when completing order
    if (status === 'completed') {
      const order = orders.find(o => o.id === id);
      if (order) {
        sendInvoiceEmail(id);
        // Send order completed notification to customer
        try {
          await supabase.functions.invoke('send-notification', {
            body: {
              type: 'order_completed',
              lang: (order as any).lang || 'de',
              to: order.customer_email,
              data: {
                name: order.customer_name,
                vehicles: (order.vehicle_details as any[]) || [],
                totalPrice: order.total_price,
                depositAmount: order.deposit_amount,
                siteUrl: 'https://mcdauto-carfinder.lovable.app',
              },
            },
          });
        } catch (err) {
          console.error('Completion notification error:', err);
        }
      }
    }
  };

  const sendInvoiceEmail = async (orderId: string) => {
    setSendingInvoice(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-invoice', {
        body: { orderId, action: 'send_email' },
      });
      if (error) throw error;
      toast({ title: 'Facture envoyée', description: 'Le client a reçu sa facture par email.' });
    } catch (err: any) {
      console.error('Invoice send error:', err);
      toast({ title: 'Erreur envoi facture', description: err.message, variant: 'destructive' });
    } finally {
      setSendingInvoice(false);
    }
  };

  const deleteOrder = async (id: string) => {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Commande supprimée' });
      if (selected?.id === id) setSelected(null);
      fetchOrders();
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl font-bold">Commandes</h2>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-4">
        {/* List */}
        <div className="space-y-2 max-h-[70vh] overflow-auto">
          {orders.map(o => (
            <Card
              key={o.id}
              className={`cursor-pointer transition-colors ${selected?.id === o.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelected(o)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{o.customer_name}</span>
                  <Badge className={statusColors[o.status] || statusColors.pending}>
                    {statusLabels[o.status] || o.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {(o.vehicle_details as any[])?.map((v: any) => `${v.brand} ${v.model}`).join(', ')}
                </p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {new Date(o.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="text-sm font-bold text-primary">{Number(o.deposit_amount).toLocaleString('de-DE')} €</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {orders.length === 0 && <p className="text-center text-muted-foreground py-8">Aucune commande.</p>}
        </div>

        {/* Detail */}
        {selected ? (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg">{selected.customer_name}</h3>
                <div className="flex gap-2">
                  {selected.status === 'pending' && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(selected.id, 'confirmed')}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Confirmer
                    </Button>
                  )}
                  {selected.status === 'confirmed' && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(selected.id, 'completed')}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Terminer
                    </Button>
                  )}
                  {selected.status === 'completed' && (
                    <Button size="sm" variant="outline" onClick={() => sendInvoiceEmail(selected.id)} disabled={sendingInvoice}>
                      {sendingInvoice ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <FileText className="w-4 h-4 mr-1" />}
                      Renvoyer facture
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette commande ?</AlertDialogTitle>
                        <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteOrder(selected.id)}>Supprimer</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="flex flex-col gap-1 text-sm">
                <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /> {selected.customer_email}</p>
                {selected.customer_phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> {selected.customer_phone}</p>}
                {selected.delivery_address && (
                  <div className="mt-2 bg-muted/50 rounded-md p-2 text-sm">
                    <span className="font-medium">Adresse de livraison :</span> {selected.delivery_address}
                  </div>
                )}
              </div>

              {/* Vehicles */}
              <div>
                <h4 className="font-medium text-sm mb-2">Véhicules commandés</h4>
                <div className="space-y-2">
                  {(selected.vehicle_details as any[])?.map((v: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-muted/50 rounded-md p-2 text-sm">
                      <span>{v.brand} {v.model} ({v.year})</span>
                      <span className="font-bold">{Number(v.price).toLocaleString('de-DE')} €</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amounts */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Total</span>
                  <span>{Number(selected.total_price).toLocaleString('de-DE')} €</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-primary">
                  <span>Acompte (20%)</span>
                  <span>{Number(selected.deposit_amount).toLocaleString('de-DE')} €</span>
                </div>
              </div>

              {/* Receipt */}
              {selected.receipt_url && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Reçu de paiement</h4>
                  {selected.receipt_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <a href={selected.receipt_url} target="_blank" rel="noopener noreferrer">
                      <img src={selected.receipt_url} alt="Reçu" className="max-h-48 rounded-md border cursor-pointer hover:opacity-80 transition-opacity" />
                    </a>
                  ) : (
                    <a href={selected.receipt_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
                      <ExternalLink className="w-4 h-4" /> Voir le reçu
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center justify-center text-muted-foreground py-20">
            Sélectionnez une commande pour la consulter
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
