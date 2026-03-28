import EventbriteHeader from "@/components/EventbriteHeader";
import EventbriteFooter from "@/components/EventbriteFooter";

const Terms = () => (
  <div className="min-h-screen bg-background">
    <EventbriteHeader />
    <div className="container max-w-3xl py-16 prose prose-sm dark:prose-invert">
      <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
      <p className="text-muted-foreground mb-10">Last updated: March 1, 2026</p>

      <h2>1. Acceptance of Terms</h2>
      <p>By accessing or using Afritickets ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, you may not use our services. These terms apply to all users, including event organizers and attendees.</p>

      <h2>2. Account Registration</h2>
      <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account credentials. You must be at least 18 years old to create an organizer account. Afritickets reserves the right to suspend accounts that violate these terms.</p>

      <h2>3. Event Organizers</h2>
      <p>Organizers are responsible for the accuracy of event information, delivery of the event as described, compliance with local laws and regulations, and handling refund requests in accordance with our refund policy. Afritickets is not liable for events that are cancelled, rescheduled, or do not meet attendee expectations.</p>

      <h2>4. Ticket Purchases</h2>
      <p>All ticket sales are final unless the organizer's refund policy states otherwise. Afritickets acts as an intermediary between organizers and attendees. Tickets may not be resold at a price above face value. Digital tickets must be presented at the venue for entry.</p>

      <h2>5. Fees & Payments</h2>
      <p>Afritickets charges service fees on paid ticket sales as outlined on our Pricing page. Organizer payouts are processed within 3-5 business days after the event concludes. We support multiple payment methods including mobile money, credit/debit cards, and bank transfers.</p>

      <h2>6. Prohibited Conduct</h2>
      <p>Users may not use the platform for fraudulent activities, post misleading event information, attempt to circumvent platform fees, harass other users, or violate any applicable laws or regulations.</p>

      <h2>7. Intellectual Property</h2>
      <p>All content, branding, and technology on Afritickets is owned by Afritickets Ltd. Organizers retain ownership of their event content but grant Afritickets a license to display it on the platform for promotional purposes.</p>

      <h2>8. Limitation of Liability</h2>
      <p>Afritickets is not liable for indirect, incidental, or consequential damages. Our total liability shall not exceed the fees paid to us in the 12 months preceding the claim. We are not responsible for the actions of event organizers or attendees.</p>

      <h2>9. Changes to Terms</h2>
      <p>We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance. We will notify users of significant changes via email or platform notification.</p>

      <h2>10. Contact</h2>
      <p>For questions about these terms, contact us at legal@afritickets.com or visit our Help Center.</p>
    </div>
    <EventbriteFooter />
  </div>
);

export default Terms;
