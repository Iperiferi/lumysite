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
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) return;

    try {
      const { error } = await supabase.from('services').insert({
        business_id: businessId,
        name: trimmedName,
        description: trimmedDescription || null,
        sort_order: items.length,
      });

      if (error) throw error;

      setName('');
      setDescription('');
      invalidate();
      toast({ title: 'Tjänst tillagd' });
    } catch (err: any) {
      toast({ title: 'Fel', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;

      invalidate();
      toast({ title: 'Tjänst borttagen' });
    } catch (err: any) {
      toast({ title: 'Fel', description: err.message, variant: 'destructive' });
    }
  };

  const hasDraft = !!name.trim() || !!description.trim();

  return (
    <div
      className="mt-3 space-y-3 pl-4 border-l-2 border-primary/20"
      data-inline-dirty={hasDraft ? 'true' : 'false'}
      data-inline-dirty-label="tjänst"
    >
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
        <p className="text-xs text-muted-foreground">Tjänsten sparas först när du klickar på “+ Lägg till tjänst”.</p>
        <Button size="sm" onClick={handleAdd} disabled={!name.trim()}>+ Lägg till tjänst</Button>
      </div>
    </div>
  );
}
