"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useGroups } from "@/context/GroupContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { GroupCard } from "@/components/groups/GroupCard";
import { toast } from "sonner";

type ActivityItem = {
  id: string;
  type: "join" | "payment" | "creation";
  groupId: string;
  groupName: string;
  date: string;
  message: string;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { groups, isLoading, error, refetchGroups } = useGroups();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (status !== "authenticated") return;

      try {
        setActivityLoading(true);
        const response = await fetch("/api/activities");

        if (!response.ok) {
          throw new Error("Failed to fetch activities");
        }

        const data = await response.json();
        setActivities(data);
      } catch (error) {
        toast.error("Failed to load activity data");
      } finally {
        setActivityLoading(false);
      }
    };

    fetchActivities();
  }, [status]);

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Welcome, {session?.user?.name}</h1>
          <p className="text-muted-foreground">
            Manage your ROSCA groups and track contributions
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-3">
          <section className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your ROSCA Groups</h2>
              <Button asChild>
                <Link href="/groups/new">Create Group</Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-32 animate-pulse rounded-lg border bg-muted/50"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
                {error}
              </div>
            ) : groups.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {groups.map((group) => (
                  <GroupCard
                    key={group.id}
                    id={group.id}
                    name={group.name}
                    monthlyAmount={group.monthlyAmount}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
                <h3 className="text-lg font-medium">No groups yet</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Create your first ROSCA group to get started
                </p>
                <Button asChild>
                  <Link href="/groups/new">Create Your First Group</Link>
                </Button>
              </div>
            )}
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-semibold">Recent Activity</h2>

            {activityLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-lg border bg-muted/50"
                  />
                ))}
              </div>
            ) : activities.length > 0 ? (
              <div className="divide-y rounded-lg border">
                {activities.map((activity) => (
                  <div key={activity.id} className="p-3">
                    <div className="mb-1 text-sm font-medium">
                      <Link
                        href={`/groups/${activity.groupId}`}
                        className="hover:underline"
                      >
                        {activity.groupName}
                      </Link>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.message}
                    </p>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {new Date(activity.date).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No recent activity
                </p>
              </div>
            )}

            <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
              <h3 className="font-medium">Quick Actions</h3>
              <div className="grid gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href="/groups/new">Create New Group</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/claim">Join a Group</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}
