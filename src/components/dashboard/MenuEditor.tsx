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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (menu) {
      setTitle(menu.title || '');
      setContent(menu.content || '');
    }
  }, [menu]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['menu', businessId] });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (menu) {
        const { error } = await supabase.from('menu').update({ title, content }).eq('id', menu.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('menu').insert({ business_id: businessId, title, content });
        if (error) throw error;
      }
      invalidate();
      toast({ title: 'Meny sparad' });
    } catch (err: any) {
      toast({ title: 'Fel vid sparning', description: err.message, variant: 'destructive' });
    }
    setSaving(false);
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
      <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? 'Sparar...' : 'Spara meny'}</Button>
    </div>
  );
}
