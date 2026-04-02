import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

export default function ServicesEditor({ businessId }: { businessId: string }) {
  const queryClient = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ['services', businessId],
    queryFn: async () => {
      const { data } = await supabase.from('services').select('*').eq('business_id', businessId).order('sort_order');
      return data || [];
    },
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['services', businessId] });
    queryClient.invalidateQueries({ queryKey: ['ownerBusiness'] });
  };

  const handleAdd = async () => {
    if (!name.trim()) return;
    await supabase.from('services').insert({ business_id: businessId, name, description, sort_order: items.length });
    setName(''); setDescription('');
    invalidate();
    toast({ title: 'Tjänst tillagd' });
  };

  const handleDelete = async (id: string) => {
    await supabase.from('services').delete().eq('id', id);
    invalidate();
    toast({ title: 'Tjänst borttagen' });
  };

  return (
    <div className="mt-3 space-y-3 pl-4 border-l-2 border-primary/20">
      {items.map(item => (
        <div key={item.id} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
          <div className="flex-1">
            <p className="font-medium text-sm">{item.name}</p>
            {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(item.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <div className="space-y-2">
        <Input placeholder="Namn på tjänst" value={name} onChange={e => setName(e.target.value)} />
        <Textarea placeholder="Beskrivning (valfritt)" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
        <Button size="sm" onClick={handleAdd} disabled={!name.trim()}>+ Lägg till tjänst</Button>
      </div>
    </div>
  );
}
