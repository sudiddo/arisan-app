import { useState, useEffect } from "react";

export type Member = {
  id: string;
  name: string;
  userId: string | null;
  isAdmin: boolean;
  email?: string;
  paymentStatus?: {
    isPaid: boolean;
  };
};

export function useMembers(groupId: string) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!groupId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/groups/${groupId}/members`);

        if (!response.ok) {
          throw new Error("Failed to fetch members");
        }

        const data = await response.json();
        setMembers(data);
      } catch (err) {
        console.error("Error fetching members:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [groupId]);

  return { members, loading, error };
}
