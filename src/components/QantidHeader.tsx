import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, MapPin, Menu, X, User, LogOut, ShoppingCart, Heart, ChevronDown, Ticket, CalendarDays, LayoutDashboard, Users, Megaphone, HelpCircle, Handshake, Home, PlusCircle, Building2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/lib/cart-store";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import { useLocation } from "react-router-dom";

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
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const qParam = searchParams.get("q") ?? "";
  const cityParam = searchParams.get("city") ?? "";
  const [searchText, setSearchText] = useState(qParam);
  const [cityText, setCityText] = useState(cityParam);

  useEffect(() => { setSearchText(qParam); }, [qParam]);
  useEffect(() => { setCityText(cityParam); }, [cityParam]);
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

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

  // Mobile bottom nav items
  const bottomNavItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "/?focus=search" },
    { icon: PlusCircle, label: "Create", path: "/create-event" },
    { icon: Ticket, label: "Tickets", path: "/my-tickets" },
    { icon: User, label: user ? "Profile" : "Sign in", path: user ? "/profile" : "/auth" },
  ];

  const isBottomNavActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path.split("?")[0]);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
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
                <DropdownItem to="/find-partners" icon={Building2}>Find Partners</DropdownItem>
                <DropdownItem to="/dashboard" icon={LayoutDashboard}>Dashboard</DropdownItem>
                <div className="border-t my-1" />
                <DropdownItem icon={LogOut} onClick={handleSignOut}>Sign out</DropdownItem>
              </DropdownMenu>
            ) : (
              <Link to="/auth" className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors">Sign in</Link>
            )}
          </nav>

          {/* Mobile top-right actions */}
          <div className="lg:hidden ml-auto flex items-center gap-1">
            <ThemeToggle />
            {user && <NotificationBell />}
            <Link to="/checkout" className="relative p-2.5 rounded-lg active:bg-accent">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{cartCount}</span>
              )}
            </Link>
            <button className="p-2.5 rounded-lg active:bg-accent" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search - always visible */}
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

        {/* Mobile Slide-over Menu */}
        {mobileOpen && (
          <>
            <div className="lg:hidden fixed inset-0 top-[104px] bg-black/40 z-40" onClick={() => setMobileOpen(false)} />
            <div className="lg:hidden fixed inset-y-0 right-0 top-[104px] w-[280px] bg-background border-l z-50 overflow-y-auto animate-in slide-in-from-right duration-200">
              <div className="p-4 space-y-1">
                {/* Quick links with icons and larger touch targets */}
                <Link to="/" className="flex items-center gap-3 text-sm font-medium py-3 px-4 rounded-lg hover:bg-accent active:bg-accent" onClick={() => setMobileOpen(false)}>
                  <Home className="h-5 w-5 text-muted-foreground" /> Find Events
                </Link>
                <Link to="/create-event" className="flex items-center gap-3 text-sm font-medium py-3 px-4 rounded-lg hover:bg-accent active:bg-accent" onClick={() => setMobileOpen(false)}>
                  <PlusCircle className="h-5 w-5 text-muted-foreground" /> Create Events
                </Link>

                <div className="border-t my-3" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-1">Explore</p>
                <Link to="/partners" className="flex items-center gap-3 text-sm font-medium py-3 px-4 rounded-lg hover:bg-accent active:bg-accent" onClick={() => setMobileOpen(false)}>
                  <Handshake className="h-5 w-5 text-muted-foreground" /> Partners
                </Link>
                <Link to="/influencers" className="flex items-center gap-3 text-sm font-medium py-3 px-4 rounded-lg hover:bg-accent active:bg-accent" onClick={() => setMobileOpen(false)}>
                  <Megaphone className="h-5 w-5 text-muted-foreground" /> Influencers
                </Link>
                <Link to="/help" className="flex items-center gap-3 text-sm font-medium py-3 px-4 rounded-lg hover:bg-accent active:bg-accent" onClick={() => setMobileOpen(false)}>
                  <HelpCircle className="h-5 w-5 text-muted-foreground" /> Help Center
                </Link>

                <div className="border-t my-3" />

                {user ? (
                  <>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-1">Account</p>
                    <Link to="/profile" className="flex items-center gap-3 text-sm font-medium py-3 px-4 rounded-lg hover:bg-accent active:bg-accent" onClick={() => setMobileOpen(false)}>
                      <User className="h-5 w-5 text-muted-foreground" /> My Profile
                    </Link>
                    <Link to="/saved" className="flex items-center gap-3 text-sm font-medium py-3 px-4 rounded-lg hover:bg-accent active:bg-accent" onClick={() => setMobileOpen(false)}>
                      <Heart className="h-5 w-5 text-muted-foreground" /> Saved Events
                    </Link>
                    <Link to="/my-events" className="flex items-center gap-3 text-sm font-medium py-3 px-4 rounded-lg hover:bg-accent active:bg-accent" onClick={() => setMobileOpen(false)}>
                      <CalendarDays className="h-5 w-5 text-muted-foreground" /> My Events
                    </Link>
                    <Link to="/my-tickets" className="flex items-center gap-3 text-sm font-medium py-3 px-4 rounded-lg hover:bg-accent active:bg-accent" onClick={() => setMobileOpen(false)}>
                      <Ticket className="h-5 w-5 text-muted-foreground" /> My Tickets
                    </Link>
                    <Link to="/my-hires" className="flex items-center gap-3 text-sm font-medium py-3 px-4 rounded-lg hover:bg-accent active:bg-accent" onClick={() => setMobileOpen(false)}>
                      <Users className="h-5 w-5 text-muted-foreground" /> My Hires
                    </Link>
                    <Link to="/find-partners" className="flex items-center gap-3 text-sm font-medium py-3 px-4 rounded-lg hover:bg-accent active:bg-accent" onClick={() => setMobileOpen(false)}>
                      <Building2 className="h-5 w-5 text-muted-foreground" /> Find Partners
                    </Link>
                    <Link to="/dashboard" className="flex items-center gap-3 text-sm font-medium py-3 px-4 rounded-lg hover:bg-accent active:bg-accent" onClick={() => setMobileOpen(false)}>
                      <LayoutDashboard className="h-5 w-5 text-muted-foreground" /> Dashboard
                    </Link>
                    <div className="border-t my-3" />
                    <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="flex items-center gap-3 w-full text-sm font-medium py-3 px-4 rounded-lg hover:bg-accent active:bg-accent text-destructive">
                      <LogOut className="h-5 w-5" /> Sign out
                    </button>
                  </>
                ) : (
                  <Link to="/auth" className="flex items-center justify-center gap-2 text-sm font-bold py-3 px-4 rounded-full bg-primary text-primary-foreground active:opacity-90 mt-2" onClick={() => setMobileOpen(false)}>
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t safe-bottom">
        <div className="flex items-center justify-around h-14 px-2">
          {bottomNavItems.map((item) => {
            const active = isBottomNavActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-lg transition-colors active:bg-accent ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

    </>
  );
};

export default QantidHeader;
