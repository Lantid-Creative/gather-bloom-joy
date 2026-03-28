import cityLagos from "@/assets/city-lagos.jpg";
import cityNairobi from "@/assets/city-nairobi.jpg";
import cityAccra from "@/assets/city-accra.jpg";
import cityJohannesburg from "@/assets/city-johannesburg.jpg";
import cityCapeTown from "@/assets/city-capetown.jpg";
import cityDarEsSalaam from "@/assets/city-daressalaam.jpg";
import cityMiami from "@/assets/city-miami.jpg";

const destinations = [
  { name: "Lagos", image: cityLagos },
  { name: "Nairobi", image: cityNairobi },
  { name: "Accra", image: cityAccra },
  { name: "Johannesburg", image: cityJohannesburg },
  { name: "Cape Town", image: cityCapeTown },
  { name: "Dar es Salaam", image: cityDarEsSalaam },
  { name: "Kigali", image: cityMiami },
];

const DestinationCards = () => {
  return (
    <section className="py-10">
      <h2 className="text-2xl font-bold mb-6">Top destinations in Africa</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {destinations.map((dest) => (
          <button
            key={dest.name}
            className="group relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer"
          >
            <img
              src={dest.image}
              alt={dest.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
              width={640}
              height={512}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-sm font-bold text-primary-foreground">{dest.name}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default DestinationCards;
