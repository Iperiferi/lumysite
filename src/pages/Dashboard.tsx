import { useState, useEffect, useCallback } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
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
import { LogOut, Eye, Settings, Facebook, Instagram, Youtube, Linkedin, Copy, Check, ExternalLink } from 'lucide-react';
import FocalPointPicker from '@/components/dashboard/FocalPointPicker';
import { useQueryClient } from '@tanstack/react-query';
import ServicesEditor from '@/components/dashboard/ServicesEditor';
import GalleryEditor from '@/components/dashboard/GalleryEditor';
import MenuEditor from '@/components/dashboard/MenuEditor';
import EventsEditor from '@/components/dashboard/EventsEditor';
import TestimonialsEditor from '@/components/dashboard/TestimonialsEditor';
import ImageItemEditor from '@/components/dashboard/ImageItemEditor';

export default function Dashboard() {
  const { user, loading: authLoading, signOut, subscribed, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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
    if (!authLoading && !user) navigate('/logga-in');
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

  // Handle checkout success: publish business and refresh subscription
  useEffect(() => {
    if (searchParams.get('checkout') === 'success' && data?.business) {
      const publish = async () => {
        await supabase.from('businesses').update({ is_published: true }).eq('id', data.business.id);
        await checkSubscription();
        queryClient.invalidateQueries({ queryKey: ['ownerBusiness'] });
        toast({ title: '🎉 Din sida är publicerad!', description: 'Ditt abonnemang är aktivt.' });
        setSearchParams({});
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

      // Update sections
      for (const s of sectionTypes) {
        await supabase.from('sections').update({ is_enabled: enabledSections[s.type] })
          .eq('business_id', data.business.id)
          .eq('section_type', s.type);
      }

      // Update FAQ
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
      toast({ title: 'Sparad!' });
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
    if (newState) {
      setShowPublishConfirm(true);
      return;
    }
    await doPublish(false);
  };

  const doPublish = async (publish: boolean) => {
    if (!data) return;
    await supabase.from('businesses').update({ is_published: publish }).eq('id', data.business.id);
    queryClient.invalidateQueries({ queryKey: ['ownerBusiness'] });
    if (publish) {
      setShowPublishedUrl(true);
      setUrlCopied(false);
    } else {
      toast({ title: 'Sidan är avpublicerad' });
    }
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
      const { data: checkoutData, error } = await supabase.functions.invoke('create-checkout');
      if (error || !checkoutData?.url) throw new Error('Kunde inte starta betalning.');
      window.location.href = checkoutData.url;
    } catch (err: any) {
      toast({ title: 'Fel', description: err.message, variant: 'destructive' });
      setSaving(false);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p>Du har ingen sida ännu.</p>
        <Button onClick={() => navigate('/registrera')}>Skapa din sida</Button>
      </div>
    );
  }

  // Block dashboard if not subscribed (unless just returned from successful checkout)
  const isCheckoutSuccess = searchParams.get('checkout') === 'success';
  if (!subscribed && !isCheckoutSuccess) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Abonnemanget är inte aktivt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Du behöver ett aktivt abonnemang för att använda din dashboard och publicera din sida.
            </p>
            <p className="text-sm text-muted-foreground">99 kr/mån exkl. moms.</p>
            <Button onClick={handleStartCheckout} disabled={saving} size="lg" className="w-full">
              {saving ? 'Förbereder betalning...' : '💳 Gå till betalning'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate('/'); }} className="w-full">
              Logga ut
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-primary font-bold text-xl">LumySite</Link>
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
            <Link to="/konto"><Settings className="w-4 h-4" /></Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate('/'); }}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-6 px-4">
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
                  <Label>Google Maps inbäddningslänk</Label>
                  <Input value={googleMaps} onChange={e => setGoogleMaps(e.target.value)} />
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
                          <Input type="time" value={h.open} onChange={e => updateHour(i, 'open', e.target.value)} className="w-28 h-8" />
                          <span>–</span>
                          <Input type="time" value={h.close} onChange={e => updateHour(i, 'close', e.target.value)} className="w-28 h-8" />
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
                  <p className="text-sm text-muted-foreground">Lägg till länkar till dina sociala medier (visas på din publika sida).</p>
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

      {/* Published URL dialog */}
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
