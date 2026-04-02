import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
import { defaultOpeningHours, sectionTypes, fontStyles, type OpeningHour, type SectionType } from '@/lib/types';
import { t } from '@/lib/i18n';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const STEPS = ['Konto', 'Subdomän', 'Information', 'Varumärke', 'Sektioner', 'Publicera'];

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp, signIn, user } = useAuth();
  const { data: existingBusiness } = useOwnerBusiness(user?.id);
  const [step, setStep] = useState(user ? 1 : 0);
  const [loading, setLoading] = useState(false);
  const isCancelled = searchParams.get('checkout') === 'cancelled';

  // If user has a business and checkout was cancelled, show retry UI
  const showCancelledView = isCancelled && existingBusiness;

  // Skip account step if already logged in
  useEffect(() => {
    if (user && step === 0) setStep(1);
  }, [user]);

  // If logged-in user already has a business (not from cancelled checkout), redirect to dashboard
  useEffect(() => {
    if (user && existingBusiness && !isCancelled) {
      navigate('/dashboard');
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
    const { data } = await supabase.from('businesses_public' as any).select('id').eq('subdomain', clean).maybeSingle();
    setSubdomainAvailable(!data);
  };

  const updateHour = (index: number, field: keyof OpeningHour, value: any) => {
    const updated = [...openingHours];
    (updated[index] as any)[field] = value;
    setOpeningHours(updated);
  };

  const handleCreateAccount = async () => {
    setLoading(true);
    const { error } = await signUp(email, password);
    if (error) {
      toast({ title: 'Fel', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }
    // Auto sign in
    await signIn(email, password);
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
        is_published: false, // Not published until payment
      }).select().single();

      if (bizError) throw bizError;

      // Create sections
      const sectionInserts = sectionTypes.map((s, i) => ({
        business_id: business.id,
        section_type: s.type,
        is_enabled: enabledSections[s.type],
        sort_order: i,
      }));
      await supabase.from('sections').insert(sectionInserts);

      // Create FAQ items
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

      // Redirect to Stripe Checkout
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout');
      if (checkoutError || !checkoutData?.url) {
        throw new Error('Kunde inte starta betalning. Försök igen.');
      }
      window.location.href = checkoutData.url;
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
      const { data: checkoutData, error } = await supabase.functions.invoke('create-checkout');
      if (error || !checkoutData?.url) throw new Error('Kunde inte starta betalning.');
      window.location.href = checkoutData.url;
    } catch (err: any) {
      toast({ title: 'Fel', description: err.message, variant: 'destructive' });
      setLoading(false);
    }
  };

  if (showCancelledView) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Betalningen avbröts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Din sida har skapats men betalningen slutfördes inte. Du behöver ett aktivt abonnemang för att publicera din sida.
            </p>
            <p className="text-sm text-muted-foreground">99 kr/mån exkl. moms.</p>
            <Button onClick={handleRetryCheckout} disabled={loading} size="lg" className="w-full">
              {loading ? 'Förbereder betalning...' : '💳 Försök igen'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')} className="w-full">
              Gå till dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-primary font-bold text-xl mb-6 block">LumySite</Link>

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
                    <Link to="/anvandarvillkor" target="_blank" className="text-primary underline">användarvillkoren</Link> och{' '}
                    <Link to="/integritetspolicy" target="_blank" className="text-primary underline">integritetspolicyn</Link>
                  </label>
                </div>
                <Button onClick={handleCreateAccount} disabled={loading || !email || !password || !acceptedTerms} className="w-full">
                  {loading ? 'Skapar konto...' : 'Skapa konto & fortsätt'}
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Har du redan ett konto? <Link to="/logga-in" className="text-primary underline">Logga in</Link>
                </p>
              </>
            )}

            {/* Step 1: Subdomain */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label>Välj subdomännamn</Label>
                  <div className="flex items-center gap-2">
                    <Input value={subdomain} onChange={e => checkSubdomain(e.target.value)} placeholder="mittforetag" />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">.lumysite.se</span>
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

                {/* Opening hours */}
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
                          <Input type="time" value={h.open} onChange={e => updateHour(i, 'open', e.target.value)} className="w-28 h-8" />
                          <span>–</span>
                          <Input type="time" value={h.close} onChange={e => updateHour(i, 'close', e.target.value)} className="w-28 h-8" />
                        </>
                      )}
                      {h.closed && <span className="text-muted-foreground">Stängt</span>}
                    </div>
                  ))}
                </div>

                {/* FAQ */}
                <div className="space-y-3">
                  <Label>Vanliga frågor (FAQ)</Label>
                  <p className="text-sm text-muted-foreground">
                    Tips på vanliga frågor: "Behöver man boka bord?", "Finns det parkering?", "Har ni glutenfria alternativ?", "Är det barnanpassat?", "Kan man hyra för privata event?", "Vad kostar det?"
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
                <p className="text-sm text-muted-foreground">Välj vilka sektioner du vill aktivera på din sida. Du kan ändra detta senare.</p>
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
                <div className="text-6xl">💳</div>
                <h2 className="text-xl font-semibold">Aktivera ditt abonnemang</h2>
                <p className="text-muted-foreground">
                  Din sida sparas och blir tillgänglig på <strong>{subdomain}.lumysite.se</strong> efter betalning.
                </p>
                <p className="text-sm text-muted-foreground">
                  99 kr/mån exkl. moms. Du kan hantera ditt abonnemang via din dashboard.
                </p>
                <Button onClick={handlePublish} disabled={loading} size="lg" className="w-full">
                  {loading ? 'Förbereder betalning...' : '💳 Gå till betalning'}
                </Button>
              </div>
            )}

            {/* Navigation buttons */}
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
