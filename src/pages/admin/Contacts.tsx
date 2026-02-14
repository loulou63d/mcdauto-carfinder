import { useEffect, useState } from 'react';
import { Mail, Phone, Clock, CheckCircle, Trash2 } from 'lucide-react';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Tables } from '@/integrations/supabase/types';

type Contact = Tables<'contact_requests'>;

const statusColors: Record<string, string> = {
  new: 'bg-accent text-accent-foreground',
  read: 'bg-primary text-primary-foreground',
  replied: 'bg-success text-success-foreground',
};

const statusLabels: Record<string, string> = {
  new: 'Nouveau',
  read: 'Lu',
  replied: 'Répondu',
};

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<Contact | null>(null);
  const { toast } = useToast();

  const fetchContacts = async () => {
    const { data } = await supabaseAdmin
      .from('contact_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setContacts(data);
  };

  useEffect(() => { fetchContacts(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabaseAdmin.from('contact_requests').update({ status }).eq('id', id);
    fetchContacts();
  };

  const deleteContact = async (id: string) => {
    const { error } = await supabaseAdmin.from('contact_requests').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Message supprimé' });
      if (selected?.id === id) setSelected(null);
      fetchContacts();
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl font-bold">Demandes de contact</h2>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-4">
        {/* List */}
        <div className="space-y-2 max-h-[70vh] overflow-auto">
          {contacts.map(c => (
            <Card
              key={c.id}
              className={`cursor-pointer transition-colors ${selected?.id === c.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => { setSelected(c); if (c.status === 'new') updateStatus(c.id, 'read'); }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{c.name}</span>
                  <Badge className={statusColors[c.status ?? 'new']}>{statusLabels[c.status ?? 'new']}</Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{c.subject || c.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </CardContent>
            </Card>
          ))}
          {contacts.length === 0 && <p className="text-center text-muted-foreground py-8">Aucune demande.</p>}
        </div>

        {/* Detail */}
        {selected ? (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg">{selected.name}</h3>
                <div className="flex gap-2">
                  {selected.status !== 'replied' && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(selected.id, 'replied')}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Marquer répondu
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer ce message ?</AlertDialogTitle>
                        <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteContact(selected.id)}>Supprimer</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="flex flex-col gap-1 text-sm">
                <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /> {selected.email}</p>
                {selected.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> {selected.phone}</p>}
              </div>

              {selected.subject && <p className="font-medium">{selected.subject}</p>}
              <p className="text-sm text-foreground whitespace-pre-wrap">{selected.message}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center justify-center text-muted-foreground py-20">
            Sélectionnez un message pour le consulter
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;
