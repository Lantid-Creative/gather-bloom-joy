import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import QantidHeader from "@/components/QantidHeader";
import QantidFooter from "@/components/QantidFooter";
import { Button } from "@/components/ui/button";

interface FeaturePageLayoutProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  heroColor: string;
  heroImage?: string;
  children: ReactNode;
}

const FeaturePageLayout = ({ icon, title, subtitle, heroColor, heroImage, children }: FeaturePageLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <QantidHeader />

      {/* Hero */}
      <section className={`${heroColor} py-16 md:py-24`}>
        <div className="container max-w-5xl">
          <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-inherit hover:bg-white/10" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center gap-4 mb-4">
                {icon}
                <h1 className="text-3xl md:text-5xl font-black">{title}</h1>
              </div>
              <p className="text-lg md:text-xl opacity-80 max-w-2xl">{subtitle}</p>
              <div className="mt-8 flex gap-3">
                <Button variant="hero" size="lg" className="rounded-full" asChild>
                  <Link to="/create-event">Get Started Free</Link>
                </Button>
                <Button variant="outline" size="lg" className="rounded-full border-current" asChild>
                  <Link to="/">Browse Events</Link>
                </Button>
              </div>
            </div>
            {heroImage && (
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img src={heroImage} alt={title} width={1280} height={720} className="w-full h-auto" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container max-w-4xl py-16">
        {children}
      </div>

      <QantidFooter />
    </div>
  );
};

export default FeaturePageLayout;
