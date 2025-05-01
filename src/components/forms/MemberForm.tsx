"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MemberFormValues, memberSchema } from "@/lib/schemas/group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import QRCode from "react-qr-code";

interface MemberFormProps {
  groupId: string;
  onSuccess?: () => void;
}

export function MemberForm({ groupId, onSuccess }: MemberFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [inviteData, setInviteData] = useState<{
    claimToken: string;
    claimLink: string;
  } | null>(null);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(values: MemberFormValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add member");
      }

      const data = await response.json();
      setInviteData({
        claimToken: data.claimToken,
        claimLink: data.claimLink,
      });

      form.reset();
      toast.success("Member added successfully!");
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add member"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCopyLink() {
    if (inviteData?.claimLink) {
      const fullLink = `${window.location.origin}${inviteData.claimLink}`;
      navigator.clipboard.writeText(fullLink);
      toast.success("Link copied to clipboard!");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Member</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>
            Add a new member to your savings group
          </DialogDescription>
        </DialogHeader>

        {inviteData ? (
          <div className="flex flex-col items-center space-y-4 py-4">
            <p className="text-center font-medium">
              Share this QR code with the member to join
            </p>
            <div className="p-3 bg-white rounded-lg">
              <QRCode
                value={`${window.location.origin}${inviteData.claimLink}`}
                size={200}
              />
            </div>
            <p className="text-sm text-muted-foreground break-all">
              {window.location.origin}
              {inviteData.claimLink}
            </p>
            <DialogFooter className="w-full">
              <Button onClick={handleCopyLink} className="w-full sm:w-auto">
                Copy Link
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setInviteData(null);
                  setOpen(false);
                }}
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Member Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter member's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Member"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
