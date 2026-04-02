import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

export default function EventsEditor({ businessId }: { businessId: string }) {
  const queryClient = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ['events', businessId],
    queryFn: async () => {
      const { data } = await supabase.from('events').select('*').eq('business_id', businessId).order('event_date');
      return data || [];
    },
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [uploading, setUploading] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['events', businessId] });
    queryClient.invalidateQueries({ queryKey: ['ownerBusiness'] });
  };

  const handleAdd = async (imageFile?: File) => {
    if (!title.trim()) return;
    setUploading(true);
    try {
      let image_url: string | null = null;
      if (imageFile) {
        const path = `${businessId}/${Date.now()}-${imageFile.name}`;
        await supabase.storage.from('event-images').upload(path, imageFile);
        const { data: urlData } = supabase.storage.from('event-images').getPublicUrl(path);
        image_url = urlData.publicUrl;
      }
      await supabase.from('events').insert({
        business_id: businessId, title, description, event_date: eventDate || null, image_url, sort_order: items.length,
      });
      setTitle(''); setDescription(''); setEventDate('');
      invalidate();
      toast({ title: 'Evenemang tillagt' });
    } catch (err: any) {
      toast({ title: 'Fel', description: err.message, variant: 'destructive' });
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('events').delete().eq('id', id);
    invalidate();
    toast({ title: 'Evenemang borttaget' });
  };

  return (
    <div className="mt-3 space-y-3 pl-4 border-l-2 border-primary/20">
      {items.map(item => (
        <div key={item.id} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
          {item.image_url && <img src={item.image_url} alt="" className="w-16 h-12 object-cover rounded" />}
          <div className="flex-1">
            <p className="font-medium text-sm">{item.title}</p>
            {item.event_date && <p className="text-xs text-muted-foreground">{item.event_date}</p>}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(item.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <div className="space-y-2">
        <Input placeholder="Titel" value={title} onChange={e => setTitle(e.target.value)} />
        <Textarea placeholder="Beskrivning (valfritt)" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
        <Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleAdd()} disabled={!title.trim() || uploading}>+ Utan bild</Button>
          <label className="cursor-pointer">
            <Input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleAdd(e.target.files[0])} />
            <Button size="sm" variant="outline" asChild disabled={!title.trim() || uploading}><span>+ Med bild</span></Button>
          </label>
        </div>
      </div>
    </div>
  );
}
