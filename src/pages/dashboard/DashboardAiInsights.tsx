import AiSalesInsights from "@/components/AiSalesInsights";
import { useDashboardData } from "@/hooks/useDashboardData";

const DashboardAiInsights = () => {
  const { eventStats, totalRevenue, totalTickets, totalOrders } = useDashboardData();

  if (eventStats.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>Create events and make some sales to unlock AI insights.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">AI Sales Insights</h2>
      <AiSalesInsights
        events={eventStats.map((s) => ({ title: s.event.title, revenue: s.revenue, tickets: s.tickets, date: s.event.date }))}
        totalRevenue={totalRevenue}
        totalTickets={totalTickets}
        totalOrders={totalOrders}
      />
    </div>
  );
};

export default DashboardAiInsights;
