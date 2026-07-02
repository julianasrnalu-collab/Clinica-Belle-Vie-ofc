import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, TrendingUp, DollarSign, Users } from "lucide-react";

const COLORS = ['#d18d8e', '#e3a8a9', '#f2c6c7', '#d4a373', '#e9c46a', '#2a9d8f', '#264653', '#e76f51'];

export default function DashboardReports() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly"); // daily, weekly, monthly, annual

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select(`*, professional:professional_id(full_name)`)
          .eq('status', 'completed'); // Only completed for financial/volume reports

        if (error) throw error;
        setAppointments(data || []);
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Filter Data based on selected period
  const filteredData = useMemo(() => {
    const now = new Date();
    return appointments.filter(appt => {
      const apptDate = parseISO(appt.date);
      if (period === 'daily') return isWithinInterval(apptDate, { start: subDays(now, 14), end: now });
      if (period === 'weekly') return isWithinInterval(apptDate, { start: subDays(now, 56), end: now });
      if (period === 'monthly') return isWithinInterval(apptDate, { start: startOfYear(now), end: endOfYear(now) });
      return true; // Annual (all time for demo)
    });
  }, [appointments, period]);

  // KPIs
  const totalRevenue = filteredData.reduce((sum, a) => sum + Number(a.price || 0), 0);
  const totalVolume = filteredData.length;
  
  // Timeline Chart Data (Revenue and Volume)
  const timelineDataMap = {};
  filteredData.forEach(appt => {
    const apptDate = parseISO(appt.date);
    let key = "";
    if (period === 'daily') key = format(apptDate, "dd/MM");
    if (period === 'weekly') key = `Semana ${format(startOfWeek(apptDate), "dd/MM")}`;
    if (period === 'monthly') key = format(apptDate, "MMM/yyyy", { locale: ptBR });
    if (period === 'annual') key = format(apptDate, "yyyy");

    if (!timelineDataMap[key]) timelineDataMap[key] = { name: key, Receita: 0, Volume: 0 };
    timelineDataMap[key].Receita += Number(appt.price || 0);
    timelineDataMap[key].Volume += 1;
  });
  // Simplified chronological sorting by using the ISO date string of the first entry in that group would be better, but for demo keys usually suffice if generated sequentially.
  const timelineData = Object.values(timelineDataMap);

  // Top Selling Services Data
  const serviceCounts = filteredData.reduce((acc, a) => {
    acc[a.service_name] = (acc[a.service_name] || 0) + 1;
    return acc;
  }, {});
  const serviceData = Object.keys(serviceCounts).map(k => ({ name: k, value: serviceCounts[k] })).sort((a,b) => b.value - a.value).slice(0, 5);

  // Individual Professional Performance
  const proCounts = filteredData.reduce((acc, a) => {
    const name = a.professional?.full_name || "Desconhecido";
    if (!acc[name]) acc[name] = { name, Receita: 0, Atendimentos: 0 };
    acc[name].Receita += Number(a.price || 0);
    acc[name].Atendimentos += 1;
    return acc;
  }, {});
  const proData = Object.values(proCounts).sort((a,b) => b.Receita - a.Receita);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios Gerenciais</h1>
          <p className="text-gray-500 text-sm">Visão analítica completa do desempenho da clínica.</p>
        </div>
        <div className="w-full sm:w-48 bg-white rounded-lg shadow-sm">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Últimos 14 Dias (Diário)</SelectItem>
              <SelectItem value="weekly">Últimas 8 Semanas (Semanal)</SelectItem>
              <SelectItem value="monthly">Este Ano (Mensal)</SelectItem>
              <SelectItem value="annual">Todo Período (Anual)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-[hsl(350,35%,45%)] rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Quick KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Receita Total do Período</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">R$ {totalRevenue.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Volume de Atendimentos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{totalVolume}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Timeline Revenue Chart */}
            <Card className="border-gray-100 shadow-sm col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Faturamento e Volume no Tempo</CardTitle>
                <CardDescription>Evolução da receita financeira e quantidade de atendimentos no período selecionado.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full">
                  {timelineData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timelineData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                        <Line yAxisId="left" type="monotone" dataKey="Receita" stroke="hsl(350,35%,45%)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line yAxisId="right" type="monotone" dataKey="Volume" stroke="#2a9d8f" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">Sem dados para o período.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Services Pie Chart */}
            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Serviços Mais Vendidos</CardTitle>
                <CardDescription>Top 5 procedimentos com maior saída.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {serviceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={serviceData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value">
                          {serviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">Sem dados para o período.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Professional Performance Bar Chart */}
            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Desempenho da Equipe</CardTitle>
                <CardDescription>Receita gerada individualmente por profissional.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                  {proData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={proData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                        <XAxis type="number" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#333', fontWeight: 500 }} axisLine={false} tickLine={false} width={100} />
                        <Tooltip 
                          cursor={{ fill: 'rgba(209, 141, 142, 0.05)' }} 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          formatter={(value, name) => [name === 'Receita' ? `R$ ${value.toFixed(2)}` : value, name]}
                        />
                        <Bar dataKey="Receita" fill="hsl(38,50%,55%)" radius={[0, 4, 4, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">Sem dados para o período.</div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </>
      )}
    </div>
  );
}