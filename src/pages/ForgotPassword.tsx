import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { getAuthRedirectUrl } from '@/lib/authRedirect';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl('/aterstall-losenord'),
    });

    setLoading(false);

    if (error) {
      toast({ title: 'Något gick fel', description: error.message, variant: 'destructive' });
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Glömt lösenord</CardTitle>
          <CardDescription>Ange din e-post så skickar vi en återställningslänk</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Om det finns ett konto med den e-postadressen har vi skickat en återställningslänk. Kolla din inkorg.
              </p>
              <Link to="/logga-in" className="text-primary underline text-sm">
                Tillbaka till inloggning
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-post</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Skickar...' : 'Skicka återställningslänk'}
                </Button>
              </form>
              <p className="text-sm text-center mt-4 text-muted-foreground">
                <Link to="/logga-in" className="text-primary underline">Tillbaka till inloggning</Link>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
