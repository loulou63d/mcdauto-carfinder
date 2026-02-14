import { useEffect, useState } from 'react';
import { Car, MessageSquare, Eye, TrendingUp, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';
import { toast } from 'sonner';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    featuredVehicles: 0,
    totalContacts: 0,
    newContacts: 0,
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<{ success: number; failures: number; errors?: string[] } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const [vehiclesRes, featuredRes, contactsRes, newContactsRes] = await Promise.all([
        supabaseAdmin.from('vehicles').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('vehicles').select('id', { count: 'exact', head: true }).eq('is_featured', true),
        supabaseAdmin.from('contact_requests').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('contact_requests').select('id', { count: 'exact', head: true }).eq('status', 'new'),
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

  const handleDownloadImages = async () => {
    setIsDownloading(true);
    setDownloadStatus(null);
    
    try {
      const response = await fetch('/functions/v1/download-vehicle-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setDownloadStatus({
        success: result.success,
        failures: result.failures,
        errors: result.errors,
      });

      if (result.success > 0) {
        toast.success(`${result.success} images téléchargées avec succès`);
      }
      if (result.failures > 0) {
        toast.error(`${result.failures} images ont échoué`);
      }
    } catch (error) {
      toast.error('Erreur lors du téléchargement des images');
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

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

      {/* Image Download Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Télécharger les images des véhicules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Télécharger les images Autosphere dans notre propre stockage pour une meilleure performance et fiabilité.
          </p>
          
          <Button 
            onClick={handleDownloadImages}
            disabled={isDownloading}
            className="mb-4"
          >
            {isDownloading ? 'Téléchargement en cours...' : 'Démarrer le téléchargement'}
          </Button>

          {downloadStatus && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">
                ✓ Réussi: {downloadStatus.success} | ✗ Échoué: {downloadStatus.failures}
              </p>
              {downloadStatus.errors && downloadStatus.errors.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground space-y-1 max-h-40 overflow-y-auto">
                  {downloadStatus.errors.map((error, i) => (
                    <p key={i}>{error}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
