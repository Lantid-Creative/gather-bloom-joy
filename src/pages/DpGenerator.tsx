import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, Share2, Camera, ImagePlus, User } from "lucide-react";
import EventbriteHeader from "@/components/EventbriteHeader";
import EventbriteFooter from "@/components/EventbriteFooter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

interface DpTemplate {
  id: string;
  name: string;
  template_image_url: string;
  photo_x: number;
  photo_y: number;
  photo_width: number;
  photo_height: number;
  photo_shape: string;
}

const DpGenerator = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedTemplate, setSelectedTemplate] = useState<DpTemplate | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  const { data: event } = useQuery({
    queryKey: ["dp-event", eventId],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("title, image_url, organizer").eq("id", eventId!).single();
      return data;
    },
    enabled: !!eventId,
  });

  const { data: templates } = useQuery({
    queryKey: ["dp-templates-public", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dp_templates")
        .select("*")
        .eq("event_id", eventId!)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DpTemplate[];
    },
    enabled: !!eventId,
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUserPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const generateDP = useCallback(() => {
    if (!selectedTemplate || !userPhoto) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const templateImg = new Image();
    templateImg.crossOrigin = "anonymous";
    templateImg.onload = () => {
      canvas.width = templateImg.width;
      canvas.height = templateImg.height;

      // Draw user photo first (behind template)
      const userImg = new Image();
      userImg.onload = () => {
        ctx.save();
        const px = selectedTemplate.photo_x;
        const py = selectedTemplate.photo_y;
        const pw = selectedTemplate.photo_width;
        const ph = selectedTemplate.photo_height;

        // Clip to shape
        ctx.beginPath();
        if (selectedTemplate.photo_shape === "circle") {
          ctx.ellipse(px + pw / 2, py + ph / 2, pw / 2, ph / 2, 0, 0, Math.PI * 2);
        } else {
          ctx.rect(px, py, pw, ph);
        }
        ctx.clip();

        // Draw user photo to fill the clipped area (cover)
        const userAspect = userImg.width / userImg.height;
        const slotAspect = pw / ph;
        let sx = 0, sy = 0, sw = userImg.width, sh = userImg.height;
        if (userAspect > slotAspect) {
          sw = userImg.height * slotAspect;
          sx = (userImg.width - sw) / 2;
        } else {
          sh = userImg.width / slotAspect;
          sy = (userImg.height - sh) / 2;
        }
        ctx.drawImage(userImg, sx, sy, sw, sh, px, py, pw, ph);
        ctx.restore();

        // Draw template on top
        ctx.drawImage(templateImg, 0, 0);

        // Re-draw the user photo in the cutout (template covers everything else)
        // Actually we need user photo BEHIND template. Let's redo:
        // Clear and draw properly
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Fill background white
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Draw user photo clipped
        ctx.save();
        ctx.beginPath();
        if (selectedTemplate.photo_shape === "circle") {
          ctx.ellipse(px + pw / 2, py + ph / 2, pw / 2, ph / 2, 0, 0, Math.PI * 2);
        } else {
          ctx.rect(px, py, pw, ph);
        }
        ctx.clip();
        ctx.drawImage(userImg, sx, sy, sw, sh, px, py, pw, ph);
        ctx.restore();

        // 3. Draw template overlay
        ctx.drawImage(templateImg, 0, 0);

        setGenerated(true);
      };
      userImg.src = userPhoto;
    };
    templateImg.src = selectedTemplate.template_image_url;
  }, [selectedTemplate, userPhoto]);

  useEffect(() => {
    if (selectedTemplate && userPhoto) generateDP();
  }, [selectedTemplate, userPhoto, generateDP]);

  const downloadDP = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${event?.title || "event"}-dp.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast({ title: "DP downloaded!" });
  };

  const shareDP = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), "image/png"));
      const file = new File([blob], "event-dp.png", { type: "image/png" });
      if (navigator.share) {
        await navigator.share({ files: [file], title: event?.title || "My Event DP" });
      } else {
        navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        toast({ title: "Image copied to clipboard!" });
      }
    } catch {
      toast({ title: "Share not supported, download instead", variant: "destructive" });
    }
  };

  const setAsProfilePic = async () => {
    if (!user || !canvasRef.current) return;
    try {
      const blob = await new Promise<Blob>((r) => canvasRef.current!.toBlob((b) => r(b!), "image/png"));
      const path = `${user.id}/avatar-${Date.now()}.png`;
      await supabase.storage.from("dp-templates").upload(path, blob);
      const { data: urlData } = supabase.storage.from("dp-templates").getPublicUrl(path);
      await supabase.from("profiles").update({ avatar_url: urlData.publicUrl }).eq("id", user.id);
      toast({ title: "Profile picture updated!" });
    } catch (err: unknown) {
      toast({ title: "Failed to update", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <EventbriteHeader />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <Link to={`/event/${eventId}`} className="text-primary text-sm hover:underline">← Back to event</Link>
          <h1 className="text-2xl font-bold mt-2">Create Your Event DP</h1>
          {event && <p className="text-muted-foreground text-sm mt-1">{event.title} by {event.organizer}</p>}
        </div>

        {/* Step 1: Choose template */}
        <div className="space-y-3">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
            Choose a template
          </h2>
          {templates && templates.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={`rounded-xl border-2 overflow-hidden transition-all ${
                    selectedTemplate?.id === t.id ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
                  }`}
                >
                  <img src={t.template_image_url} alt={t.name} className="w-full h-32 object-cover" />
                  <p className="text-xs font-medium p-2 truncate">{t.name}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="border rounded-xl p-8 text-center text-muted-foreground">
              <ImagePlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No templates available for this event yet.</p>
              <p className="text-xs mt-1">The organizer hasn't created any DP templates.</p>
            </div>
          )}
        </div>

        {/* Step 2: Upload photo */}
        <div className="space-y-3">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
            Upload your photo
          </h2>
          <input ref={fileInputRef} type="file" accept="image/*" capture="user" onChange={handlePhotoUpload} className="hidden" />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Camera className="h-4 w-4 mr-2" /> {userPhoto ? "Change Photo" : "Take / Upload Photo"}
            </Button>
          </div>
          {userPhoto && (
            <img src={userPhoto} alt="Your photo" className="w-20 h-20 rounded-full object-cover border-2 border-primary" />
          )}
        </div>

        {/* Step 3: Preview & Download */}
        <div className="space-y-3">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
            Preview & Download
          </h2>

          <canvas
            ref={canvasRef}
            className={`max-w-full rounded-xl border shadow-lg ${!generated ? "hidden" : ""}`}
          />

          {!generated && (
            <div className="border rounded-xl p-8 text-center text-muted-foreground">
              <p className="text-sm">Select a template and upload your photo to generate your DP</p>
            </div>
          )}

          {generated && (
            <div className="flex flex-wrap gap-2">
              <Button onClick={downloadDP} className="gap-2">
                <Download className="h-4 w-4" /> Download
              </Button>
              <Button variant="outline" onClick={shareDP} className="gap-2">
                <Share2 className="h-4 w-4" /> Share
              </Button>
              {user && (
                <Button variant="secondary" onClick={setAsProfilePic} className="gap-2">
                  <User className="h-4 w-4" /> Set as Profile Pic
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      <EventbriteFooter />
    </div>
  );
};

export default DpGenerator;
