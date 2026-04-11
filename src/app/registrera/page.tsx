'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getAuthRedirectUrl } from '@/lib/authRedirect';
import { useOwnerBusiness } from '@/hooks/useBusiness';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { translateAuthError } from '@/lib/authErrors';
import { defaultOpeningHours, sectionTypes, fontStyles, type OpeningHour, type SectionType } from '@/lib/types';
import { t } from '@/lib/i18n';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

const STEPS = ['Konto', 'Webbadress', 'Information', 'Varumärke', 'Sektioner', 'Publicera'];

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, signIn, user } = useAuth();
  const { data: existingBusiness } = useOwnerBusiness(user?.id);
  const [step, setStep] = useState(user ? 1 : 0);
  const [loading, setLoading] = useState(false);
  const isCancelled = searchParams.get('checkout') === 'cancelled';

  const showCancelledView = isCancelled && existingBusiness;

  useEffect(() => {
    if (user && step === 0) setStep(1);
  }, [user]);

  useEffect(() => {
    if (user && existingBusiness && !isCancelled) {
      router.push('/dashboard');
    }
  }, [user, existingBusiness, isCancelled]);

  // Step 1: Account
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Step 2: Subdomain
  const [subdomain, setSubdomain] = useState('');
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);

  // Step 3: Info
  const [businessName, setBusinessName] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [bizEmail, setBizEmail] = useState('');
  const [googleMaps, setGoogleMaps] = useState('');
  const [showOpeningHours, setShowOpeningHours] = useState(false);
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>(defaultOpeningHours);
  const [faqItems, setFaqItems] = useState<{ question: string; answer: string }[]>([]);

  // Step 4: Branding
  const [accentColor, setAccentColor] = useState('#2563EB');
  const [fontStyle, setFontStyle] = useState<'klassisk' | 'modern' | 'jordnara'>('modern');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);

  // Step 5: Sections
  const [enabledSections, setEnabledSections] = useState<Record<SectionType, boolean>>({
    services: false, gallery: false, menu: false, events: false,
    accommodations: false, experiences: false, testimonials: false, news: false,
  });

  const checkSubdomain = async (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSubdomain(clean);
    if (clean.length < 3) { setSubdomainAvailable(null); return; }
    const { data } = await (supabase as any).rpc('is_subdomain_available', { p_subdomain: clean });
    setSubdomainAvailable(data === true);
  };

  const updateHour = (index: number, field: keyof OpeningHour, value: any) => {
    const updated = [...openingHours];
    (updated[index] as any)[field] = value;
    setOpeningHours(updated);
  };

  const handleCreateAccount = async () => {
    setLoading(true);
    const { error, session: newSession } = await signUp(email, password, getAuthRedirectUrl('/registrera'));
    if (error) {
      toast({ title: 'Kunde inte skapa konto', description: translateAuthError(error), variant: 'destructive' });
      setLoading(false);
      return;
    }

    // If no session was returned, Supabase requires email confirmation.
    if (!newSession) {
      setLoading(false);
      toast({
        title: 'Bekräfta din e-post',
        description: 'Vi har skickat ett bekräftelsemail till ' + email + '. Kolla inkorgen (och skräpposten). Fick du inget mail? Kontakta info@iperiferi.se så hjälper vi dig.',
        duration: 10000,
      });
      return;
    }

    // Session returned — user is already signed in via signUp.
    setLoading(false);
    setStep(1);
  };

  const handlePublish = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let logoUrl: string | null = null;
      let heroUrl: string | null = null;

      if (logoFile) {
        const path = `${user.id}/${Date.now()}-logo`;
        const { error } = await supabase.storage.from('logos').upload(path, logoFile);
        if (!error) {
          const { data } = supabase.storage.from('logos').getPublicUrl(path);
          logoUrl = data.publicUrl;
        }
      }

      if (heroFile) {
        const path = `${user.id}/${Date.now()}-hero`;
        const { error } = await supabase.storage.from('hero-images').upload(path, heroFile);
        if (!error) {
          const { data } = supabase.storage.from('hero-images').getPublicUrl(path);
          heroUrl = data.publicUrl;
        }
      }

      const { data: business, error: bizError } = await supabase.from('businesses').insert({
        owner_id: user.id,
        subdomain,
        business_name: businessName,
        short_description: shortDesc,
        about_text: aboutText,
        address,
        phone,
        email: bizEmail,
        google_maps_embed: googleMaps,
        accent_color: accentColor,
        font_style: fontStyle,
        logo_url: logoUrl,
        hero_image_url: heroUrl,
        opening_hours: showOpeningHours ? (openingHours as any) : [],
        is_published: false,
      }).select().single();

      if (bizError) throw bizError;

      const sectionInserts = sectionTypes.map((s, i) => ({
        business_id: business.id,
        section_type: s.type,
        is_enabled: enabledSections[s.type],
        sort_order: i,
      }));
      await supabase.from('sections').insert(sectionInserts);

      if (faqItems.length > 0) {
        await supabase.from('faq').insert(
          faqItems.map((f, i) => ({
            business_id: business.id,
            question: f.question,
            answer: f.answer,
            sort_order: i,
          }))
        );
      }

      // TODO: re-enable Stripe checkout when payment is ready
      router.push('/dashboard');
    } catch (err: any) {
      toast({ title: 'Fel', description: err.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const dayLabels: Record<string, string> = {
    monday: 'Måndag', tuesday: 'Tisdag', wednesday: 'Onsdag',
    thursday: 'Torsdag', friday: 'Fredag', saturday: 'Lördag', sunday: 'Söndag',
  };

  const handleRetryCheckout = async () => {
    setLoading(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const { data: checkoutData, error } = await supabase.functions.invoke('create-checkout', {
        headers: currentSession?.access_token
          ? { Authorization: `Bearer ${currentSession.access_token}` }
          : undefined,
      });
      if (error || !checkoutData?.url) throw new Error('Kunde inte starta betalning.');
      window.location.href = checkoutData.url;
    } catch (err: any) {
      toast({ title: 'Fel', description: err.message, variant: 'destructive' });
      setLoading(false);
    }
  };

  // TODO: re-enable cancelled checkout view when payment is ready

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-primary font-bold text-xl mb-6 block">LumySite</Link>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                i < step ? 'bg-primary text-primary-foreground' :
                i === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`h-0.5 w-6 ${i < step ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{STEPS[step]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 0: Account */}
            {step === 0 && (
              <>
                <div className="space-y-2">
                  <Label>E-post</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Lösenord</Label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
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
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                    Jag godkänner{' '}
                    <Link href="/anvandarvillkor" target="_blank" className="text-primary underline">användarvillkoren</Link> och{' '}
                    <Link href="/integritetspolicy" target="_blank" className="text-primary underline">integritetspolicyn</Link>
                  </label>
                </div>
                <Button onClick={handleCreateAccount} disabled={loading || !email || !password || !acceptedTerms || password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)} className="w-full">
                  {loading ? 'Skapar konto...' : 'Skapa konto & fortsätt'}
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Har du redan ett konto? <Link href="/logga-in" className="text-primary underline">Logga in</Link>
                </p>
              </>
            )}

            {/* Step 1: Subdomain */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label>Välj din webbadress</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">lumysite.com/</span>
                    <Input value={subdomain} onChange={e => checkSubdomain(e.target.value)} placeholder="mittforetag" />
                  </div>
                  {subdomainAvailable === true && <p className="text-sm text-green-600">✓ Tillgängligt!</p>}
                  {subdomainAvailable === false && <p className="text-sm text-destructive">✗ Redan upptaget</p>}
                </div>
              </>
            )}

            {/* Step 2: Info */}
            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label>Företagsnamn *</Label>
                  <Input value={businessName} onChange={e => setBusinessName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Kort beskrivning</Label>
                  <Input value={shortDesc} onChange={e => setShortDesc(e.target.value)} placeholder="Mysigt café i Älvkarleby med hemlagad mat" />
                </div>
                <div className="space-y-2">
                  <Label>Om oss</Label>
                  <Textarea value={aboutText} onChange={e => setAboutText(e.target.value)} rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Adress</Label>
                    <Input value={address} onChange={e => setAddress(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefon</Label>
                    <Input value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>E-post (företag)</Label>
                  <Input value={bizEmail} onChange={e => setBizEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Google Maps inbäddningslänk</Label>
                  <Input value={googleMaps} onChange={e => setGoogleMaps(e.target.value)} placeholder="https://www.google.com/maps/embed?..." />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Visa öppettider på sidan</Label>
                    <Switch checked={showOpeningHours} onCheckedChange={setShowOpeningHours} />
                  </div>
                  {showOpeningHours && openingHours.map((h, i) => (
                    <div key={h.day} className="flex items-center gap-2 text-sm">
                      <span className="w-20">{dayLabels[h.day]}</span>
                      <Switch checked={!h.closed} onCheckedChange={v => updateHour(i, 'closed', !v)} />
                      {!h.closed && (
                        <>
                          <Input type="text" inputMode="numeric" placeholder="HH:MM" maxLength={5} value={h.open} onChange={e => { let v = e.target.value.replace(/[^0-9:]/g, ''); if (v.length === 2 && !v.includes(':') && h.open.length === 1) v = v + ':'; updateHour(i, 'open', v); }} className="w-28 h-8" />
                          <span>–</span>
                          <Input type="text" inputMode="numeric" placeholder="HH:MM" maxLength={5} value={h.close} onChange={e => { let v = e.target.value.replace(/[^0-9:]/g, ''); if (v.length === 2 && !v.includes(':') && h.close.length === 1) v = v + ':'; updateHour(i, 'close', v); }} className="w-28 h-8" />
                        </>
                      )}
                      {h.closed && <span className="text-muted-foreground">Stängt</span>}
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <Label>Vanliga frågor (FAQ)</Label>
                  <p className="text-sm text-muted-foreground">
                    Tips: "Behöver man boka bord?", "Finns det parkering?", "Har ni glutenfria alternativ?"
                  </p>
                  {faqItems.map((f, i) => (
                    <div key={i} className="space-y-1 border rounded p-3">
                      <Input placeholder="Fråga" value={f.question} onChange={e => {
                        const u = [...faqItems]; u[i].question = e.target.value; setFaqItems(u);
                      }} />
                      <Textarea placeholder="Svar" value={f.answer} onChange={e => {
                        const u = [...faqItems]; u[i].answer = e.target.value; setFaqItems(u);
                      }} rows={2} />
                      <Button variant="ghost" size="sm" onClick={() => setFaqItems(faqItems.filter((_, j) => j !== i))}>
                        Ta bort
                      </Button>
                    </div>
                  ))}
                  {faqItems.length < 6 && (
                    <Button variant="outline" size="sm" onClick={() => setFaqItems([...faqItems, { question: '', answer: '' }])}>
                      + Lägg till fråga
                    </Button>
                  )}
                </div>
              </>
            )}

            {/* Step 3: Branding */}
            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label>Logotyp</Label>
                  <Input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} />
                </div>
                <div className="space-y-2">
                  <Label>Hero-bild (stor omslagsbild)</Label>
                  <Input type="file" accept="image/*" onChange={e => setHeroFile(e.target.files?.[0] || null)} />
                </div>
                <div className="space-y-2">
                  <Label>Accentfärg</Label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-12 h-10 border rounded cursor-pointer" />
                    <Input value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-32" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Typsnitt</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {fontStyles.map(f => (
                      <button
                        key={f.value}
                        onClick={() => setFontStyle(f.value)}
                        className={`p-4 rounded-lg border-2 text-center transition ${
                          fontStyle === f.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <span style={{ fontFamily: f.fontFamily }} className="text-lg block mb-1">{f.label}</span>
                        <span className="text-xs text-muted-foreground" style={{ fontFamily: f.fontFamily }}>Aa Bb Cc</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Step 4: Sections */}
            {step === 4 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Välj vilka sektioner du vill aktivera. Du kan ändra detta senare.</p>
                {sectionTypes.map(s => (
                  <div key={s.type} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{t(s.labelKey)}</span>
                    <Switch
                      checked={enabledSections[s.type]}
                      onCheckedChange={v => setEnabledSections({ ...enabledSections, [s.type]: v })}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Step 5: Publish */}
            {step === 5 && (
              <div className="text-center space-y-4">
                <div className="text-6xl">🚀</div>
                <h2 className="text-xl font-semibold">Skapa din sida</h2>
                <p className="text-muted-foreground">
                  Din sida sparas och blir tillgänglig på <strong>lumysite.com/{subdomain}</strong>.
                </p>
                <Button onClick={handlePublish} disabled={loading} size="lg" className="w-full">
                  {loading ? 'Skapar sida...' : 'Skapa sida'}
                </Button>
              </div>
            )}

            {/* Navigation */}
            {step > 0 && step < 5 && (
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Tillbaka
                </Button>
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && (!subdomain || !subdomainAvailable)) ||
                    (step === 2 && !businessName)
                  }
                >
                  Nästa <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
            {step === 5 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="w-full mt-2">
                <ChevronLeft className="w-4 h-4 mr-1" /> Tillbaka
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterContent />
    </Suspense>
  );
}
