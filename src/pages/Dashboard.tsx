import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import { LogOut, ExternalLink, Eye } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
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
  const [saving, setSaving] = useState(false);

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
    setOpeningHours(b.opening_hours.length ? b.opening_hours : defaultOpeningHours);
    setAccentColor(b.accent_color || '#2563EB');
    setFontStyle(b.font_style);
    setCtaText(b.cta_text);
    setFaqItems(data.faq.map(f => ({ id: f.id, question: f.question, answer: f.answer })));

    const secs: Record<SectionType, boolean> = {} as any;
    sectionTypes.forEach(s => { secs[s.type] = false; });
    data.sections.forEach(s => { secs[s.section_type as SectionType] = s.is_enabled; });
    setEnabledSections(secs);
  }, [data]);

  const handleSave = async () => {
    if (!data) return;
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
        opening_hours: openingHours as any,
        accent_color: accentColor,
        font_style: fontStyle,
        cta_text: ctaText,
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

  const handlePublishToggle = async () => {
    if (!data) return;
    const newState = !data.business.is_published;
    await supabase.from('businesses').update({ is_published: newState }).eq('id', data.business.id);
    queryClient.invalidateQueries({ queryKey: ['ownerBusiness'] });
    toast({ title: newState ? 'Sidan är publicerad!' : 'Sidan är avpublicerad' });
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

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p>Du har ingen sida ännu.</p>
        <Button onClick={() => navigate('/registrera')}>Skapa din sida</Button>
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
            <a href={`/site/${data.business.subdomain}`} target="_blank">
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
                  <Label>Öppettider</Label>
                  {openingHours.map((h, i) => (
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
                    <img src={data.business.hero_image_url} alt="Hero" className="w-full h-40 object-cover border rounded" />
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sections">
            <Card>
              <CardHeader><CardTitle>Sektioner</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Aktivera eller inaktivera sektioner på din publika sida.</p>
                {sectionTypes.map(s => (
                  <div key={s.type} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{t(s.labelKey)}</span>
                    <Switch
                      checked={enabledSections[s.type]}
                      onCheckedChange={v => setEnabledSections({ ...enabledSections, [s.type]: v })}
                    />
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
    </div>
  );
}
