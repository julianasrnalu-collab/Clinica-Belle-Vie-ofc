import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default function DashboardClients() {
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClientsAndStats = async () => {
      try {
        // Fetch clients from profiles
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'client')
          .order('full_name');
          
        if (usersError) throw usersError;

        // Fetch completed appointments for stats
        const { data: appts, error: apptsError } = await supabase
          .from('appointments')
          .select('client_id, price')
          .eq('status', 'completed');
          
        if (apptsError) throw apptsError;

        setClients(users || []);
        setAppointments(appts || []);
      } catch (err) {
        console.error("Erro ao carregar clientes:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClientsAndStats();
  }, []);

  const getClientStats = (clientId) => {
    const clientAppts = appointments.filter((a) => a.client_id === clientId);
    const totalSpent = clientAppts.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
    return { count: clientAppts.length, totalSpent };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Carteira de Clientes</h1>
        <p className="text-gray-500 text-sm">Acompanhe o histórico e consumo dos seus clientes.</p>
      </div>

      <Card className="border-gray-100 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-[hsl(350,35%,45%)] rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-600">Cliente</TableHead>
                    <TableHead className="font-semibold text-gray-600">Contato</TableHead>
                    <TableHead className="font-semibold text-gray-600 text-center">Nº Atendimentos</TableHead>
                    <TableHead className="font-semibold text-gray-600 text-right">Total Gasto</TableHead>
                    <TableHead className="font-semibold text-gray-600">Fidelidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((c) => {
                    const stats = getClientStats(c.id);
                    return (
                      <TableRow key={c.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-medium text-gray-900">
                          {c.full_name}
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {c.phone || "Sem telefone"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-medium">
                            {stats.count}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-right text-[hsl(350,35%,45%)]">
                          R$ {stats.totalSpent.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-[hsl(38,50%,55%)] text-white hover:bg-[hsl(38,50%,50%)] text-xs font-normal">
                            {c.loyalty_points || 0} pts
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {clients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-16">
                        Nenhum cliente cadastrado ainda.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}