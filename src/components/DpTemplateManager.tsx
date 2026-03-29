import { useState, useRef, useEffect, useCallback } from "react";
import { ImagePlus, Trash2, Move, Circle, Square, Palette, Sparkles, ChevronDown, ChevronUp, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

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

// ─── Pre-made template designs (canvas-rendered) ───
interface PresetDesign {
  id: string;
  name: string;
  category: string;
  defaultColors: { primary: string; secondary: string; accent: string; text: string };
  render: (ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof presetDesigns[0]["defaultColors"], eventTitle: string, photoRect: { x: number; y: number; w: number; h: number }, photoShape: string) => void;
}

const drawPhotoPlaceholder = (ctx: CanvasRenderingContext2D, rect: { x: number; y: number; w: number; h: number }, shape: string, color: string) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 4]);
  ctx.fillStyle = color + "25";
  if (shape === "circle") {
    ctx.beginPath();
    ctx.ellipse(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2, rect.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  }
  ctx.setLineDash([]);
  ctx.fillStyle = color;
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("📷 Photo", rect.x + rect.w / 2, rect.y + rect.h / 2);
  ctx.restore();
};

const presetDesigns: PresetDesign[] = [
  {
    id: "gradient-frame",
    name: "Gradient Frame",
    category: "Modern",
    defaultColors: { primary: "#F97316", secondary: "#EC4899", accent: "#FBBF24", text: "#FFFFFF" },
    render: (ctx, w, h, colors, title, pr, ps) => {
      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, colors.primary);
      grad.addColorStop(1, colors.secondary);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      // Inner white frame
      const m = 24;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(m, m, w - m * 2, h - m * 2, 16);
      ctx.fill();
      // Photo placeholder
      drawPhotoPlaceholder(ctx, pr, ps, colors.primary);
      // Title bar at bottom
      ctx.fillStyle = colors.primary;
      ctx.beginPath();
      ctx.roundRect(m, h - 90, w - m * 2, 66, [0, 0, 16, 16]);
      ctx.fill();
      ctx.fillStyle = colors.text;
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(title || "Event Title", w / 2, h - 52);
      // Decorative dots
      ctx.fillStyle = colors.accent;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(m + 40 + i * 24, m + 16, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  },
  {
    id: "bold-diagonal",
    name: "Bold Diagonal",
    category: "Modern",
    defaultColors: { primary: "#7C3AED", secondary: "#1E1B4B", accent: "#F59E0B", text: "#FFFFFF" },
    render: (ctx, w, h, colors, title, pr, ps) => {
      ctx.fillStyle = colors.secondary;
      ctx.fillRect(0, 0, w, h);
      // Diagonal stripe
      ctx.save();
      ctx.fillStyle = colors.primary;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.4);
      ctx.lineTo(w, h * 0.15);
      ctx.lineTo(w, h * 0.55);
      ctx.lineTo(0, h * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      // Photo
      drawPhotoPlaceholder(ctx, pr, ps, colors.accent);
      // Title
      ctx.fillStyle = colors.text;
      ctx.font = "bold 22px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(title || "Event Title", 30, h - 40);
      // Accent line
      ctx.fillStyle = colors.accent;
      ctx.fillRect(30, h - 28, 80, 4);
    },
  },
  {
    id: "circle-burst",
    name: "Circle Burst",
    category: "Fun",
    defaultColors: { primary: "#10B981", secondary: "#064E3B", accent: "#F472B6", text: "#FFFFFF" },
    render: (ctx, w, h, colors, title, pr, ps) => {
      ctx.fillStyle = colors.secondary;
      ctx.fillRect(0, 0, w, h);
      // Decorative circles
      const circles = [
        { x: w * 0.1, y: h * 0.15, r: 60 },
        { x: w * 0.85, y: h * 0.1, r: 40 },
        { x: w * 0.9, y: h * 0.85, r: 50 },
        { x: w * 0.15, y: h * 0.9, r: 35 },
        { x: w * 0.5, y: h * 0.05, r: 25 },
      ];
      circles.forEach((c, i) => {
        ctx.fillStyle = i % 2 === 0 ? colors.primary + "60" : colors.accent + "50";
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
      });
      // Photo
      drawPhotoPlaceholder(ctx, pr, ps, colors.primary);
      // Title
      ctx.fillStyle = colors.text;
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(title || "Event Title", w / 2, h - 36);
      // Subtitle bar
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.roundRect(w / 2 - 60, h - 24, 120, 18, 9);
      ctx.fill();
      ctx.fillStyle = colors.secondary;
      ctx.font = "bold 10px sans-serif";
      ctx.fillText("I'M ATTENDING!", w / 2, h - 12);
    },
  },
  {
    id: "split-tone",
    name: "Split Tone",
    category: "Elegant",
    defaultColors: { primary: "#0EA5E9", secondary: "#0F172A", accent: "#FCD34D", text: "#FFFFFF" },
    render: (ctx, w, h, colors, title, pr, ps) => {
      // Left half
      ctx.fillStyle = colors.secondary;
      ctx.fillRect(0, 0, w / 2, h);
      // Right half
      ctx.fillStyle = colors.primary;
      ctx.fillRect(w / 2, 0, w / 2, h);
      // Photo
      drawPhotoPlaceholder(ctx, pr, ps, colors.accent);
      // Title on left
      ctx.fillStyle = colors.text;
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(title || "Event", w / 4, h - 60);
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("Title", w / 4, h - 38);
      // Accent bar
      ctx.fillStyle = colors.accent;
      ctx.fillRect(w / 2 - 2, 0, 4, h);
    },
  },
  {
    id: "afro-pattern",
    name: "Afro Pattern",
    category: "Cultural",
    defaultColors: { primary: "#F97316", secondary: "#1C1917", accent: "#EF4444", text: "#FFFFFF" },
    render: (ctx, w, h, colors, title, pr, ps) => {
      ctx.fillStyle = colors.secondary;
      ctx.fillRect(0, 0, w, h);
      // Geometric African-inspired pattern border
      const s = 20;
      ctx.fillStyle = colors.primary;
      for (let i = 0; i < w / s; i++) {
        // Top border
        if (i % 2 === 0) ctx.fillRect(i * s, 0, s, s);
        // Bottom border
        if (i % 2 === 1) ctx.fillRect(i * s, h - s, s, s);
      }
      for (let j = 0; j < h / s; j++) {
        // Left border
        if (j % 2 === 0) ctx.fillRect(0, j * s, s, s);
        // Right border
        if (j % 2 === 1) ctx.fillRect(w - s, j * s, s, s);
      }
      // Accent diamonds
      ctx.fillStyle = colors.accent;
      for (let i = 1; i < w / s - 1; i += 2) {
        ctx.save();
        ctx.translate(i * s + s / 2, s / 2);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-s / 4, -s / 4, s / 2, s / 2);
        ctx.restore();
        ctx.save();
        ctx.translate(i * s + s / 2, h - s / 2);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-s / 4, -s / 4, s / 2, s / 2);
        ctx.restore();
      }
      // Photo
      drawPhotoPlaceholder(ctx, pr, ps, colors.primary);
      // Title
      ctx.fillStyle = colors.text;
      ctx.font = "bold 22px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(title || "Event Title", w / 2, h - 50);
      ctx.font = "12px sans-serif";
      ctx.fillStyle = colors.primary;
      ctx.fillText("✦ I'M GOING ✦", w / 2, h - 30);
    },
  },
  {
    id: "minimalist-badge",
    name: "Minimalist Badge",
    category: "Elegant",
    defaultColors: { primary: "#18181B", secondary: "#F4F4F5", accent: "#F97316", text: "#18181B" },
    render: (ctx, w, h, colors, title, pr, ps) => {
      ctx.fillStyle = colors.secondary;
      ctx.fillRect(0, 0, w, h);
      // Thin border
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.strokeRect(16, 16, w - 32, h - 32);
      // Photo
      drawPhotoPlaceholder(ctx, pr, ps, colors.accent);
      // Title
      ctx.fillStyle = colors.text;
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(title || "Event Title", w / 2, h - 56);
      // Accent underline
      ctx.fillStyle = colors.accent;
      ctx.fillRect(w / 2 - 40, h - 46, 80, 3);
      // Attending badge
      ctx.fillStyle = colors.primary;
      ctx.font = "10px sans-serif";
      ctx.fillText("ATTENDING", w / 2, h - 30);
    },
  },
];

