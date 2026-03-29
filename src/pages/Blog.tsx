import { Calendar, TrendingUp, Lightbulb, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import QantidHeader from "@/components/QantidHeader";
import QantidFooter from "@/components/QantidFooter";
import { Button } from "@/components/ui/button";

const posts = [
  {
    title: "10 Tips for Selling Out Your African Music Festival",
    excerpt: "From early-bird pricing to influencer partnerships, here's how top organizers across Africa are filling venues and creating unforgettable experiences.",
    category: "Event Marketing",
    date: "Mar 15, 2026",
    readTime: "6 min read",
    icon: TrendingUp,
  },
  {
    title: "The Rise of Tech Conferences Across Africa",
    excerpt: "From AfroTech Lagos to Nairobi Innovation Week, Africa's tech conference scene is booming. Learn how organizers are building world-class events.",
    category: "Industry Trends",
    date: "Mar 10, 2026",
    readTime: "8 min read",
    icon: Lightbulb,
  },
  {
    title: "How to Set Up Mobile Money Payments for Your Events",
    excerpt: "A step-by-step guide to accepting M-Pesa, MTN MoMo, and other mobile money platforms on your event tickets.",
    category: "Guides",
    date: "Mar 5, 2026",
    readTime: "5 min read",
    icon: Calendar,
  },
  {
    title: "Building Community Through Events: A Lagos Organizer's Story",
    excerpt: "Meet Chioma Nwankwo, who went from hosting 20-person meetups to 5,000-attendee festivals using Qantid.",
    category: "Success Stories",
    date: "Feb 28, 2026",
    readTime: "7 min read",
    icon: Users,
  },
  {
    title: "Event Check-in Best Practices for Large Venues",
    excerpt: "Managing queues, QR code scanning, and attendee flow for events with 1,000+ guests. Real tips from experienced organizers.",
    category: "Operations",
    date: "Feb 20, 2026",
    readTime: "4 min read",
    icon: Calendar,
  },
  {
    title: "Why Hybrid Events Are the Future in Africa",
    excerpt: "Combining in-person and online experiences to reach audiences across borders. How to make hybrid work for your next event.",
    category: "Industry Trends",
    date: "Feb 15, 2026",
    readTime: "6 min read",
    icon: Lightbulb,
  },
];

const Blog = () => (
  <div className="min-h-screen bg-background">
    <QantidHeader />
    <div className="container max-w-5xl py-16 space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold">Qantid Blog</h1>
        <p className="text-lg text-muted-foreground">
          Tips, trends, and stories from Africa's event community.
        </p>
      </div>

      {/* Featured post */}
      <div className="rounded-2xl border overflow-hidden md:flex">
        <div className="md:w-1/2 bg-gradient-to-br from-primary/20 to-primary/5 p-10 flex items-center justify-center">
          <div className="text-center space-y-3">
            <TrendingUp className="h-16 w-16 text-primary mx-auto" />
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">Featured</span>
          </div>
        </div>
        <div className="md:w-1/2 p-8 space-y-4 flex flex-col justify-center">
          <span className="text-xs font-medium text-primary">{posts[0].category}</span>
          <h2 className="text-2xl font-bold">{posts[0].title}</h2>
          <p className="text-muted-foreground text-sm">{posts[0].excerpt}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{posts[0].date}</span>
            <span>·</span>
            <span>{posts[0].readTime}</span>
          </div>
        </div>
      </div>

      {/* Post grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.slice(1).map((post, i) => (
          <div key={i} className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-36 bg-gradient-to-br from-primary/10 to-accent/30 flex items-center justify-center">
              <post.icon className="h-10 w-10 text-primary" />
            </div>
            <div className="p-5 space-y-3">
              <span className="text-xs font-medium text-primary">{post.category}</span>
              <h3 className="font-bold leading-tight">{post.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <QantidFooter />
  </div>
);

export default Blog;
