import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const emptyItem = { title: "", service_name: "", before_image_url: "", after_image_url: "", description: "", is_published: true };

export default function DashboardGallery() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyItem);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: gallery = [] } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: () => base44.entities.GalleryItem.list("-created_date"),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing
      ? base44.entities.GalleryItem.update(editing.id, data)
      : base44.entities.GalleryItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      setOpen(false);
      toast({ title: editing ? "Item atualizado!" : "Item adicionado!" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.GalleryItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-gallery"] }),
  });

  const openEdit = (item) => { setEditing(item); setForm({ ...emptyItem, ...item }); setOpen(true); };
  const openNew = () => { setEditing(null); setForm(emptyItem); setOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Galeria Antes e Depois</h1>
        <Button onClick={openNew} className="bg-[hsl(350,35%,45%)] hover:bg-[hsl(350,35%,38%)] text-white rounded-full">
          <Plus className="w-4 h-4 mr-2" /> Adicionar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gallery.map((item) => (
          <Card key={item.id} className={!item.is_published ? "opacity-50" : ""}>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 h-40">
                <img src={item.before_image_url} alt="Antes" className="w-full h-full object-cover rounded-tl-lg" />
                <img src={item.after_image_url} alt="Depois" className="w-full h-full object-cover rounded-tr-lg" />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{item.title}</p>
                  {item.service_name && <p className="text-sm text-gray-500">{item.service_name}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(item.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Item" : "Novo Item"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
            <div><Label>Título</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div><Label>Serviço</Label><Input value={form.service_name} onChange={(e) => setForm({ ...form, service_name: e.target.value })} /></div>
            <div><Label>URL Imagem Antes</Label><Input value={form.before_image_url} onChange={(e) => setForm({ ...form, before_image_url: e.target.value })} required /></div>
            <div><Label>URL Imagem Depois</Label><Input value={form.after_image_url} onChange={(e) => setForm({ ...form, after_image_url: e.target.value })} required /></div>
            <div><Label>Descrição</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} /><Label>Publicado</Label></div>
            <Button type="submit" disabled={saveMutation.isPending} className="w-full bg-[hsl(350,35%,45%)] hover:bg-[hsl(350,35%,38%)] text-white">
              {saveMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}