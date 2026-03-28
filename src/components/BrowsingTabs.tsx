interface BrowsingTabsProps {
  active: string;
  onChange: (tab: string) => void;
}

const tabs = ["All", "For you", "Today", "This weekend"];

const BrowsingTabs = ({ active, onChange }: BrowsingTabsProps) => {
  return (
    <div className="flex gap-4 border-b">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            active === tab
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab}
          {active === tab && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
};

export default BrowsingTabs;
