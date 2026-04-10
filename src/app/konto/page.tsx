'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { translateAuthError } from '@/lib/authErrors';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Trash2, KeyRound } from 'lucide-react';

export default function AccountSettings() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) router.push('/logga-in');
  }, [user]);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: 'Fel', description: 'Lösenordet måste vara minst 6 tecken', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Fel', description: 'Lösenorden matchar inte', variant: 'destructive' });
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: 'Fel', description: translateAuthError(error), variant: 'destructive' });
    } else {
      toast({ title: 'Lösenordet har ändrats!' });
      setNewPassword('');
      setConfirmPassword('');
    }
    setChangingPassword(false);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('delete-account', {
        headers: currentSession?.access_token
          ? { Authorization: `Bearer ${currentSession.access_token}` }
          : undefined,
      });
      if (error || !data?.success) throw new Error('Kunde inte radera kontot. Försök igen.');
      await signOut();
      router.push('/');
      toast({ title: 'Ditt konto och all data har raderats.' });
    } catch (err: any) {
      toast({ title: 'Fel', description: err.message, variant: 'destructive' });
      setDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Tillbaka till dashboard
        </Link>

        <h1 className="text-2xl font-bold mb-6">Kontoinställningar</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Ditt konto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Inloggad som <strong>{user.email}</strong></p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <KeyRound className="w-5 h-5" /> Byt lösenord
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nytt lösenord</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minst 6 tecken" />
            </div>
            <div className="space-y-2">
              <Label>Bekräfta nytt lösenord</Label>
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
            <Button onClick={handleChangePassword} disabled={changingPassword || !newPassword || !confirmPassword}>
              {changingPassword ? 'Sparar...' : 'Byt lösenord'}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" /> Radera konto
            </CardTitle>
            <CardDescription>
              Detta raderar permanent ditt konto, din publicerade sida och all data. Åtgärden kan <strong>inte</strong> ångras.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Radera mitt konto</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Är du säker?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Allt raderas: ditt konto, din sida, alla bilder och texter. Detta kan inte ångras.
                    <br /><br />
                    Skriv <strong>RADERA</strong> nedan för att bekräfta.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Input value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} placeholder='Skriv "RADERA"' />
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>Avbryt</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={deleteConfirmText !== 'RADERA'}
                    onClick={(e) => { e.preventDefault(); setShowFinalConfirm(true); }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Fortsätt
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showFinalConfirm} onOpenChange={setShowFinalConfirm}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sista chansen!</AlertDialogTitle>
                  <AlertDialogDescription>
                    Är du helt säker på att du vill radera ditt konto och all data? Denna åtgärd är permanent och kan inte ångras.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => { setShowFinalConfirm(false); setDeleteConfirmText(''); }}>
                    Nej, behåll mitt konto
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? 'Raderar...' : 'Ja, radera allt permanent'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
