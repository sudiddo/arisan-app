"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import { Label } from "@/components/ui/label";

type QRCodeInviteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claimToken: string;
};

export function QRCodeInviteDialog({
  open,
  onOpenChange,
  claimToken,
}: QRCodeInviteDialogProps) {
  const [copied, setCopied] = useState(false);
  const [qrSize, setQrSize] = useState(200);

  const inviteLink = `${window.location.origin}/claim?token=${claimToken}`;

  useEffect(() => {
    const updateQRSize = () => {
      setQrSize(window.innerWidth < 640 ? 160 : 200);
    };

    updateQRSize();
    window.addEventListener("resize", updateQRSize);
    return () => window.removeEventListener("resize", updateQRSize);
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Invite link copied to clipboard");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Failed to copy invite link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Invite Member
          </DialogTitle>
          <DialogDescription>
            Share this invite link or QR code with people you want to add to
            your group.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="flex flex-col items-center space-y-3">
            <div className="rounded-lg border border-border p-4 bg-white shadow-sm">
              <QRCode value={inviteLink} size={qrSize} />
            </div>
            <p className="text-sm text-muted-foreground">
              Scan this QR code to join
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-link" className="text-sm font-medium">
              Invite Link
            </Label>
            <div className="flex space-x-2">
              <Input
                id="invite-link"
                value={inviteLink}
                readOnly
                className="font-mono text-sm truncate"
                aria-label="Invite link"
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="icon"
                className="shrink-0"
                aria-label={copied ? "Copied" : "Copy to clipboard"}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
