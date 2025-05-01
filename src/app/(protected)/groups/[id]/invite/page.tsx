"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { QRCodeInviteDialog } from "@/components/groups/QRCodeInviteDialog";
import { addMemberSchema, type AddMemberFormValues } from "@/lib/schemas/group";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function InviteMemberPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [isCreator, setIsCreator] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [inviteToken, setInviteToken] = useState("");
  const groupId = params.id as string;

  const form = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  useEffect(() => {
    const checkCreatorStatus = async () => {
      try {
        const response = await fetch(`/api/groups/${groupId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch group details");
        }

        const data = await response.json();
        setIsCreator(data.creatorId === session?.user?.id);

        if (data.creatorId !== session?.user?.id) {
          toast.error("Only the group creator can invite members");
          router.push(`/groups/${groupId}`);
        }
      } catch (err) {
        console.error("Error checking creator status:", err);
        toast.error("Error loading group information");
        router.push("/groups");
      }
    };

    if (session?.user?.id) {
      checkCreatorStatus();
    }
  }, [groupId, session, router]);

  const onSubmit = async (data: AddMemberFormValues) => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add member");
      }

      const result = await response.json();
      setInviteToken(result.claimToken);
      toast.success("Invitation created successfully");
      setShowQRCode(true);
      form.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-6">
      <h1 className="mb-6 text-2xl font-bold">Invite Member</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter member's name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter member's email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Personalized Message (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add a personal note for the invitation"
                    className="h-24 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/groups/${groupId}`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !isCreator}>
              {isSubmitting ? "Creating..." : "Generate Invite"}
            </Button>
          </div>
        </form>
      </Form>

      {inviteToken && (
        <QRCodeInviteDialog
          open={showQRCode}
          onOpenChange={setShowQRCode}
          groupId={groupId}
          claimToken={inviteToken}
        />
      )}
    </div>
  );
}
