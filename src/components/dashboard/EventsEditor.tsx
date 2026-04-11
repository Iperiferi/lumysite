import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';
import FocalPointPicker from './FocalPointPicker';

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
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editingFocal, setEditingFocal] = useState<string | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['events', businessId] });
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
        business_id: businessId,
        title,
        description,
        event_date: eventDate || null,
        event_end_date: eventEndDate || null,
        event_time: eventTime || null,
        event_end_time: eventEndTime || null,
        image_url,
        sort_order: items.length,
        focal_point: '50% 50%',
      });
      setTitle(''); setDescription(''); setEventDate(''); setEventEndDate(''); setEventTime(''); setEventEndTime('');
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

  const handleFocalChange = async (id: string, focalPoint: string) => {
    await supabase.from('events').update({ focal_point: focalPoint }).eq('id', id);
    invalidate();
  };

  const formatEventDate = (item: any) => {
    const parts: string[] = [];
    if (item.event_date) {
      parts.push(item.event_date);
      if (item.event_end_date && item.event_end_date !== item.event_date) {
        parts[0] = `${item.event_date} – ${item.event_end_date}`;
      }
    }
    if (item.event_time) {
      let timeStr = item.event_time.substring(0, 5);
      if (item.event_end_time) {
        timeStr += ` – ${item.event_end_time.substring(0, 5)}`;
      }
      parts.push(timeStr);
    }
    return parts.join(', ');
  };

  return (
    <div className="mt-3 space-y-3 pl-4 border-l-2 border-primary/20">
      {items.map(item => (
        <div key={item.id} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
          {item.image_url && (
            editingFocal === item.id ? (
              <div className="w-32 space-y-1">
                <FocalPointPicker
                  imageUrl={item.image_url}
                  focalPoint={(item as any).focal_point || '50% 50%'}
                  onChange={(fp) => handleFocalChange(item.id, fp)}
                />
                <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setEditingFocal(null)}>Klar</Button>
              </div>
            ) : (
              <img
                src={item.image_url}
                alt=""
                className="w-16 h-12 object-cover rounded cursor-pointer"
                style={{ objectPosition: (item as any).focal_point || '50% 50%' }}
                onClick={() => setEditingFocal(item.id)}
                title="Klicka för att ändra fokuspunkt"
              />
            )
          )}
          <div className="flex-1">
            <p className="font-medium text-sm">{item.title}</p>
            {formatEventDate(item) && <p className="text-xs text-muted-foreground">{formatEventDate(item)}</p>}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(item.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <div className="space-y-2">
        <Input placeholder="Titel" value={title} onChange={e => setTitle(e.target.value)} />
        <Textarea placeholder="Beskrivning (valfritt)" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Startdatum</Label>
            <Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Slutdatum</Label>
            <Input type="date" value={eventEndDate} onChange={e => setEventEndDate(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Starttid (valfritt)</Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="HH:MM"
              maxLength={5}
              value={eventTime}
              onChange={e => {
                let v = e.target.value.replace(/[^0-9:]/g, '');
                if (v.length === 2 && !v.includes(':') && eventTime.length === 1) v = v + ':';
                setEventTime(v);
              }}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Sluttid (valfritt)</Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="HH:MM"
              maxLength={5}
              value={eventEndTime}
              onChange={e => {
                let v = e.target.value.replace(/[^0-9:]/g, '');
                if (v.length === 2 && !v.includes(':') && eventEndTime.length === 1) v = v + ':';
                setEventEndTime(v);
              }}
            />
          </div>
        </div>
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
