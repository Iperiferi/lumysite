import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

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

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [table, businessId] });
    queryClient.invalidateQueries({ queryKey: ['ownerBusiness'] });
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
      const row: any = { business_id: businessId, [nameField]: name, [descField]: desc, image_url, sort_order: items.length };
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

  return (
    <div className="mt-3 space-y-3 pl-4 border-l-2 border-primary/20">
      {items.map((item: any) => (
        <div key={item.id} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
          {item.image_url && <img src={item.image_url} alt="" className="w-16 h-12 object-cover rounded" />}
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
          <label className="cursor-pointer">
            <Input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleAdd(e.target.files[0])} />
            <Button size="sm" variant="outline" asChild disabled={!name.trim() || uploading}><span>+ Med bild</span></Button>
          </label>
        </div>
      </div>
    </div>
  );
}
