import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function DashboardTestimonials() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: testimonials = [] } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: () => base44.entities.Testimonial.list("-created_date"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Testimonial.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      toast({ title: "Depoimento atualizado!" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Testimonial.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Depoimentos</h1>

      <div className="space-y-3">
        {testimonials.map((t) => (
          <Card key={t.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold">{t.client_name}</p>
                    <Badge className={t.is_approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {t.is_approved ? "Aprovado" : "Pendente"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < t.rating ? "fill-[hsl(38,50%,55%)] text-[hsl(38,50%,55%)]" : "text-gray-200"}`} />
                    ))}
                  </div>
                  <p className="text-gray-600 italic">"{t.text}"</p>
                  {t.service_name && <p className="text-sm text-gray-500 mt-1">{t.service_name}</p>}
                </div>
                <div className="flex gap-1">
                  {!t.is_approved && (
                    <Button variant="ghost" size="icon" onClick={() => updateMutation.mutate({ id: t.id, data: { is_approved: true } })}>
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </Button>
                  )}
                  {t.is_approved && (
                    <Button variant="ghost" size="icon" onClick={() => updateMutation.mutate({ id: t.id, data: { is_approved: false } })}>
                      <XCircle className="w-5 h-5 text-yellow-600" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(t.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {testimonials.length === 0 && (
          <p className="text-gray-500 text-center py-20">Nenhum depoimento recebido.</p>
        )}
      </div>
    </div>
  );
}