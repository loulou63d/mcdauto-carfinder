import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, AlertCircle, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      setError(error.message === 'Invalid login credentials' 
        ? 'Email ou mot de passe incorrect' 
        : error.message);
    } else {
      setTimeout(() => navigate('/admin'), 500);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Veuillez entrer votre email');
      return;
    }
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setResetSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 font-heading font-bold text-2xl text-primary mb-2">
            <Car className="w-8 h-8" />
            MCD AUTO
          </div>
          <p className="text-muted-foreground text-sm">Connexion administrateur</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-lg border p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          {resetSent && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-green-100 text-green-800 text-sm">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Un email de réinitialisation a été envoyé à {email}
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Mot de passe</label>
            <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
          <button
            type="button"
            onClick={handleResetPassword}
            className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
            disabled={loading}
          >
            Mot de passe oublié ?
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
