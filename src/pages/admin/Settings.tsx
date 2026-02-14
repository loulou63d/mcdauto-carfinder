import { useState, useEffect } from 'react';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Landmark, Lock, Save } from 'lucide-react';

const Settings = () => {
const [iban, setIban] = useState('');
  const [bic, setBic] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankMotif, setBankMotif] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabaseAdmin
        .from('site_settings')
        .select('key, value')
        .in('key', ['bank_iban', 'bank_bic', 'bank_name', 'bank_motif']);

      if (!error && data) {
        data.forEach((s) => {
          if (s.key === 'bank_iban') setIban(s.value);
          if (s.key === 'bank_bic') setBic(s.value);
          if (s.key === 'bank_name') setBankName(s.value);
          if (s.key === 'bank_motif') setBankMotif(s.value);
        });
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updates = [
        { key: 'bank_iban', value: iban.trim() },
        { key: 'bank_bic', value: bic.trim() },
        { key: 'bank_name', value: bankName.trim() },
        { key: 'bank_motif', value: bankMotif.trim() },
      ];

      for (const u of updates) {
        const { error } = await supabaseAdmin
          .from('site_settings')
          .update({ value: u.value, updated_at: new Date().toISOString() })
          .eq('key', u.key);
        if (error) throw error;
      }

      toast.success('Coordonnées bancaires mises à jour');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setChangingPw(true);
    try {
      // Re-authenticate with current password first
      const { data: { user } } = await supabaseAdmin.auth.getUser();
      if (!user?.email) throw new Error('Utilisateur non trouvé');

      const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInError) {
        toast.error('Mot de passe actuel incorrect');
        return;
      }

      const { error } = await supabaseAdmin.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast.success('Mot de passe modifié avec succès');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setChangingPw(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="font-heading text-2xl font-bold">Paramètres</h2>

      {/* Bank Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="w-5 h-5" />
            Coordonnées bancaires (acompte 20%)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveBank} className="space-y-4">
            <div>
              <Label htmlFor="bankName">Nom du bénéficiaire</Label>
              <Input id="bankName" value={bankName} onChange={e => setBankName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="iban">IBAN</Label>
              <Input id="iban" value={iban} onChange={e => setIban(e.target.value)} required placeholder="DE89 3704 0044 0532 0130 00" />
            </div>
            <div>
              <Label htmlFor="bic">BIC / SWIFT</Label>
              <Input id="bic" value={bic} onChange={e => setBic(e.target.value)} required placeholder="COBADEFFXXX" />
            </div>
            <div>
              <Label htmlFor="motif">Motif du virement</Label>
              <Input id="motif" value={bankMotif} onChange={e => setBankMotif(e.target.value)} placeholder="Ex: Acompte véhicule MCD AUTO" />
            </div>
            <Button type="submit" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Changer le mot de passe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="currentPw">Mot de passe actuel</Label>
              <Input id="currentPw" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="newPw">Nouveau mot de passe</Label>
              <Input id="newPw" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} />
            </div>
            <div>
              <Label htmlFor="confirmPw">Confirmer le nouveau mot de passe</Label>
              <Input id="confirmPw" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={8} />
            </div>
            <Button type="submit" disabled={changingPw}>
              <Lock className="w-4 h-4 mr-2" />
              {changingPw ? 'Modification...' : 'Modifier le mot de passe'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
