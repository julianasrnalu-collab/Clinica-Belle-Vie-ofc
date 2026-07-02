import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, MailOpen, Phone } from "lucide-react";
import { format } from "date-fns";

export default function DashboardMessages() {
  const queryClient = useQueryClient();
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: () => base44.entities.ContactMessage.list("-created_date", 100),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.ContactMessage.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-messages"] }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mensagens de Contato</h1>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-[hsl(350,35%,45%)] rounded-full animate-spin" />
        </div>
      ) : messages.length > 0 ? (
        <div className="space-y-3">
          {messages.map((msg) => (
            <Card key={msg.id} className={msg.is_read ? "opacity-70" : ""}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[hsl(350,35%,45%)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {msg.is_read ? <MailOpen className="w-4 h-4 text-gray-400" /> : <Mail className="w-4 h-4 text-[hsl(350,35%,45%)]" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{msg.name}</p>
                        {!msg.is_read && <Badge className="bg-[hsl(350,35%,45%)] text-white text-xs">Nova</Badge>}
                      </div>
                      <p className="text-sm text-gray-500">{msg.email}</p>
                      {msg.phone && <p className="text-sm text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{msg.phone}</p>}
                      <p className="text-gray-700 mt-2">{msg.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {msg.created_date && format(new Date(msg.created_date), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                  </div>
                  {!msg.is_read && (
                    <Button variant="ghost" size="sm" onClick={() => markReadMutation.mutate(msg.id)}>
                      Marcar como lida
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-20">Nenhuma mensagem recebida.</p>
      )}
    </div>
  );
}