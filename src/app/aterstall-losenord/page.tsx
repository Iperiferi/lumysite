'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { translateAuthError } from '@/lib/authErrors';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const passwordValid = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid) {
      toast({ title: 'Lösenordet uppfyller inte kraven', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Lösenorden matchar inte', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: 'Kunde inte uppdatera lösenord', description: translateAuthError(error), variant: 'destructive' });
    } else {
      toast({ title: 'Lösenordet har uppdaterats!' });
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Nytt lösenord</CardTitle>
          <CardDescription>Ange ditt nya lösenord</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nytt lösenord</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              <ul className="text-xs space-y-0.5 mt-1">
                {[
                  { label: 'Minst 8 tecken', ok: password.length >= 8 },
                  { label: 'Minst en stor bokstav (A–Z)', ok: /[A-Z]/.test(password) },
                  { label: 'Minst en siffra (0–9)', ok: /[0-9]/.test(password) },
                ].map(({ label, ok }) => (
                  <li key={label} className={password.length === 0 ? 'text-muted-foreground' : ok ? 'text-green-600' : 'text-destructive'}>
                    {password.length === 0 ? '·' : ok ? '✓' : '✗'} {label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Bekräfta lösenord</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !passwordValid}>
              {loading ? 'Uppdaterar...' : 'Uppdatera lösenord'}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground bg-muted rounded-lg p-3 mt-4 text-center">
            Fick du inget mail?{' '}
            <a href="mailto:info@iperiferi.se" className="text-primary underline font-medium">info@iperiferi.se</a>{' '}
            hjälper dig.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
