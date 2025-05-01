"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { formatMonthYear } from "@/lib/rounds";
import { useMembers, type Member } from "@/hooks/useMembers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type CompleteRoundProps = {
  params: {
    id: string;
    roundId: string;
  };
};

type Round = {
  id: string;
  month: string;
  is_completed: boolean;
  winner_id: string | null;
  winner?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export default function CompleteRoundPage({ params }: CompleteRoundProps) {
  const router = useRouter();
  const { id: groupId, roundId } = params;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [round, setRound] = useState<Round | null>(null);
  const [selectedWinner, setSelectedWinner] = useState<string>("");
  const { members, loading: membersLoading } = useMembers(groupId);

  // Fetch round details
  useEffect(() => {
    const fetchRound = async () => {
      try {
        const response = await fetch(`/api/groups/${groupId}/rounds`);

        if (!response.ok) {
          throw new Error("Failed to fetch round details");
        }

        const rounds = await response.json();
        const currentRound = rounds.find((r: Round) => r.id === roundId);

        if (!currentRound) {
          toast.error("Round not found");
          router.push(`/groups/${groupId}`);
          return;
        }

        setRound(currentRound);

        if (currentRound.winner_id) {
          setSelectedWinner(currentRound.winner_id);
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to load round details");
        }
        router.push(`/groups/${groupId}`);
      }
    };

    fetchRound();
  }, [groupId, roundId, router]);

  const completeRound = async () => {
    try {
      setIsSubmitting(true);

      const response = await fetch(
        `/api/groups/${groupId}/rounds/${roundId}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ winnerId: selectedWinner || null }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to complete round");
      }

      toast.success("Round completed successfully");
      router.push(`/groups/${groupId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!round || membersLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const roundDate = new Date(round.month);

  return (
    <div className="container mx-auto max-w-2xl py-6">
      <h1 className="mb-6 text-2xl font-bold">Complete Round</h1>

      <Card>
        <CardHeader>
          <CardTitle>Round: {formatMonthYear(roundDate)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label htmlFor="winner">Select Winner (Optional)</Label>
              <Select value={selectedWinner} onValueChange={setSelectedWinner}>
                <SelectTrigger id="winner" className="w-full">
                  <SelectValue placeholder="Select a winner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Winner</SelectItem>
                  {members.map((member: Member) => (
                    <SelectItem key={member.userId} value={member.userId || ""}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={completeRound} disabled={isSubmitting}>
                {isSubmitting ? "Completing..." : "Complete Round"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
