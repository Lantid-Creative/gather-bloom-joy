import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import BackToTopButton from "@/components/BackToTopButton";

// Lazy-loaded page components
const Index = lazy(() => import("./pages/Index"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const CreateEvent = lazy(() => import("./pages/CreateEvent"));
const MyEvents = lazy(() => import("./pages/MyEvents"));
const EditEvent = lazy(() => import("./pages/EditEvent"));
const MyTickets = lazy(() => import("./pages/MyTickets"));
const Profile = lazy(() => import("./pages/Profile"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const About = lazy(() => import("./pages/About"));
const Pricing = lazy(() => import("./pages/Pricing"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const Blog = lazy(() => import("./pages/Blog"));
const Contact = lazy(() => import("./pages/Contact"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Careers = lazy(() => import("./pages/Careers"));
const OrganizerProfile = lazy(() => import("./pages/OrganizerProfile"));
const CheckIn = lazy(() => import("./pages/CheckIn"));
const SavedEvents = lazy(() => import("./pages/SavedEvents"));
const Partners = lazy(() => import("./pages/Partners"));
const PartnerDashboard = lazy(() => import("./pages/PartnerDashboard"));
const Influencers = lazy(() => import("./pages/Influencers"));
const InfluencerProfile = lazy(() => import("./pages/InfluencerProfile"));
const InfluencerDashboard = lazy(() => import("./pages/InfluencerDashboard"));
const HireInfluencer = lazy(() => import("./pages/HireInfluencer"));
const MyHires = lazy(() => import("./pages/MyHires"));
const FeatureTicketing = lazy(() => import("./pages/features/FeatureTicketing"));
const FeatureCheckIn = lazy(() => import("./pages/features/FeatureCheckIn"));
const FeatureDashboard = lazy(() => import("./pages/features/FeatureDashboard"));
const FeatureInfluencers = lazy(() => import("./pages/features/FeatureInfluencers"));
const FeatureSponsorship = lazy(() => import("./pages/features/FeatureSponsorship"));
const FeaturePromoCodes = lazy(() => import("./pages/features/FeaturePromoCodes"));
const FeaturePayments = lazy(() => import("./pages/features/FeaturePayments"));
const FeatureAfrica = lazy(() => import("./pages/features/FeatureAfrica"));
const FeatureAI = lazy(() => import("./pages/features/FeatureAI"));
const DpGenerator = lazy(() => import("./pages/DpGenerator"));
const Lineups = lazy(() => import("./pages/Lineups"));
const MarketingTools = lazy(() => import("./pages/MarketingTools"));
const AppMarketplace = lazy(() => import("./pages/AppMarketplace"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminRoute = lazy(() => import("./components/AdminRoute"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminEvents = lazy(() => import("./pages/admin/AdminEvents"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <BackToTopButton />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/event/:id" element={<EventDetail />} />
              <Route path="/event/:eventId/dp" element={<DpGenerator />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
              <Route path="/my-events" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />
              <Route path="/edit-event/:id" element={<ProtectedRoute><EditEvent /></ProtectedRoute>} />
              <Route path="/my-tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/saved" element={<ProtectedRoute><SavedEvents /></ProtectedRoute>} />
              <Route path="/check-in/:eventId" element={<ProtectedRoute><CheckIn /></ProtectedRoute>} />
              <Route path="/organizer/:id" element={<OrganizerProfile />} />
              <Route path="/about" element={<About />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/partner-dashboard" element={<ProtectedRoute><PartnerDashboard /></ProtectedRoute>} />
              <Route path="/influencers" element={<Influencers />} />
              <Route path="/influencer/:id" element={<InfluencerProfile />} />
              <Route path="/influencer-dashboard" element={<ProtectedRoute><InfluencerDashboard /></ProtectedRoute>} />
              <Route path="/hire/:influencerId" element={<ProtectedRoute><HireInfluencer /></ProtectedRoute>} />
              <Route path="/my-hires" element={<ProtectedRoute><MyHires /></ProtectedRoute>} />
              <Route path="/features/ticketing" element={<FeatureTicketing />} />
              <Route path="/features/check-in" element={<FeatureCheckIn />} />
              <Route path="/features/dashboard" element={<FeatureDashboard />} />
              <Route path="/features/influencers" element={<FeatureInfluencers />} />
              <Route path="/features/sponsorship" element={<FeatureSponsorship />} />
              <Route path="/features/promo-codes" element={<FeaturePromoCodes />} />
              <Route path="/features/payments" element={<FeaturePayments />} />
              <Route path="/features/africa" element={<FeatureAfrica />} />
              <Route path="/features/ai" element={<FeatureAI />} />
              <Route path="/lineups" element={<Lineups />} />
              <Route path="/marketing-tools" element={<MarketingTools />} />
              <Route path="/apps" element={<AppMarketplace />} />
              <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminRoute><AdminLayout /></AdminRoute></Suspense>}>
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="orders" element={<AdminOrders />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
