import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Car } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Auth = () => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Will be connected to Cloud auth later
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 font-heading font-bold text-2xl text-primary mb-2">
            <Car className="w-8 h-8" />
            MCD AUTO
          </div>
          <p className="text-muted-foreground text-sm">
            {isLogin ? t('auth.login') : t('auth.signup')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-lg border p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">{t('auth.email')}</label>
            <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('auth.password')}</label>
            <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
            {isLogin ? t('auth.loginButton') : t('auth.signupButton')}
          </Button>

          {isLogin && (
            <button type="button" className="text-sm text-accent hover:underline w-full text-center">
              {t('auth.forgotPassword')}
            </button>
          )}
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-accent font-medium hover:underline">
            {isLogin ? t('auth.signup') : t('auth.login')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
