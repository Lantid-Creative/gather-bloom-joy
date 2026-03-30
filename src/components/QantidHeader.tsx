import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, MapPin, Menu, X, User, LogOut, ShoppingCart, Heart, ChevronDown, Ticket, CalendarDays, LayoutDashboard, Users, Megaphone, HelpCircle, Handshake } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/lib/cart-store";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";

const DropdownMenu = ({ label, children }: { label: string; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors flex items-center gap-1"
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 w-48 rounded-lg border bg-popover shadow-lg py-1 z-50" onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
};

const DropdownItem = ({ to, icon: Icon, children, onClick }: { to?: string; icon: React.ElementType; children: React.ReactNode; onClick?: () => void }) => {
  const cls = "flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors w-full text-left";
  if (to) return <Link to={to} className={cls}><Icon className="h-4 w-4 text-muted-foreground" />{children}</Link>;
  return <button onClick={onClick} className={cls}><Icon className="h-4 w-4 text-muted-foreground" />{children}</button>;
};

const QantidHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qParam = searchParams.get("q") ?? "";
  const cityParam = searchParams.get("city") ?? "";
  const [searchText, setSearchText] = useState(qParam);
  const [cityText, setCityText] = useState(cityParam);

  useEffect(() => { setSearchText(qParam); }, [qParam]);
  useEffect(() => { setCityText(cityParam); }, [cityParam]);
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchText.trim()) params.set("q", searchText.trim());
    if (cityText.trim()) params.set("city", cityText.trim());
    const qs = params.toString();
    navigate(qs ? `/?${qs}` : "/");
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="container flex h-14 items-center gap-4">
        <Link to="/" className="shrink-0">
          <span className="text-xl font-bold text-primary tracking-tight">qantid</span>
        </Link>

        {/* Search Bar - Desktop */}
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="hidden md:flex items-center flex-1 max-w-2xl">
          <div className="flex items-center flex-1 rounded-full border bg-background overflow-hidden h-10">
            <div className="flex items-center flex-1 px-3 gap-2 border-r">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input type="text" placeholder="Search events" value={searchText} onChange={(e) => setSearchText(e.target.value)} className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            </div>
            <div className="flex items-center flex-1 px-3 gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <input type="text" placeholder="Your City" value={cityText} onChange={(e) => setCityText(e.target.value)} className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            </div>
            <button type="submit" className="h-10 w-10 flex items-center justify-center bg-primary text-primary-foreground rounded-full shrink-0 mr-0.5 hover:bg-primary/90 transition-colors">
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Nav Links - Desktop */}
        <nav className="hidden lg:flex items-center gap-1 ml-auto">
          <Link to="/" className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors">Find Events</Link>
          <Link to="/create-event" className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors">Create Events</Link>

          <DropdownMenu label="Explore">
            <DropdownItem to="/partners" icon={Handshake}>Partners</DropdownItem>
            <DropdownItem to="/influencers" icon={Megaphone}>Influencers</DropdownItem>
            <DropdownItem to="/help" icon={HelpCircle}>Help Center</DropdownItem>
          </DropdownMenu>

          <ThemeToggle />

          <Link to="/checkout" className="relative p-2 rounded-md hover:bg-accent transition-colors">
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{cartCount}</span>
            )}
          </Link>

          {user && <NotificationBell />}

          <div className="w-px h-6 bg-border mx-1" />
          {user ? (
            <DropdownMenu label="Account">
              <DropdownItem to="/profile" icon={User}>Profile</DropdownItem>
              <DropdownItem to="/saved" icon={Heart}>Saved Events</DropdownItem>
              <DropdownItem to="/my-events" icon={CalendarDays}>My Events</DropdownItem>
              <DropdownItem to="/my-tickets" icon={Ticket}>My Tickets</DropdownItem>
              <DropdownItem to="/my-hires" icon={Users}>My Hires</DropdownItem>
              <DropdownItem to="/dashboard" icon={LayoutDashboard}>Dashboard</DropdownItem>
              <div className="border-t my-1" />
              <DropdownItem icon={LogOut} onClick={handleSignOut}>Sign out</DropdownItem>
            </DropdownMenu>
          ) : (
            <Link to="/auth" className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors">Sign in</Link>
          )}
        </nav>

        {/* Mobile */}
        <div className="lg:hidden ml-auto flex items-center gap-2">
          <ThemeToggle />
          {user && <NotificationBell />}
          <Link to="/checkout" className="relative p-2">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{cartCount}</span>
            )}
          </Link>
          <button className="p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="md:hidden px-4 pb-3">
        <div className="flex items-center rounded-full border bg-background overflow-hidden h-10">
          <div className="flex items-center flex-1 px-3 gap-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input type="text" placeholder="Search events" value={searchText} onChange={(e) => setSearchText(e.target.value)} className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>
          <button type="submit" className="h-8 w-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full shrink-0 mr-1">
            <Search className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t bg-background p-4 space-y-1">
          <Link to="/" className="block text-sm font-medium py-2 px-3 rounded-md hover:bg-accent" onClick={() => setMobileOpen(false)}>Find Events</Link>
          <Link to="/create-event" className="block text-sm font-medium py-2 px-3 rounded-md hover:bg-accent" onClick={() => setMobileOpen(false)}>Create Events</Link>
          <Link to="/partners" className="block text-sm font-medium py-2 px-3 rounded-md hover:bg-accent" onClick={() => setMobileOpen(false)}>Partners</Link>
          <Link to="/influencers" className="block text-sm font-medium py-2 px-3 rounded-md hover:bg-accent" onClick={() => setMobileOpen(false)}>Influencers</Link>
          <Link to="/help" className="block text-sm font-medium py-2 px-3 rounded-md hover:bg-accent" onClick={() => setMobileOpen(false)}>Help Center</Link>
          <div className="border-t my-2" />
          {user ? (
            <>
              <Link to="/saved" className="block text-sm font-medium py-2 px-3 rounded-md hover:bg-accent" onClick={() => setMobileOpen(false)}>Saved Events</Link>
              <Link to="/my-events" className="block text-sm font-medium py-2 px-3 rounded-md hover:bg-accent" onClick={() => setMobileOpen(false)}>My Events</Link>
              <Link to="/my-tickets" className="block text-sm font-medium py-2 px-3 rounded-md hover:bg-accent" onClick={() => setMobileOpen(false)}>My Tickets</Link>
              <Link to="/my-hires" className="block text-sm font-medium py-2 px-3 rounded-md hover:bg-accent" onClick={() => setMobileOpen(false)}>My Hires</Link>
              <Link to="/dashboard" className="block text-sm font-medium py-2 px-3 rounded-md hover:bg-accent" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Link to="/profile" className="block text-sm font-medium py-2 px-3 rounded-md hover:bg-accent" onClick={() => setMobileOpen(false)}>My Profile</Link>
              <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="block w-full text-left text-sm font-medium py-2 px-3 rounded-md hover:bg-accent">Sign out</button>
            </>
          ) : (
            <Link to="/auth" className="block text-sm font-medium py-2 px-3 rounded-md hover:bg-accent" onClick={() => setMobileOpen(false)}>Sign in</Link>
          )}
        </div>
      )}
    </header>
  );
};

export default QantidHeader;
