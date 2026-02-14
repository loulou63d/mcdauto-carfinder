import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import logoMcd from '@/assets/logo-mcd.png';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
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
          <div className="flex items-center justify-center mb-2">
            <img src={logoMcd} alt="MCD AUTO" className="h-16 w-auto" />
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
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} className="pr-10" />
              <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
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
