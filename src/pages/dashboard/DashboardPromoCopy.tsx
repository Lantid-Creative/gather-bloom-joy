import AiPromoCopyGenerator from "@/components/AiPromoCopyGenerator";
import { useDashboardData } from "@/hooks/useDashboardData";

const DashboardPromoCopy = () => {
  const { events } = useDashboardData();

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">AI Promo Copy Generator</h2>
      <AiPromoCopyGenerator events={events?.map((e) => ({ id: e.id, title: e.title, description: e.description, date: e.date, location: e.location })) ?? []} />
    </div>
  );
};

export default DashboardPromoCopy;
