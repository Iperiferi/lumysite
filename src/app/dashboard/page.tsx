'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useOwnerBusiness } from '@/hooks/useBusiness';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { defaultOpeningHours, sectionTypes, fontStyles, type OpeningHour, type SectionType } from '@/lib/types';
import { t } from '@/lib/i18n';
import { LogOut, Eye, Settings, Facebook, Instagram, Youtube, Linkedin, Copy, Check, ExternalLink, AlertTriangle, Clock, CreditCard } from 'lucide-react';
import FocalPointPicker from '@/components/dashboard/FocalPointPicker';
import { useQueryClient } from '@tanstack/react-query';
import ServicesEditor from '@/components/dashboard/ServicesEditor';
import GalleryEditor from '@/components/dashboard/GalleryEditor';
import MenuEditor from '@/components/dashboard/MenuEditor';
import EventsEditor from '@/components/dashboard/EventsEditor';
import TestimonialsEditor from '@/components/dashboard/TestimonialsEditor';
import ImageItemEditor from '@/components/dashboard/ImageItemEditor';

function DashboardContent() {
  const { user, loading: authLoading, signOut, subscribed, checkSubscription, isTrialActive, daysLeftInTrial, hasStripeSubscription, trialEndsAt } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data, isLoading } = useOwnerBusiness(user?.id);

  const [businessName, setBusinessName] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [bizEmail, setBizEmail] = useState('');
  const [googleMaps, setGoogleMaps] = useState('');
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>(defaultOpeningHours);
  const [accentColor, setAccentColor] = useState('#2563EB');
  const [fontStyle, setFontStyle] = useState<'klassisk' | 'modern' | 'jordnara'>('modern');
  const [ctaText, setCtaText] = useState('Kontakta oss');
  const [enabledSections, setEnabledSections] = useState<Record<SectionType, boolean>>({
    services: false, gallery: false, menu: false, events: false,
    accommodations: false, experiences: false, testimonials: false, news: false,
  });
  const [faqItems, setFaqItems] = useState<{ id?: string; question: string; answer: string }[]>([]);
  const [showOpeningHours, setShowOpeningHours] = useState(false);
  const [saving, setSaving] = useState(false);
  const [heroFocalPoint, setHeroFocalPoint] = useState('50% 50%');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/logga-in');
  }, [authLoading, user]);

  useEffect(() => {
    if (!data) return;
    const b = data.business;
    setBusinessName(b.business_name);
    setShortDesc(b.short_description || '');
    setAboutText(b.about_text || '');
    setAddress(b.address || '');
    setPhone(b.phone || '');
    setBizEmail(b.email || '');
    setGoogleMaps(b.google_maps_embed || '');
    setShowOpeningHours(Array.isArray(b.opening_hours) && b.opening_hours.length > 0);
    setOpeningHours(b.opening_hours.length ? b.opening_hours : defaultOpeningHours);
    setAccentColor(b.accent_color || '#2563EB');
    setFontStyle(b.font_style);
    setCtaText(b.cta_text);
    setHeroFocalPoint(b.hero_focal_point || '50% 50%');
    setFacebookUrl(b.facebook_url || '');
    setInstagramUrl(b.instagram_url || '');
    setTiktokUrl(b.tiktok_url || '');
    setYoutubeUrl(b.youtube_url || '');
    setLinkedinUrl(b.linkedin_url || '');
    setFaqItems(data.faq.map(f => ({ id: f.id, question: f.question, answer: f.answer })));

    const secs: Record<SectionType, boolean> = {} as any;
    sectionTypes.forEach(s => { secs[s.type] = false; });
    data.sections.forEach(s => { secs[s.section_type as SectionType] = s.is_enabled; });
    setEnabledSections(secs);
  }, [data]);

  useEffect(() => {
    if (searchParams.get('checkout') === 'success' && data?.business) {
      const publish = async () => {
        await supabase.from('businesses').update({ is_published: true }).eq('id', data.business.id);
        await checkSubscription();
        queryClient.invalidateQueries({ queryKey: ['ownerBusiness'] });
        toast({ title: '🎉 Din sida är publicerad!', description: 'Ditt abonnemang är aktivt.' });
        router.replace('/dashboard');
      };
      publish();
    }
  }, [searchParams, data]);

  const handleSave = async () => {
    if (!data) return;

    const dirtyInlineEditor = document.querySelector<HTMLElement>('[data-inline-dirty="true"]');
    if (dirtyInlineEditor) {
      const label = dirtyInlineEditor.dataset.inlineDirtyLabel || 'innehållet';
      toast({
        title: 'Lägg till posten först',
        description: `Klicka på "+ Lägg till ${label}" innan du sparar sidan.`,
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      await supabase.from('businesses').update({
        business_name: businessName,
        short_description: shortDesc,
        about_text: aboutText,
        address,
        phone,
        email: bizEmail,
        google_maps_embed: googleMaps,
        opening_hours: showOpeningHours ? (openingHours as any) : [],
        accent_color: accentColor,
        font_style: fontStyle,
        cta_text: ctaText,
        hero_focal_point: heroFocalPoint,
        facebook_url: facebookUrl || null,
        instagram_url: instagramUrl || null,
        tiktok_url: tiktokUrl || null,
        youtube_url: youtubeUrl || null,
        linkedin_url: linkedinUrl || null,
      }).eq('id', data.business.id);

      for (const s of sectionTypes) {
        await supabase.from('sections').update({ is_enabled: enabledSections[s.type] })
          .eq('business_id', data.business.id)
          .eq('section_type', s.type);
      }

      await supabase.from('faq').delete().eq('business_id', data.business.id);
      if (faqItems.length > 0) {
        await supabase.from('faq').insert(
          faqItems.filter(f => f.question).map((f, i) => ({
            business_id: data.business.id,
            question: f.question,
            answer: f.answer,
            sort_order: i,
          }))
        );
      }

      queryClient.invalidateQueries({ queryKey: ['ownerBusiness'] });
      toast({ title: 'Sparad!', description: 'Översätter till engelska...' });

      // Trigger translation in background — don't await
      supabase.auth.getSession().then(({ data: { session: s } }) => {
        if (!s?.access_token) return;
        supabase.functions.invoke('translate-content', {
          headers: { Authorization: `Bearer ${s.access_token}` },
        }).then(({ error: translateError }) => {
          if (translateError) {
            console.error('translate-content error:', translateError);
            toast({ title: 'Engelska kunde inte uppdateras', description: translateError.message, variant: 'destructive' });
          } else {
            queryClient.invalidateQueries({ queryKey: ['ownerBusiness'] });
            toast({ title: 'Engelska uppdaterad' });
          }
        }).catch((e: any) => {
          console.error('translate-content exception:', e);
        });
      });
    } catch (err: any) {
      toast({ title: 'Fel', description: err.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showPublishedUrl, setShowPublishedUrl] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  const handlePublishToggle = async () => {
    if (!data) return;
    const newState = !data.business.is_published;
    if (newState) { setShowPublishConfirm(true); return; }
    await doPublish(false);
  };

  const doPublish = async (publish: boolean) => {
    if (!data) return;
    await supabase.from('businesses').update({ is_published: publish }).eq('id', data.business.id);
    queryClient.invalidateQueries({ queryKey: ['ownerBusiness'] });
    if (publish) { setShowPublishedUrl(true); setUrlCopied(false); }
    else { toast({ title: 'Sidan är avpublicerad' }); }
  };

  const publicUrl = data ? `https://lumysite.com/${data.business.subdomain}` : '';

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setUrlCopied(true);
      toast({ title: 'Länk kopierad!' });
      setTimeout(() => setUrlCopied(false), 2000);
    } catch {
      toast({ title: 'Kunde inte kopiera', variant: 'destructive' });
    }
  };

  const handleLogoUpload = async (file: File) => {
    if (!user || !data) return;
    const path = `${user.id}/${Date.now()}-logo`;
    await supabase.storage.from('logos').upload(path, file);
    const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path);
    await supabase.from('businesses').update({ logo_url: urlData.publicUrl }).eq('id', data.business.id);
    queryClient.invalidateQueries({ queryKey: ['ownerBusiness'] });
  };

  const handleHeroUpload = async (file: File) => {
    if (!user || !data) return;
    const path = `${user.id}/${Date.now()}-hero`;
    await supabase.storage.from('hero-images').upload(path, file);
    const { data: urlData } = supabase.storage.from('hero-images').getPublicUrl(path);
    await supabase.from('businesses').update({ hero_image_url: urlData.publicUrl }).eq('id', data.business.id);
    queryClient.invalidateQueries({ queryKey: ['ownerBusiness'] });
  };

  const dayLabels: Record<string, string> = {
    monday: 'Måndag', tuesday: 'Tisdag', wednesday: 'Onsdag',
    thursday: 'Torsdag', friday: 'Fredag', saturday: 'Lördag', sunday: 'Söndag',
  };

  const updateHour = (index: number, field: keyof OpeningHour, value: any) => {
    const updated = [...openingHours];
    (updated[index] as any)[field] = value;
    setOpeningHours(updated);
  };

  if (authLoading || isLoading) return <div className="min-h-screen flex items-center justify-center">Laddar...</div>;

  const handleStartCheckout = async () => {
    setSaving(true);
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
      setSaving(false);
    }
  };

  const handleCustomerPortal = async () => {
    setSaving(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const { data: portalData, error } = await supabase.functions.invoke('customer-portal', {
        headers: currentSession?.access_token
          ? { Authorization: `Bearer ${currentSession.access_token}` }
          : undefined,
      });
      if (error || !portalData?.url) throw new Error('Kunde inte öppna kundportalen.');
      window.location.href = portalData.url;
    } catch (err: any) {
      toast({ title: 'Fel', description: err.message, variant: 'destructive' });
      setSaving(false);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p>Du har ingen sida ännu.</p>
        <Button onClick={() => router.push('/registrera')}>Skapa din sida</Button>
      </div>
    );
  }

  // Subscription gate — show paywall if neither trial nor Stripe is active
  const isCheckoutSuccess = searchParams.get('checkout') === 'success';
  // Fallback: check trial_ends_at directly from business data in case check-subscription edge function fails
  const clientTrialActive = (data.business as any)?.trial_ends_at
    ? new Date((data.business as any).trial_ends_at) > new Date()
    : false;
  if (!subscribed && !isCheckoutSuccess && !clientTrialActive) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-background rounded-2xl border-2 border-destructive/30 p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Din provperiod har gått ut</h2>
            <p className="text-muted-foreground">Din gratis provperiod på 7 dagar är slut och din sida är avpublicerad. Starta ett abonnemang för att aktivera den igen.</p>
          </div>
          <div className="bg-muted rounded-xl p-4 text-left space-y-2">
            <div className="flex justify-between text-sm"><span>Pris</span><span className="font-semibold">99 kr/mån</span></div>
            <div className="flex justify-between text-sm text-muted-foreground"><span>exkl. moms</span><span>Ingen bindningstid</span></div>
          </div>
          <Button size="lg" className="w-full" onClick={handleStartCheckout} disabled={saving}>
            <CreditCard className="w-4 h-4 mr-2" />
            {saving ? 'Laddar...' : 'Starta abonnemang — 99 kr/mån'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { signOut(); router.push('/'); }}>
            Logga ut
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-primary font-bold text-xl">LumySite</Link>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <a href={`/${data.business.subdomain}`} target="_blank">
              <Eye className="w-4 h-4 mr-1" /> Förhandsgranska
            </a>
          </Button>
          <Button
            variant={data.business.is_published ? 'outline' : 'default'}
            size="sm"
            onClick={handlePublishToggle}
          >
            {data.business.is_published ? 'Avpublicera' : 'Publicera'}
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/konto"><Settings className="w-4 h-4" /></Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { signOut(); router.push('/'); }}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-6 px-4">

        {/* Trial / subscription banner */}
        {isTrialActive && daysLeftInTrial !== null && daysLeftInTrial <= 2 && (
          <div className="rounded-lg px-4 py-3 mb-4 text-sm bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              <span>
                <strong>{daysLeftInTrial === 0 ? 'Sista dagen' : `${daysLeftInTrial} dag${daysLeftInTrial === 1 ? '' : 'ar'} kvar`}</strong> av din gratis provperiod.
                Starta ett abonnemang för att behålla din sida.
              </span>
            </div>
            <Button size="sm" onClick={handleStartCheckout} disabled={saving} className="shrink-0">
              <CreditCard className="w-3 h-3 mr-1" /> 99 kr/mån
            </Button>
          </div>
        )}

        {isTrialActive && daysLeftInTrial !== null && daysLeftInTrial > 2 && (
          <div className="rounded-lg px-4 py-3 mb-4 text-sm bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              <span>Gratis provperiod — <strong>{daysLeftInTrial} dagar kvar</strong>. Därefter 99 kr/mån, ingen bindningstid.</span>
            </div>
            <Button size="sm" variant="outline" onClick={handleStartCheckout} disabled={saving} className="shrink-0 border-blue-300 text-blue-900 hover:bg-blue-100">
              Starta abonnemang
            </Button>
          </div>
        )}

        {hasStripeSubscription && (
          <div className="rounded-lg px-4 py-3 mb-4 text-sm bg-green-50 border border-green-200 text-green-900 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span><strong>Aktivt abonnemang</strong> — 99 kr/mån</span>
            </div>
            <Button size="sm" variant="outline" onClick={handleCustomerPortal} disabled={saving} className="shrink-0 border-green-300 text-green-900 hover:bg-green-100">
              Hantera abonnemang
            </Button>
          </div>
        )}

        <div className={`rounded-lg px-4 py-3 mb-6 text-sm ${data.business.is_published ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>
          {data.business.is_published
            ? '✅ Din sida är publicerad. Ändringar du sparar syns direkt på den publicerade sidan.'
            : '⚠️ Din sida är inte synlig för besökare ännu. Klicka på "Publicera" ovan för att göra den offentlig.'}
        </div>
        <Tabs defaultValue="info">
          <TabsList className="mb-6">
            <TabsTrigger value="info">Grundinfo</TabsTrigger>
            <TabsTrigger value="branding">Varumärke</TabsTrigger>
            <TabsTrigger value="sections">Sektioner</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardHeader><CardTitle>Grundinformation</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Företagsnamn</Label>
                  <Input value={businessName} onChange={e => setBusinessName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Kort beskrivning</Label>
                  <Input value={shortDesc} onChange={e => setShortDesc(e.target.value)} />
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
                  <Label>E-post</Label>
                  <Input value={bizEmail} onChange={e => setBizEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Google Maps</Label>
                  <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">Så här gör du:</p>
                    <ol className="list-decimal pl-4 space-y-0.5">
                      <li>Gå till <strong>Google Maps</strong> och sök upp din plats</li>
                      <li>Klicka på <strong>Dela</strong></li>
                      <li>Välj fliken <strong>Bädda in en karta</strong></li>
                      <li>Klicka <strong>Kopiera HTML</strong> och klistra in nedan</li>
                    </ol>
                  </div>
                  <Textarea
                    value={googleMaps}
                    onChange={e => setGoogleMaps(e.target.value)}
                    placeholder={'<iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>'}
                    rows={3}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CTA-knapptext</Label>
                  <Input value={ctaText} onChange={e => setCtaText(e.target.value)} />
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding">
            <Card>
              <CardHeader><CardTitle>Varumärke & utseende</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Logotyp</Label>
                  {data.business.logo_url && (
                    <img src={data.business.logo_url} alt="Logo" className="w-20 h-20 object-contain border rounded" />
                  )}
                  <Input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />
                </div>
                <div className="space-y-2">
                  <Label>Hero-bild</Label>
                  {data.business.hero_image_url && (
                    <FocalPointPicker
                      imageUrl={data.business.hero_image_url}
                      focalPoint={heroFocalPoint}
                      onChange={setHeroFocalPoint}
                    />
                  )}
                  <Input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleHeroUpload(e.target.files[0])} />
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
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 pt-4 border-t">
                  <Label className="text-base font-semibold">Sociala medier</Label>
                  <p className="text-sm text-muted-foreground">Lägg till länkar till dina sociala medier.</p>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-2">
                      <Facebook className="w-5 h-5 text-muted-foreground shrink-0" />
                      <Input placeholder="https://facebook.com/dittforetag" value={facebookUrl} onChange={e => setFacebookUrl(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Instagram className="w-5 h-5 text-muted-foreground shrink-0" />
                      <Input placeholder="https://instagram.com/dittforetag" value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.87a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.3z"/></svg>
                      <Input placeholder="https://tiktok.com/@dittforetag" value={tiktokUrl} onChange={e => setTiktokUrl(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Youtube className="w-5 h-5 text-muted-foreground shrink-0" />
                      <Input placeholder="https://youtube.com/@dittforetag" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Linkedin className="w-5 h-5 text-muted-foreground shrink-0" />
                      <Input placeholder="https://linkedin.com/company/dittforetag" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sections">
            <Card>
              <CardHeader><CardTitle>Sektioner</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Aktivera eller inaktivera sektioner på din publika sida.</p>
                {sectionTypes.map(s => (
                  <div key={s.type} className="p-3 border rounded-lg space-y-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{t(s.labelKey)}</span>
                      <Switch
                        checked={enabledSections[s.type]}
                        onCheckedChange={v => setEnabledSections({ ...enabledSections, [s.type]: v })}
                      />
                    </div>
                    {enabledSections[s.type] && data && (
                      <>
                        {s.type === 'services' && <ServicesEditor businessId={data.business.id} />}
                        {s.type === 'gallery' && <GalleryEditor businessId={data.business.id} />}
                        {s.type === 'menu' && <MenuEditor businessId={data.business.id} />}
                        {s.type === 'events' && <EventsEditor businessId={data.business.id} />}
                        {s.type === 'accommodations' && (
                          <ImageItemEditor businessId={data.business.id} table="accommodations" bucket="accommodation-images"
                            nameField="name" namePlaceholder="Namn på boende" descField="description" descPlaceholder="Beskrivning" addLabel="Boende" />
                        )}
                        {s.type === 'experiences' && (
                          <ImageItemEditor businessId={data.business.id} table="experiences" bucket="experience-images"
                            nameField="name" namePlaceholder="Namn på upplevelse" descField="description" descPlaceholder="Beskrivning" addLabel="Upplevelse" />
                        )}
                        {s.type === 'testimonials' && <TestimonialsEditor businessId={data.business.id} />}
                        {s.type === 'news' && (
                          <ImageItemEditor businessId={data.business.id} table="news" bucket="news-images"
                            nameField="title" namePlaceholder="Rubrik" descField="content" descPlaceholder="Innehåll" addLabel="Nyhet" dateField="published_date" />
                        )}
                      </>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq">
            <Card>
              <CardHeader><CardTitle>Vanliga frågor</CardTitle></CardHeader>
              <CardContent className="space-y-3">
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? 'Sparar...' : 'Spara ändringar'}
          </Button>
        </div>
      </div>

      <AlertDialog open={showPublishConfirm} onOpenChange={setShowPublishConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publicera din sida</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Genom att publicera bekräftar du att:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Du ansvarar själv för allt innehåll som publiceras på din sida.</li>
                <li>Sidan blir offentlig och tillgänglig för alla på internet.</li>
                <li>Innehållet inte bryter mot gällande lagar eller andras rättigheter.</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setShowPublishConfirm(false); doPublish(true); }}>
              Jag godkänner — publicera
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showPublishedUrl} onOpenChange={setShowPublishedUrl}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>🎉 Sidan är publicerad!</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>Din sida är nu live. Dela adressen med dina kunder:</p>
                <div className="flex items-center gap-2">
                  <Input value={publicUrl} readOnly className="text-sm font-mono" />
                  <Button size="icon" variant="outline" onClick={handleCopyUrl}>
                    {urlCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                Öppna sidan <ExternalLink className="w-4 h-4" />
              </a>
            </AlertDialogAction>
            <AlertDialogCancel>Stäng</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Laddar...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
