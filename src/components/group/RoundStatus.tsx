"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { formatMonthYear } from "@/lib/rounds";
import { Badge } from "@/components/ui/badge";

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

type RoundStatusProps = {
  groupId: string;
  isCreator: boolean;
  refetchGroup?: () => Promise<void>;
};

export default function RoundStatus({
  groupId,
  isCreator,
  refetchGroup,
}: RoundStatusProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [isNewRoundAvailable, setIsNewRoundAvailable] = useState(false);

  const fetchCurrentRoundStatus = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/rounds/current`);
      if (response.ok) {
        const data = await response.json();
        setCurrentRound(data.current_round);
        setIsNewRoundAvailable(data.is_new_round_available);
      }
    } catch (error) {
      console.error("Failed to fetch round status", error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCurrentRoundStatus();
  }, [groupId]);

  const startNewRound = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/groups/${groupId}/rounds`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create new round");
      }

      await fetchCurrentRoundStatus();
      if (refetchGroup) await refetchGroup();
      toast.success("New round started successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!currentRound) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Round Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading round information...</p>
        </CardContent>
      </Card>
    );
  }

  const roundDate = new Date(currentRound.month);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Current Round: {formatMonthYear(roundDate)}</span>
          {currentRound.is_completed ? (
            <Badge className="bg-green-500">Completed</Badge>
          ) : (
            <Badge className="bg-yellow-500">In Progress</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {currentRound.winner ? (
            <div>
              <p className="font-medium">Winner</p>
              <p>{currentRound.winner.name}</p>
            </div>
          ) : currentRound.is_completed ? (
            <p>No winner selected for this round.</p>
          ) : (
            <p>Winner will be selected when the round is completed.</p>
          )}

          {isCreator && !currentRound.is_completed && (
            <Button
              onClick={() =>
                router.push(
                  `/groups/${groupId}/rounds/${currentRound.id}/complete`
                )
              }
              variant="outline"
            >
              Complete Round
            </Button>
          )}

          {isCreator && isNewRoundAvailable && (
            <div className="mt-4">
              <Button
                onClick={startNewRound}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Starting..." : "Start New Round"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
