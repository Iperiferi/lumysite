import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Trash2 } from 'lucide-react';
import FocalPointPicker from './FocalPointPicker';

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
  const [editingFocal, setEditingFocal] = useState<string | null>(null);

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
          focal_point: '50% 50%',
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

  const handleFocalChange = async (id: string, focalPoint: string) => {
    await supabase.from('gallery_images').update({ focal_point: focalPoint }).eq('id', id);
    invalidate();
  };

  const handleAltTextChange = async (id: string, altText: string) => {
    await supabase.from('gallery_images').update({ alt_text: altText }).eq('id', id);
    invalidate();
  };

  return (
    <div className="mt-3 space-y-3 pl-4 border-l-2 border-primary/20">
      <p className="text-xs text-muted-foreground">
        💡 Bildbeskrivningar är frivilliga men hjälper sökmotorer att förstå dina bilder och gör sidan tillgänglig för synskadade besökare.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map(item => (
          <div key={item.id} className="relative group space-y-1">
            {editingFocal === item.id ? (
              <div className="space-y-1">
                <FocalPointPicker
                  imageUrl={item.image_url}
                  focalPoint={item.focal_point || '50% 50%'}
                  onChange={(fp) => handleFocalChange(item.id, fp)}
                  className="w-full"
                />
                <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setEditingFocal(null)}>Klar</Button>
              </div>
            ) : (
              <>
                <img
                  src={item.image_url}
                  alt={item.alt_text || ''}
                  className="w-full h-24 object-cover rounded cursor-pointer"
                  style={{ objectPosition: item.focal_point || '50% 50%' }}
                  onClick={() => setEditingFocal(item.id)}
                  title="Klicka för att ändra fokuspunkt"
                />
                <Button variant="destructive" size="icon" className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </>
            )}
            <Input
              placeholder="Bildbeskrivning (alt-text)"
              defaultValue={item.alt_text || ''}
              onBlur={e => handleAltTextChange(item.id, e.target.value)}
              className="text-xs h-7"
            />
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
