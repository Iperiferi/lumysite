import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export default function MenuEditor({ businessId }: { businessId: string }) {
  const queryClient = useQueryClient();
  const { data: menu } = useQuery({
    queryKey: ['menu', businessId],
    queryFn: async () => {
      const { data } = await supabase.from('menu').select('*').eq('business_id', businessId).maybeSingle();
      return data;
    },
  });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (menu) {
      setTitle(menu.title || '');
      setContent(menu.content || '');
      setPdfUrl(menu.pdf_url || '');
    }
  }, [menu]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['menu', businessId] });
    queryClient.invalidateQueries({ queryKey: ['ownerBusiness'] });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (menu) {
        const { error } = await supabase.from('menu').update({ title, content, pdf_url: pdfUrl }).eq('id', menu.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('menu').insert({ business_id: businessId, title, content, pdf_url: pdfUrl });
        if (error) throw error;
      }
      invalidate();
      toast({ title: 'Meny sparad' });
    } catch (err: any) {
      toast({ title: 'Fel vid sparning', description: err.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  const handlePdfUpload = async (file: File) => {
    setSaving(true);
    try {
      const path = `${businessId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('menu-pdfs').upload(path, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('menu-pdfs').getPublicUrl(path);
      const newUrl = urlData.publicUrl;
      setPdfUrl(newUrl);

      // Auto-save the PDF URL to database immediately
      if (menu) {
        const { error } = await supabase.from('menu').update({ pdf_url: newUrl }).eq('id', menu.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('menu').insert({ business_id: businessId, title, content, pdf_url: newUrl });
        if (error) throw error;
      }
      invalidate();
      toast({ title: 'PDF uppladdad och sparad' });
    } catch (err: any) {
      toast({ title: 'Fel vid uppladdning', description: err.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleRemovePdf = async () => {
    setPdfUrl('');
    if (menu) {
      await supabase.from('menu').update({ pdf_url: null }).eq('id', menu.id);
      invalidate();
      toast({ title: 'PDF borttagen' });
    }
  };

  return (
    <div className="mt-3 space-y-3 pl-4 border-l-2 border-primary/20">
      <div className="space-y-2">
        <Label>Titel</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="T.ex. Lunchmeny" />
      </div>
      <div className="space-y-2">
        <Label>Menyinnehåll (text)</Label>
        <Textarea value={content} onChange={e => setContent(e.target.value)} rows={4} placeholder="Skriv menyn som text..." />
      </div>
      <div className="space-y-2">
        <Label>Meny-PDF</Label>
        {pdfUrl && (
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
            <span className="text-xs text-green-600 font-medium">✓ PDF sparad</span>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">Öppna PDF</a>
            <Button type="button" variant="ghost" size="sm" className="text-destructive h-6 px-2 text-xs" onClick={handleRemovePdf}>
              Ta bort
            </Button>
          </div>
        )}
        <Input type="file" accept=".pdf" onChange={e => e.target.files?.[0] && handlePdfUpload(e.target.files[0])} />
      </div>
      <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? 'Sparar...' : 'Spara meny'}</Button>
    </div>
  );
}
