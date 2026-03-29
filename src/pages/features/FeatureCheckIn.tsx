import { QrCode, Check } from "lucide-react";
import FeaturePageLayout from "./FeaturePageLayout";
import heroImg from "@/assets/feature-checkin.jpg";

const benefits = [
  "Scan QR codes from attendees' tickets using your phone camera — no extra hardware needed",
  "Instant sound beep and vibration feedback on successful scan — perfect for noisy venues",
  "Duplicate scan detection prevents checking in the same attendee twice",
  "Real-time scan history log with timestamps so you never lose track",
  "Manual search by name or email as a backup check-in method",
  "Live attendance counter showing checked-in vs. total attendees",
  "Works offline-first — scans process even with spotty internet",
  "Multiple staff can check in simultaneously from different devices",
];

const FeatureCheckIn = () => (
  <FeaturePageLayout
    icon={<QrCode className="h-10 w-10 text-green-600" />}
    title="QR Check-In"
    subtitle="Fast, reliable attendee check-in with your phone camera. Sound feedback, scan history, and real-time attendance tracking."
    heroColor="bg-green-500/5"
  >
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-6">Effortless event entry</h2>
        <div className="grid gap-4">
          {benefits.map((b) => (
            <div key={b} className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="h-3.5 w-3.5 text-green-600" />
              </div>
              <p className="text-muted-foreground">{b}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-8">
        <h3 className="font-bold text-xl mb-3">Built for busy entrances</h3>
        <p className="text-muted-foreground leading-relaxed">
          Whether you're running a 50-person meetup or a 5,000-person festival, our QR check-in
          system handles it all. The audio and haptic feedback means your door staff can scan tickets
          without even looking at the screen — just listen for the beep. The scan history log keeps
          a running record so you can resolve any disputes on the spot.
        </p>
      </div>
    </div>
  </FeaturePageLayout>
);

export default FeatureCheckIn;
