import { useState } from "react";
import { Mail, Send, Users, Loader2, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Attendee {
  name: string;
  email: string;
}

interface Props {
  eventId: string;
  eventTitle: string;
  attendees: Attendee[];
}

const EMAIL_TEMPLATES = [
  { value: "reminder", label: "Event Reminder", subject: "Reminder: {event} is coming up!", body: "Hi {name},\n\nThis is a friendly reminder that {event} is happening soon. We can't wait to see you there!\n\nBest regards,\nThe Afritickets Team" },
  { value: "update", label: "Event Update", subject: "Important update for {event}", body: "Hi {name},\n\nWe have an important update regarding {event}. Please read the details below.\n\n[Your update here]\n\nBest regards,\nThe Afritickets Team" },
  { value: "thankyou", label: "Thank You", subject: "Thank you for attending {event}!", body: "Hi {name},\n\nThank you for attending {event}! We hope you had an amazing experience.\n\nWe'd love to hear your feedback. Please take a moment to share your thoughts.\n\nBest regards,\nThe Afritickets Team" },
  { value: "custom", label: "Custom Email", subject: "", body: "" },
];

const EmailCampaignManager = ({ eventId, eventTitle, attendees }: Props) => {
  const [showCompose, setShowCompose] = useState(false);
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("reminder");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const { toast } = useToast();

  const applyTemplate = (templateValue: string) => {
    setSelectedTemplate(templateValue);
    const template = EMAIL_TEMPLATES.find((t) => t.value === templateValue);
    if (template && templateValue !== "custom") {
      setSubject(template.subject.replace("{event}", eventTitle));
      setBody(template.body.replace(/{event}/g, eventTitle).replace(/{name}/g, "{name}"));
    }
  };

  const generateWithAi = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-event-tools", {
        body: {
          action: "generate_promo_copy",
          eventTitle,
          eventDescription: "",
          platform: "email",
          tone: "professional",
        },
      });
      if (error) throw error;
      if (data?.copy) {
        setBody(data.copy);
        setSubject(`Don't miss ${eventTitle}!`);
        setSelectedTemplate("custom");
      }
    } catch (err: any) {
      toast({ title: "AI generation failed", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!subject || !body) {
      toast({ title: "Please fill in subject and body", variant: "destructive" });
      return;
    }
    if (attendees.length === 0) {
      toast({ title: "No attendees to email", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      // For now, we create a mailto link since bulk sending requires email infrastructure
      const emailList = attendees.map((a) => a.email).join(",");
      const mailtoUrl = `mailto:?bcc=${encodeURIComponent(emailList)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/{name}/g, "attendee"))}`;

      // Copy email content and open default mail client
      await navigator.clipboard.writeText(body.replace(/{name}/g, ""));
      window.open(mailtoUrl, "_blank");

      toast({
        title: `Email prepared for ${attendees.length} attendees! ✉️`,
        description: "Your default email client has been opened with the recipients.",
      });
      setShowCompose(false);
    } catch (err: any) {
      toast({ title: "Failed to prepare email", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Email Attendees</h3>
          <Badge variant="secondary" className="text-[10px]">{attendees.length} recipients</Badge>
        </div>
        <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => { setShowCompose(!showCompose); if (!showCompose) applyTemplate("reminder"); }}>
          <Send className="h-3 w-3 mr-1" /> Compose
        </Button>
      </div>

      {showCompose && (
        <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">To: {attendees.length} attendees (BCC)</span>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={generateWithAi} disabled={generating}>
              {generating ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Generating...</> : <><Sparkles className="h-3 w-3 mr-1" /> AI Write</>}
            </Button>
          </div>

          <div>
            <Label className="text-xs">Template</Label>
            <Select value={selectedTemplate} onValueChange={applyTemplate}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {EMAIL_TEMPLATES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <FileText className="h-3 w-3 mr-1 inline" /> {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="h-8 text-sm" placeholder="Email subject line" />
          </div>

          <div>
            <Label className="text-xs">Body <span className="text-muted-foreground">(use {"{name}"} for personalization)</span></Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} className="text-sm min-h-[120px]" placeholder="Write your email..." />
          </div>

          <div className="flex gap-2">
            <Button size="sm" className="rounded-full text-xs" onClick={handleSend} disabled={sending || attendees.length === 0}>
              {sending ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Sending...</> : <><Send className="h-3 w-3 mr-1" /> Send to {attendees.length} Attendees</>}
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full text-xs" onClick={() => setShowCompose(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailCampaignManager;
