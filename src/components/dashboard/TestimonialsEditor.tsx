import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

export default function TestimonialsEditor({ businessId }: { businessId: string }) {
  const queryClient = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ['testimonials', businessId],
    queryFn: async () => {
      const { data } = await supabase.from('testimonials').select('*').eq('business_id', businessId).order('sort_order');
      return data || [];
    },
  });

  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['testimonials', businessId] });
  };

  const handleAdd = async () => {
    if (!authorName.trim() || !content.trim()) return;
    await supabase.from('testimonials').insert({ business_id: businessId, author_name: authorName, content, sort_order: items.length });
    setAuthorName(''); setContent('');
    invalidate();
    toast({ title: 'Omdöme tillagt' });
  };

  const handleDelete = async (id: string) => {
    await supabase.from('testimonials').delete().eq('id', id);
    invalidate();
    toast({ title: 'Omdöme borttaget' });
  };

  return (
    <div className="mt-3 space-y-3 pl-4 border-l-2 border-primary/20">
      {items.map(item => (
        <div key={item.id} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
          <div className="flex-1">
            <p className="text-sm italic">"{item.content}"</p>
            <p className="text-xs text-muted-foreground mt-1">— {item.author_name}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(item.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <div className="space-y-2">
        <Input placeholder="Författarens namn" value={authorName} onChange={e => setAuthorName(e.target.value)} />
        <Textarea placeholder="Omdöme" value={content} onChange={e => setContent(e.target.value)} rows={2} />
        <Button size="sm" onClick={handleAdd} disabled={!authorName.trim() || !content.trim()}>+ Lägg till omdöme</Button>
      </div>
    </div>
  );
}
