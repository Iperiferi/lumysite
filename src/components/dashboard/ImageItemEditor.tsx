import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';
import FocalPointPicker from './FocalPointPicker';

type TableName = 'accommodations' | 'experiences' | 'news';

interface Props {
  businessId: string;
  table: TableName;
  bucket: string;
  nameField: string;
  namePlaceholder: string;
  descField: string;
  descPlaceholder: string;
  addLabel: string;
  dateField?: string;
  orderField?: string;
}

export default function ImageItemEditor({
  businessId, table, bucket, nameField, namePlaceholder, descField, descPlaceholder, addLabel, dateField, orderField = 'sort_order',
}: Props) {
  const queryClient = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: [table, businessId],
    queryFn: async () => {
      const { data } = await supabase.from(table).select('*').eq('business_id', businessId).order(orderField as any);
      return data || [];
    },
  });

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editingFocal, setEditingFocal] = useState<string | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [table, businessId] });
  };

  const handleAdd = async (imageFile?: File) => {
    if (!name.trim()) return;
    setUploading(true);
    try {
      let image_url: string | null = null;
      if (imageFile) {
        const path = `${businessId}/${Date.now()}-${imageFile.name}`;
        await supabase.storage.from(bucket).upload(path, imageFile);
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
        image_url = urlData.publicUrl;
      }
      const row: any = { business_id: businessId, [nameField]: name, [descField]: desc, image_url, sort_order: items.length, focal_point: '50% 50%' };
      if (dateField && date) row[dateField] = date;
      await supabase.from(table).insert(row);
      setName(''); setDesc(''); setDate('');
      invalidate();
      toast({ title: `${addLabel} tillagd` });
    } catch (err: any) {
      toast({ title: 'Fel', description: err.message, variant: 'destructive' });
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from(table).delete().eq('id', id);
    invalidate();
    toast({ title: 'Borttagen' });
  };

  const handleFocalChange = async (id: string, focalPoint: string) => {
    await supabase.from(table).update({ focal_point: focalPoint }).eq('id', id);
    invalidate();
  };

  return (
    <div className="mt-3 space-y-3 pl-4 border-l-2 border-primary/20">
      {items.map((item: any) => (
        <div key={item.id} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
          {item.image_url && (
            editingFocal === item.id ? (
              <div className="w-32 space-y-1">
                <FocalPointPicker
                  imageUrl={item.image_url}
                  focalPoint={item.focal_point || '50% 50%'}
                  onChange={(fp) => handleFocalChange(item.id, fp)}
                />
                <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setEditingFocal(null)}>Klar</Button>
              </div>
            ) : (
              <img
                src={item.image_url}
                alt=""
                className="w-16 h-12 object-cover rounded cursor-pointer"
                style={{ objectPosition: item.focal_point || '50% 50%' }}
                onClick={() => setEditingFocal(item.id)}
                title="Klicka för att ändra fokuspunkt"
              />
            )
          )}
          <div className="flex-1">
            <p className="font-medium text-sm">{item[nameField]}</p>
            {dateField && item[dateField] && <p className="text-xs text-muted-foreground">{item[dateField]}</p>}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(item.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <div className="space-y-2">
        <Input placeholder={namePlaceholder} value={name} onChange={e => setName(e.target.value)} />
        <Textarea placeholder={descPlaceholder} value={desc} onChange={e => setDesc(e.target.value)} rows={2} />
        {dateField && <Input type="date" value={date} onChange={e => setDate(e.target.value)} />}
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleAdd()} disabled={!name.trim() || uploading}>+ Utan bild</Button>
          <Button size="sm" variant="outline" disabled={!name.trim() || uploading} onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) handleAdd(file);
            };
            input.click();
          }}>+ Med bild</Button>
        </div>
      </div>
    </div>
  );
}
