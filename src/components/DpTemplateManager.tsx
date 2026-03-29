import { useState, useRef, useEffect, useCallback } from "react";
import { ImagePlus, Trash2, Move, Circle, Square, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

interface DpTemplate {
  id: string;
  name: string;
  template_image_url: string;
  photo_x: number;
  photo_y: number;
  photo_width: number;
  photo_height: number;
  photo_shape: string;
  is_active: boolean;
}

const DpTemplateManager = ({ eventId }: { eventId: string }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 0, h: 0 });
  const [photoRect, setPhotoRect] = useState({ x: 50, y: 50, w: 200, h: 200 });
  const [photoShape, setPhotoShape] = useState<"circle" | "square">("circle");
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);

  const { data: templates } = useQuery({
    queryKey: ["dp-templates", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dp_templates" as any)
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any[]) as DpTemplate[];
    },
  });

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !uploadedUrl) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const scale = Math.min(500 / img.width, 400 / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw photo placement area
      ctx.save();
      ctx.strokeStyle = "#F97316";
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.fillStyle = "rgba(249, 115, 22, 0.15)";

      const rx = photoRect.x * scale;
      const ry = photoRect.y * scale;
      const rw = photoRect.w * scale;
      const rh = photoRect.h * scale;

      if (photoShape === "circle") {
        ctx.beginPath();
        ctx.ellipse(rx + rw / 2, ry + rh / 2, rw / 2, rh / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeRect(rx, ry, rw, rh);
      }

      ctx.setLineDash([]);
      ctx.fillStyle = "#F97316";
      ctx.font = `${12 * scale}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("📷 Photo here", rx + rw / 2, ry + rh / 2 + 5);
      ctx.restore();
    };
    img.src = uploadedUrl;
  }, [uploadedUrl, photoRect, photoShape]);

  useEffect(() => { drawCanvas(); }, [drawCanvas]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${eventId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("dp-templates").upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("dp-templates").getPublicUrl(path);
      setUploadedUrl(urlData.publicUrl);

      const img = new Image();
      img.onload = () => {
        setImgNaturalSize({ w: img.width, h: img.height });
        setPhotoRect({ x: img.width * 0.3, y: img.height * 0.2, w: img.width * 0.4, h: img.width * 0.4 });
      };
      img.src = urlData.publicUrl;
      toast({ title: "Flyer uploaded!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = (imgNaturalSize.w || canvas.width) / canvas.width;
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    const scale = Math.min(500 / (imgNaturalSize.w || 500), 400 / (imgNaturalSize.h || 400), 1);
    const rx = photoRect.x * scale;
    const ry = photoRect.y * scale;
    const rw = photoRect.w * scale;
    const rh = photoRect.h * scale;
    if (mx >= rx && mx <= rx + rw && my >= ry && my <= ry + rh) {
      setDragging(true);
      setDragOffset({ x: mx - rx, y: my - ry });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    const scale = Math.min(500 / (imgNaturalSize.w || 500), 400 / (imgNaturalSize.h || 400), 1);
    setPhotoRect(prev => ({
      ...prev,
      x: (mx - dragOffset.x) / scale,
      y: (my - dragOffset.y) / scale,
    }));
  };

  const handleCanvasMouseUp = () => setDragging(false);

  const handleSave = async () => {
    if (!uploadedUrl || !name.trim()) {
      toast({ title: "Please upload a flyer and add a name", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("dp_templates" as any).insert({
        event_id: eventId,
        user_id: user!.id,
        name: name.trim(),
        template_image_url: uploadedUrl,
        photo_x: Math.round(photoRect.x),
        photo_y: Math.round(photoRect.y),
        photo_width: Math.round(photoRect.w),
        photo_height: Math.round(photoRect.h),
        photo_shape: photoShape,
      } as any);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["dp-templates", eventId] });
      setUploadedUrl("");
      setName("");
      toast({ title: "DP template saved!" });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("dp_templates" as any).delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["dp-templates", eventId] });
    toast({ title: "Template deleted" });
  };

  const shareUrl = `${window.location.origin}/event/${eventId}/dp`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ImagePlus className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">DP & Flyer Generator</h3>
      </div>

      {templates && templates.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Active Templates</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {templates.map((t) => (
              <div key={t.id} className="relative group rounded-lg border overflow-hidden">
                <img src={t.template_image_url} alt={t.name} className="w-full h-24 object-cover" />
                <div className="p-1.5 text-xs font-medium truncate">{t.name}</div>
                <Badge variant="secondary" className="absolute top-1 left-1 text-[10px]">
                  {t.photo_shape === "circle" ? "⬤" : "■"}
                </Badge>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-destructive text-white rounded-full p-1 transition"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Share link:</span>
            <button
              className="text-primary underline truncate"
              onClick={() => { navigator.clipboard.writeText(shareUrl); toast({ title: "Link copied!" }); }}
            >
              {shareUrl}
            </button>
          </div>
        </div>
      )}

      <div className="border rounded-lg p-4 space-y-3">
        <p className="text-xs font-medium text-muted-foreground">Create New Template</p>
        <div className="space-y-2">
          <Label className="text-xs">Template Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Event Frame 2026" className="text-sm h-9" />
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="text-xs">
          <ImagePlus className="h-3 w-3 mr-1" />
          {uploading ? "Uploading..." : "Upload Flyer Image"}
        </Button>

        {uploadedUrl && (
          <>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Move className="h-3 w-3" /> Drag the orange zone to position where attendee photo goes
            </p>
            <canvas
              ref={canvasRef}
              className="border rounded-lg cursor-move max-w-full"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />

            <div className="flex flex-wrap gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Shape</Label>
                <div className="flex gap-1">
                  <Button variant={photoShape === "circle" ? "default" : "outline"} size="sm" onClick={() => setPhotoShape("circle")} className="text-xs h-7">
                    <Circle className="h-3 w-3 mr-1" /> Circle
                  </Button>
                  <Button variant={photoShape === "square" ? "default" : "outline"} size="sm" onClick={() => setPhotoShape("square")} className="text-xs h-7">
                    <Square className="h-3 w-3 mr-1" /> Square
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Size (px)</Label>
                <div className="flex gap-1">
                  <Input type="number" value={Math.round(photoRect.w)} onChange={(e) => setPhotoRect(prev => ({ ...prev, w: +e.target.value, h: +e.target.value }))} className="w-20 h-7 text-xs" />
                </div>
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} size="sm" className="text-xs">
              {saving ? "Saving..." : "Save Template"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default DpTemplateManager;
