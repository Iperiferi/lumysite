import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Trash2 } from 'lucide-react';

export default function GalleryEditor({ businessId }: { businessId: string }) {
  const queryClient = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ['gallery', businessId],
    queryFn: async () => {
      const { data } = await supabase.from('gallery_images').select('*').eq('business_id', businessId).order('sort_order');
      return data || [];
    },
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['gallery', businessId] });
    queryClient.invalidateQueries({ queryKey: ['ownerBusiness'] });
  };

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    const total = files.length;
    setUploadProgress({ done: 0, total });

    for (let i = 0; i < total; i++) {
      const file = files[i];
      try {
        const path = `${businessId}/${Date.now()}-${file.name}`;
        await supabase.storage.from('gallery').upload(path, file);
        const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(path);
        await supabase.from('gallery_images').insert({
          business_id: businessId,
          image_url: urlData.publicUrl,
          alt_text: '',
          sort_order: items.length + i,
        });
      } catch (err: any) {
        toast({ title: 'Fel vid uppladdning', description: `${file.name}: ${err.message}`, variant: 'destructive' });
      }
      setUploadProgress({ done: i + 1, total });
    }

    invalidate();
    toast({ title: `${total} bild${total > 1 ? 'er' : ''} tillagd${total > 1 ? 'a' : ''}` });
    setUploading(false);
    setUploadProgress({ done: 0, total: 0 });
  };

  const handleDelete = async (id: string) => {
    await supabase.from('gallery_images').delete().eq('id', id);
    invalidate();
    toast({ title: 'Bild borttagen' });
  };

  return (
    <div className="mt-3 space-y-3 pl-4 border-l-2 border-primary/20">
      <div className="grid grid-cols-4 gap-2">
        {items.map(item => (
          <div key={item.id} className="relative group">
            <img src={item.image_url} alt={item.alt_text || ''} className="w-full h-24 object-cover rounded" />
            <Button variant="destructive" size="icon" className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition" onClick={() => handleDelete(item.id)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Input
          type="file"
          accept="image/*"
          multiple
          disabled={uploading}
          onChange={e => e.target.files?.length && handleFiles(e.target.files)}
        />
        {uploading && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Laddar upp {uploadProgress.done}/{uploadProgress.total}...
            </p>
            <Progress value={(uploadProgress.done / uploadProgress.total) * 100} />
          </div>
        )}
      </div>
    </div>
  );
}
