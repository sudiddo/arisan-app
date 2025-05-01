"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";

type Group = {
  id: string;
  name: string;
  monthlyAmount: number;
  rules?: string | null;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
};

type GroupContextType = {
  groups: Group[];
  activeGroupId: string | null;
  setActiveGroupId: (id: string | null) => void;
  isLoading: boolean;
  error: string | null;
  refetchGroups: () => Promise<void>;
};

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    if (status !== "authenticated") return;

    try {
      setIsLoading(true);
      const response = await fetch("/api/groups");

      if (!response.ok) {
        throw new Error("Failed to fetch groups");
      }

      const data = await response.json();
      setGroups(data);

      if (data.length > 0 && !activeGroupId) {
        setActiveGroupId(data[0].id);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchGroups();
    }
  }, [status]);

  return (
    <GroupContext.Provider
      value={{
        groups,
        activeGroupId,
        setActiveGroupId,
        isLoading,
        error,
        refetchGroups: fetchGroups,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export function useGroups() {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error("useGroups must be used within a GroupProvider");
  }
  return context;
}
