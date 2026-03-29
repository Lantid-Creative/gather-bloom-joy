import EventbriteHeader from "@/components/EventbriteHeader";
import EventbriteFooter from "@/components/EventbriteFooter";

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <EventbriteHeader />
    <div className="container max-w-3xl py-16 prose prose-sm dark:prose-invert">
      <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground mb-10">Last updated: March 1, 2026</p>

      <h2>1. Information We Collect</h2>
      <p>We collect information you provide directly: name, email address, payment details, and event preferences. We also collect usage data including device information, IP address, browser type, pages visited, and interactions with the platform. For organizers, we collect payout information such as bank accounts or mobile money details.</p>

      <h2>2. How We Use Your Information</h2>
      <p>We use your information to provide and improve our services, process ticket purchases and payouts, send event recommendations and updates, prevent fraud and ensure platform security, and comply with legal obligations. We do not sell your personal data to third parties.</p>

      <h2>3. Information Sharing</h2>
      <p>We share your information with event organizers (for tickets you purchase), payment processors (to process transactions), service providers (to operate our platform), and law enforcement (when required by law). Organizers receive your name and email for purchased tickets to facilitate event entry and communication.</p>

      <h2>4. Data Security</h2>
      <p>We implement industry-standard security measures including encryption of data in transit and at rest, regular security audits, access controls and authentication, and secure payment processing through certified providers. No method of transmission is 100% secure; we cannot guarantee absolute security.</p>

      <h2>5. Your Rights</h2>
      <p>Depending on your location, you may have the right to access your personal data, correct inaccurate data, delete your data, port your data to another service, opt out of marketing communications, and withdraw consent at any time. To exercise these rights, contact us at privacy@qantid.com.</p>

      <h2>6. Cookies</h2>
      <p>We use essential cookies for platform functionality, analytics cookies to understand usage patterns, and preference cookies to remember your settings. You can manage cookie preferences through your browser settings.</p>

      <h2>7. Data Retention</h2>
      <p>We retain your data for as long as your account is active or as needed to provide services. Transaction records are kept for 7 years for legal compliance. You can request account deletion at any time.</p>

      <h2>8. International Transfers</h2>
      <p>Your data may be processed in countries other than your own. We ensure appropriate safeguards are in place for international data transfers in compliance with applicable data protection laws.</p>

      <h2>9. Children's Privacy</h2>
      <p>Our services are not directed to children under 13. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal data, we will delete it promptly.</p>

      <h2>10. Contact Us</h2>
      <p>For privacy-related questions, contact our Data Protection Officer at privacy@qantid.com or write to: Qantid Ltd, 14 Adeola Hopewell Street, Victoria Island, Lagos, Nigeria.</p>
    </div>
    <EventbriteFooter />
  </div>
);

export default Privacy;
