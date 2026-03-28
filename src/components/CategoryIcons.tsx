import { Music, Globe2, Palette, CalendarHeart, Heart, Gamepad2, Briefcase, UtensilsCrossed } from "lucide-react";

const categories = [
  { icon: Music, label: "Music" },
  { icon: Globe2, label: "Nightlife" },
  { icon: Palette, label: "Performing & Visual Arts" },
  { icon: CalendarHeart, label: "Festivals" },
  { icon: Heart, label: "Culture" },
  { icon: Gamepad2, label: "Hobbies" },
  { icon: Briefcase, label: "Business" },
  { icon: UtensilsCrossed, label: "Food & Drink" },
];

interface CategoryIconsProps {
  onSelect: (cat: string) => void;
  active: string;
}

const CategoryIcons = ({ onSelect, active }: CategoryIconsProps) => {
  return (
    <div className="flex justify-center gap-4 md:gap-8 flex-wrap py-8">
      {categories.map(({ icon: Icon, label }) => (
        <button
          key={label}
          onClick={() => onSelect(label)}
          className={`flex flex-col items-center gap-2 group cursor-pointer transition-all ${
            active === label ? "opacity-100" : "opacity-70 hover:opacity-100"
          }`}
        >
          <div
            className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-2 flex items-center justify-center transition-all ${
              active === label
                ? "border-primary bg-primary/5"
                : "border-border group-hover:border-primary/50"
            }`}
          >
            <Icon className={`h-6 w-6 md:h-7 md:w-7 transition-colors ${
              active === label ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            }`} />
          </div>
          <span className={`text-xs md:text-sm font-medium text-center max-w-[80px] leading-tight ${
            active === label ? "text-foreground" : "text-muted-foreground"
          }`}>
            {label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default CategoryIcons;
