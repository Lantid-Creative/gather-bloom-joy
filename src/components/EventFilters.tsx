import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/mock-data";

interface EventFiltersProps {
  onSearch: (query: string) => void;
  onCategory: (cat: string) => void;
  activeCategory: string;
}

const EventFilters = ({ onSearch, onCategory, activeCategory }: EventFiltersProps) => {
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch(e.target.value);
          }}
          className="pl-10"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "subtle"}
            size="sm"
            onClick={() => onCategory(cat)}
            className="rounded-full"
          >
            {cat}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default EventFilters;
