import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';
import FocalPointPicker from './FocalPointPicker';
import CharCount from './CharCount';

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
  maxNameLength?: number;
  maxDescLength?: number;
  descRows?: number;
}

export default function ImageItemEditor({
  businessId, table, bucket, nameField, namePlaceholder, descField, descPlaceholder,
  addLabel, dateField, orderField = 'sort_order',
  maxNameLength = 100, maxDescLength = 500, descRows = 3,
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
        const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `${businessId}/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from(bucket).upload(path, imageFile);
        if (uploadError) throw new Error(`Bilduppladdning misslyckades: ${uploadError.message}`);
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
            {item[descField] && <p className="text-xs text-muted-foreground line-clamp-2">{item[descField]}</p>}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(item.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <div className="space-y-2">
        <div className="space-y-1">
          <Input
            placeholder={namePlaceholder}
            value={name}
            maxLength={maxNameLength}
            onChange={e => setName(e.target.value)}
          />
          {name.length > 0 && <CharCount current={name.length} max={maxNameLength} />}
        </div>
        <div className="space-y-1">
          <Textarea
            placeholder={descPlaceholder}
            value={desc}
            maxLength={maxDescLength}
            onChange={e => setDesc(e.target.value)}
            rows={descRows}
          />
          <CharCount current={desc.length} max={maxDescLength} />
        </div>
        {dateField && <Input type="date" value={date} onChange={e => setDate(e.target.value)} />}
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleAdd()} disabled={!name.trim() || uploading}>+ Utan bild</Button>
          <label className={!name.trim() || uploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={!name.trim() || uploading}
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleAdd(file);
                e.target.value = '';
              }}
            />
            <Button size="sm" variant="outline" asChild disabled={!name.trim() || uploading}>
              <span>+ Med bild</span>
            </Button>
          </label>
        </div>
      </div>
    </div>
  );
}
