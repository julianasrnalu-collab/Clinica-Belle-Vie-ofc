import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, Users, DollarSign, TrendingUp, Scissors, Star } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend 
} from "recharts";

const COLORS = ['#d18d8e', '#e3a8a9', '#f2c6c7', '#d4a373', '#e9c46a', '#2a9d8f'];

function StatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-sm`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.profile?.role || "client";
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly"); // daily, weekly, monthly, annual

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        let query = supabase.from('appointments').select('*');
        if (role === 'employee') query = query.eq('professional_id', user.id);
        if (role === 'client') query = query.eq('client_id', user.id);

        const { data, error } = await query;
        if (error) throw error;
        setAppointments(data || []);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) fetchDashboardData();
  }, [user, role]);

  // --- KPI Calculations (All Time or based on fetched dataset) ---
  const completedAppts = appointments.filter(a => a.status === 'completed');
  const totalRevenue = completedAppts.reduce((sum, a) => sum + Number(a.price), 0);
  const uniqueClients = new Set(appointments.map(a => a.client_id)).size;
  
  // Most performed service
  const serviceCounts = completedAppts.reduce((acc, a) => {
    acc[a.service_name] = (acc[a.service_name] || 0) + 1;
    return acc;
  }, {});
  const mostPerformedService = Object.keys(serviceCounts).length > 0 
    ? Object.keys(serviceCounts).reduce((a, b) => serviceCounts[a] > serviceCounts[b] ? a : b)
    : "N/A";

  // --- Chart Data Formatting based on Period ---
  const now = new Date();
  
  // Filter appointments for the Sales Chart based on selected period
  const filteredSalesData = completedAppts.filter(appt => {
    const apptDate = new Date(appt.date + "T00:00:00");
    if (period === 'daily') return isWithinInterval(apptDate, { start: subDays(now, 7), end: now });
    if (period === 'weekly') return isWithinInterval(apptDate, { start: subDays(now, 28), end: now });
    if (period === 'monthly') return isWithinInterval(apptDate, { start: startOfYear(now), end: endOfYear(now) });
    if (period === 'annual') return true; // Show all years
    return true;
  });

  // Group Sales Data for Bar Chart
  const salesChartDataMap = {};
  filteredSalesData.forEach(appt => {
    const apptDate = new Date(appt.date + "T00:00:00");
    let key = "";
    if (period === 'daily') key = format(apptDate, "dd/MM");
    if (period === 'weekly') key = `Semana ${format(startOfWeek(apptDate), "dd/MM")}`;
    if (period === 'monthly') key = format(apptDate, "MMM/yyyy", { locale: ptBR });
    if (period === 'annual') key = format(apptDate, "yyyy");
    
    if (!salesChartDataMap[key]) salesChartDataMap[key] = { name: key, Receita: 0 };
    salesChartDataMap[key].Receita += Number(appt.price);
  });
  
  // Convert map to array and sort chronologically (this is simplified sorting for demo)
  const salesChartData = Object.values(salesChartDataMap);

  // Group Category Data for Pie Chart (All completed appointments)
  const pieChartData = Object.keys(serviceCounts).map(key => ({
    name: key,
    value: serviceCounts[key]
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-[hsl(350,35%,45%)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">
          Olá, {user?.profile?.full_name?.split(" ")[0] || "Usuário"}
        </h1>
        <p className="text-gray-500 mt-1">
          {format(now, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Atendimentos (Total)" 
          value={appointments.length} 
          icon={Calendar} 
          color="bg-[hsl(350,35%,45%)]" 
        />
        {(role === 'admin' || role === 'employee') && (
          <StatCard 
            title="Receita Gerada" 
            value={`R$ ${totalRevenue.toFixed(0)}`} 
            icon={DollarSign} 
            color="bg-emerald-500" 
          />
        )}
        <StatCard 
          title="Clientes Atendidos" 
          value={uniqueClients} 
          icon={Users} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Serviço Destaque" 
          value={mostPerformedService} 
          subtitle="Mais realizado"
          icon={Star} 
          color="bg-amber-500" 
        />
      </div>

      {/* Charts Section */}
      {(role === 'admin' || role === 'employee') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sales Bar Chart */}
          <Card className="lg:col-span-2 border-gray-100 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Faturamento por Período</CardTitle>
                <CardDescription>Receita gerada em procedimentos concluídos.</CardDescription>
              </div>
              <div className="mt-4 sm:mt-0 w-40">
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Últimos 7 Dias</SelectItem>
                    <SelectItem value="weekly">Últimas 4 Semanas</SelectItem>
                    <SelectItem value="monthly">Mensal (Este Ano)</SelectItem>
                    <SelectItem value="annual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                {salesChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(209, 141, 142, 0.05)' }} 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                      />
                      <Bar dataKey="Receita" fill="hsl(350,35%,45%)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    Não há dados financeiros para este período.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Volume Pie Chart */}
          <Card className="lg:col-span-1 border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Volume por Procedimento</CardTitle>
              <CardDescription>Distribuição de serviços realizados.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    Nenhum serviço realizado.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}