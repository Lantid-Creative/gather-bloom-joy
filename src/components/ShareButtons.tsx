import { Share2, Twitter, Facebook, Link as LinkIcon, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShareButtonsProps {
  title: string;
  url?: string;
}

const ShareButtons = ({ title, url }: ShareButtonsProps) => {
  const { toast } = useToast();
  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link copied to clipboard!" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full flex items-center gap-1.5">
          <Share2 className="h-3.5 w-3.5" /> Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, "_blank")}>
          <Twitter className="h-4 w-4 mr-2" /> Twitter / X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank")}>
          <Facebook className="h-4 w-4 mr-2" /> Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, "_blank")}>
          <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyLink}>
          <LinkIcon className="h-4 w-4 mr-2" /> Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButtons;
