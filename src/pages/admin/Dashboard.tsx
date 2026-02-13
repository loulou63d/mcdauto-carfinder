import { useEffect, useState } from 'react';
import { Car, MessageSquare, Eye, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    featuredVehicles: 0,
    totalContacts: 0,
    newContacts: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [vehiclesRes, featuredRes, contactsRes, newContactsRes] = await Promise.all([
        supabase.from('vehicles').select('id', { count: 'exact', head: true }),
        supabase.from('vehicles').select('id', { count: 'exact', head: true }).eq('is_featured', true),
        supabase.from('contact_requests').select('id', { count: 'exact', head: true }),
        supabase.from('contact_requests').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      ]);

      setStats({
        totalVehicles: vehiclesRes.count ?? 0,
        featuredVehicles: featuredRes.count ?? 0,
        totalContacts: contactsRes.count ?? 0,
        newContacts: newContactsRes.count ?? 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { title: 'Véhicules', value: stats.totalVehicles, icon: Car, description: `${stats.featuredVehicles} en vedette` },
    { title: 'Contacts', value: stats.totalContacts, icon: MessageSquare, description: `${stats.newContacts} nouveaux` },
    { title: 'Vues estimées', value: '—', icon: Eye, description: 'Bientôt disponible' },
    { title: 'Tendance', value: '—', icon: TrendingUp, description: 'Bientôt disponible' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold">Tableau de bord</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