const COLOR_PRESETS = [
  { name: "Coral", primary: "#F97316", secondary: "#7C2D12", accent: "#FBBF24", text: "#FFFFFF" },
  { name: "Purple", primary: "#7C3AED", secondary: "#1E1B4B", accent: "#F59E0B", text: "#FFFFFF" },
  { name: "Teal", primary: "#10B981", secondary: "#064E3B", accent: "#F472B6", text: "#FFFFFF" },
  { name: "Blue", primary: "#0EA5E9", secondary: "#0F172A", accent: "#FCD34D", text: "#FFFFFF" },
  { name: "Red", primary: "#EF4444", secondary: "#1C1917", accent: "#F97316", text: "#FFFFFF" },
  { name: "Pink", primary: "#EC4899", secondary: "#1F2937", accent: "#34D399", text: "#FFFFFF" },
  { name: "Gold", primary: "#D97706", secondary: "#1C1917", accent: "#FBBF24", text: "#FFFFFF" },
  { name: "Dark", primary: "#18181B", secondary: "#F4F4F5", accent: "#F97316", text: "#18181B" },
];

const DpTemplateManager = ({ eventId }: { eventId: string }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const presetCanvasRef = useRef<HTMLCanvasElement>(null);
  const pinchRef = useRef<{ dist: number; size: number } | null>(null);
  const presetPinchRef = useRef<{ dist: number; size: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Existing upload state
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 0, h: 0 });
  const [photoRect, setPhotoRect] = useState({ x: 50, y: 50, w: 200, h: 200 });
  const [photoShape, setPhotoShape] = useState<"circle" | "square">("circle");
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);

  // Preset state
  const [selectedPreset, setSelectedPreset] = useState<PresetDesign | null>(null);
  const [presetColors, setPresetColors] = useState(presetDesigns[0].defaultColors);
  const [presetTitle, setPresetTitle] = useState("");
  const [presetPhotoRect, setPresetPhotoRect] = useState({ x: 150, y: 80, w: 200, h: 200 });
  const [presetPhotoShape, setPresetPhotoShape] = useState<"circle" | "square">("circle");
  const [presetPhotoSize, setPresetPhotoSize] = useState(200);
  const [presetDragging, setPresetDragging] = useState(false);
  const [presetDragOffset, setPresetDragOffset] = useState({ x: 0, y: 0 });
  const [presetName, setPresetName] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const PRESET_W = 500;
  const PRESET_H = 500;

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

  // ─── Upload-based canvas ───
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
      drawPhotoPlaceholder(ctx, {
        x: photoRect.x * scale, y: photoRect.y * scale,
        w: photoRect.w * scale, h: photoRect.h * scale,
      }, photoShape, "#F97316");
    };
    img.src = uploadedUrl;
  }, [uploadedUrl, photoRect, photoShape]);

  useEffect(() => { drawCanvas(); }, [drawCanvas]);

  // ─── Preset canvas ───
  const drawPresetCanvas = useCallback(() => {
    const canvas = presetCanvasRef.current;
    if (!canvas || !selectedPreset) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = PRESET_W;
    canvas.height = PRESET_H;
    ctx.clearRect(0, 0, PRESET_W, PRESET_H);
    selectedPreset.render(ctx, PRESET_W, PRESET_H, presetColors, presetTitle, presetPhotoRect, presetPhotoShape);
  }, [selectedPreset, presetColors, presetTitle, presetPhotoRect, presetPhotoShape]);

  useEffect(() => { drawPresetCanvas(); }, [drawPresetCanvas]);

  // Update photo size
  useEffect(() => {
    setPresetPhotoRect((prev) => ({ ...prev, w: presetPhotoSize, h: presetPhotoSize }));
  }, [presetPhotoSize]);

  // ─── Upload handlers ───
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
    const scale = Math.min(500 / (imgNaturalSize.w || 500), 400 / (imgNaturalSize.h || 400), 1);
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
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
    setPhotoRect((prev) => ({ ...prev, x: (mx - dragOffset.x) / scale, y: (my - dragOffset.y) / scale }));
  };

  // ─── Upload canvas touch handlers ───
  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = { dist: Math.hypot(dx, dy), size: photoRect.w };
      return;
    }
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(500 / (imgNaturalSize.w || 500), 400 / (imgNaturalSize.h || 400), 1);
    const mx = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const my = (touch.clientY - rect.top) * (canvas.height / rect.height);
    const rx = photoRect.x * scale;
    const ry = photoRect.y * scale;
    const rw = photoRect.w * scale;
    const rh = photoRect.h * scale;
    if (mx >= rx && mx <= rx + rw && my >= ry && my <= ry + rh) {
      setDragging(true);
      setDragOffset({ x: mx - rx, y: my - ry });
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.touches.length === 2 && pinchRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      const ratio = newDist / pinchRef.current.dist;
      const newSize = Math.max(40, Math.min(500, Math.round(pinchRef.current.size * ratio)));
      setPhotoRect((prev) => ({ ...prev, w: newSize, h: newSize }));
      return;
    }
    if (!dragging) return;
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const my = (touch.clientY - rect.top) * (canvas.height / rect.height);
    const scale = Math.min(500 / (imgNaturalSize.w || 500), 400 / (imgNaturalSize.h || 400), 1);
    setPhotoRect((prev) => ({ ...prev, x: (mx - dragOffset.x) / scale, y: (my - dragOffset.y) / scale }));
  };

  const handleCanvasTouchEnd = () => {
    setDragging(false);
    pinchRef.current = null;
  };

  // ─── Preset drag handlers ───
  const handlePresetMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = presetCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    const pr = presetPhotoRect;
    if (mx >= pr.x && mx <= pr.x + pr.w && my >= pr.y && my <= pr.y + pr.h) {
      setPresetDragging(true);
      setPresetDragOffset({ x: mx - pr.x, y: my - pr.y });
    }
  };

  const handlePresetMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!presetDragging) return;
    const canvas = presetCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    setPresetPhotoRect((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(mx - presetDragOffset.x, PRESET_W - prev.w)),
      y: Math.max(0, Math.min(my - presetDragOffset.y, PRESET_H - prev.h)),
    }));
  };

  // ─── Preset touch handlers ───
  const handlePresetTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = presetCanvasRef.current;
    if (!canvas) return;
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      presetPinchRef.current = { dist: Math.hypot(dx, dy), size: presetPhotoSize };
      return;
    }
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const mx = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const my = (touch.clientY - rect.top) * (canvas.height / rect.height);
    const pr = presetPhotoRect;
    if (mx >= pr.x && mx <= pr.x + pr.w && my >= pr.y && my <= pr.y + pr.h) {
      setPresetDragging(true);
      setPresetDragOffset({ x: mx - pr.x, y: my - pr.y });
    }
  };

  const handlePresetTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.touches.length === 2 && presetPinchRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      const ratio = newDist / presetPinchRef.current.dist;
      const newSize = Math.max(80, Math.min(300, Math.round(presetPinchRef.current.size * ratio)));
      setPresetPhotoSize(newSize);
      return;
    }
    if (!presetDragging) return;
    const touch = e.touches[0];
    const canvas = presetCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const my = (touch.clientY - rect.top) * (canvas.height / rect.height);
    setPresetPhotoRect((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(mx - presetDragOffset.x, PRESET_W - prev.w)),
      y: Math.max(0, Math.min(my - presetDragOffset.y, PRESET_H - prev.h)),
    }));
  };

  const handlePresetTouchEnd = () => {
    setPresetDragging(false);
    presetPinchRef.current = null;
  };

  // ─── Save preset as template ───
  const savePreset = async () => {
    if (!selectedPreset || !presetName.trim()) {
      toast({ title: "Please select a design and add a name", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      // Render to a full-size canvas and upload
      const offscreen = document.createElement("canvas");
      offscreen.width = PRESET_W;
      offscreen.height = PRESET_H;
      const ctx = offscreen.getContext("2d")!;
      selectedPreset.render(ctx, PRESET_W, PRESET_H, presetColors, presetTitle, presetPhotoRect, presetPhotoShape);

      const blob = await new Promise<Blob>((res) => offscreen.toBlob((b) => res(b!), "image/png"));
      const path = `${user!.id}/${eventId}/preset-${Date.now()}.png`;
      const { error: uploadErr } = await supabase.storage.from("dp-templates").upload(path, blob);
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from("dp-templates").getPublicUrl(path);

      const { error } = await supabase.from("dp_templates" as any).insert({
        event_id: eventId,
        user_id: user!.id,
        name: presetName.trim(),
        template_image_url: urlData.publicUrl,
        photo_x: Math.round(presetPhotoRect.x),
        photo_y: Math.round(presetPhotoRect.y),
        photo_width: Math.round(presetPhotoRect.w),
        photo_height: Math.round(presetPhotoRect.h),
        photo_shape: presetPhotoShape,
        is_preset: true,
      } as any);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["dp-templates", eventId] });
      setPresetName("");
      setSelectedPreset(null);
      toast({ title: "Template saved!" });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ─── Save upload ───
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

      {/* Existing templates */}
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
                <button onClick={() => handleDelete(t.id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-destructive text-white rounded-full p-1 transition">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Share link:</span>
            <button className="text-primary underline truncate" onClick={() => { navigator.clipboard.writeText(shareUrl); toast({ title: "Link copied!" }); }}>
              {shareUrl}
            </button>
          </div>
        </div>
      )}

      {/* Create new template with tabs */}
      <div className="border rounded-lg p-4 space-y-3">
        <p className="text-xs font-medium text-muted-foreground">Create New Template</p>

        <Tabs defaultValue="presets">
          <TabsList className="w-full">
            <TabsTrigger value="presets" className="flex-1 text-xs gap-1">
              <Sparkles className="h-3 w-3" /> Pre-made Designs
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex-1 text-xs gap-1">
              <ImagePlus className="h-3 w-3" /> Upload Your Own
            </TabsTrigger>
          </TabsList>

          {/* ─── PRESETS TAB ─── */}
          <TabsContent value="presets" className="space-y-3 mt-3">
            <div>
              <Label className="text-xs">Template Name</Label>
              <Input value={presetName} onChange={(e) => setPresetName(e.target.value)} placeholder="e.g. My Custom Frame" className="text-sm h-9 mt-1" />
            </div>

            {/* Design picker */}
            <div>
              <Label className="text-xs mb-1.5 block">Choose a Design</Label>
              <div className="grid grid-cols-3 gap-2">
                {presetDesigns.map((d) => {
                  const thumbCanvas = document.createElement("canvas");
                  thumbCanvas.width = 120;
                  thumbCanvas.height = 120;
                  const tctx = thumbCanvas.getContext("2d");
                  if (tctx) d.render(tctx, 120, 120, d.defaultColors, "", { x: 35, y: 25, w: 50, h: 50 }, "circle");
                  return (
                    <button
                      key={d.id}
                      onClick={() => {
                        setSelectedPreset(d);
                        setPresetColors(d.defaultColors);
                        setPresetPhotoRect({ x: 150, y: 80, w: 200, h: 200 });
                      }}
                      className={`rounded-lg border-2 overflow-hidden transition-all ${selectedPreset?.id === d.id ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"}`}
                    >
                      <canvas ref={(el) => {
                        if (el) {
                          el.width = 120;
                          el.height = 120;
                          const c = el.getContext("2d");
                          if (c) d.render(c, 120, 120, d.defaultColors, "", { x: 35, y: 25, w: 50, h: 50 }, "circle");
                        }
                      }} className="w-full h-20" />
                      <p className="text-[10px] font-medium p-1 truncate">{d.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedPreset && (
              <>
                {/* Event title */}
                <div>
                  <Label className="text-xs">Event Title on Template</Label>
                  <Input value={presetTitle} onChange={(e) => setPresetTitle(e.target.value)} placeholder="Your Event Name" className="text-sm h-9 mt-1" />
                </div>

                {/* Color customization */}
                <div>
                  <button onClick={() => setShowColorPicker(!showColorPicker)} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition">
                    <Palette className="h-3 w-3" /> Customize Colors
                    {showColorPicker ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                  {showColorPicker && (
                    <div className="mt-2 space-y-2">
                      {/* Quick presets */}
                      <div className="flex flex-wrap gap-1.5">
                        {COLOR_PRESETS.map((cp) => (
                          <button
                            key={cp.name}
                            onClick={() => setPresetColors(cp)}
                            className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] hover:bg-muted transition"
                          >
                            <span className="w-3 h-3 rounded-full border" style={{ background: cp.primary }} />
                            {cp.name}
                          </button>
                        ))}
                      </div>
                      {/* Individual pickers */}
                      <div className="grid grid-cols-2 gap-2">
                        {(["primary", "secondary", "accent", "text"] as const).map((key) => (
                          <div key={key} className="flex items-center gap-2">
                            <input
                              type="color"
                              value={presetColors[key]}
                              onChange={(e) => setPresetColors((prev) => ({ ...prev, [key]: e.target.value }))}
                              className="w-6 h-6 rounded border cursor-pointer"
                            />
                            <span className="text-[10px] capitalize text-muted-foreground">{key}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Shape & size */}
                <div className="flex flex-wrap gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Photo Shape</Label>
                    <div className="flex gap-1">
                      <Button variant={presetPhotoShape === "circle" ? "default" : "outline"} size="sm" onClick={() => setPresetPhotoShape("circle")} className="text-xs h-7">
                        <Circle className="h-3 w-3 mr-1" /> Circle
                      </Button>
                      <Button variant={presetPhotoShape === "square" ? "default" : "outline"} size="sm" onClick={() => setPresetPhotoShape("square")} className="text-xs h-7">
                        <Square className="h-3 w-3 mr-1" /> Square
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1 flex-1 min-w-[140px]">
                    <Label className="text-xs">Photo Size: {presetPhotoSize}px</Label>
                    <Slider value={[presetPhotoSize]} onValueChange={([v]) => setPresetPhotoSize(v)} min={80} max={300} step={10} className="mt-1" />
                  </div>
                </div>

                {/* Live preview */}
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-0.5"><Move className="h-3 w-3" /> Drag to reposition</span>
                    <span className="inline-flex items-center gap-0.5 md:hidden"><ZoomIn className="h-3 w-3" /> Pinch to resize</span>
                  </p>
                  <canvas
                    ref={presetCanvasRef}
                    className="border rounded-lg cursor-move max-w-full touch-none"
                    style={{ maxHeight: 400 }}
                    onMouseDown={handlePresetMouseDown}
                    onMouseMove={handlePresetMouseMove}
                    onMouseUp={() => setPresetDragging(false)}
                    onMouseLeave={() => setPresetDragging(false)}
                    onTouchStart={handlePresetTouchStart}
                    onTouchMove={handlePresetTouchMove}
                    onTouchEnd={handlePresetTouchEnd}
                  />
                </div>

                <Button onClick={savePreset} disabled={saving} size="sm" className="text-xs">
                  {saving ? "Saving..." : "Save Template"}
                </Button>
              </>
            )}
          </TabsContent>

          {/* ─── UPLOAD TAB ─── */}
          <TabsContent value="upload" className="space-y-3 mt-3">
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
                  <Move className="h-3 w-3" /> Drag the orange zone to position photo
                  <span className="hidden max-[768px]:inline-flex items-center gap-0.5 ml-1"><ZoomIn className="h-3 w-3" /> Pinch to resize</span>
                </p>
                <canvas
                  ref={canvasRef}
                  className="border rounded-lg cursor-move max-w-full touch-none"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={() => setDragging(false)}
                  onMouseLeave={() => setDragging(false)}
                  onTouchStart={handleCanvasTouchStart}
                  onTouchMove={handleCanvasTouchMove}
                  onTouchEnd={handleCanvasTouchEnd}
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
                    <Input type="number" value={Math.round(photoRect.w)} onChange={(e) => setPhotoRect((prev) => ({ ...prev, w: +e.target.value, h: +e.target.value }))} className="w-20 h-7 text-xs" />
                  </div>
                </div>
                <Button onClick={handleSave} disabled={saving} size="sm" className="text-xs">
                  {saving ? "Saving..." : "Save Template"}
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DpTemplateManager;
