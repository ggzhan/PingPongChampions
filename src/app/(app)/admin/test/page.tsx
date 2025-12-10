"use client";

import { useState } from "react";
import { useUser } from "@/context/user-context";
import { useRouter } from "next/navigation";
import {
  getLeagues,
  getLeagueById,
  getAllUsers,
  getUserById,
  getPlayerStats,
} from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function TestEndpointsPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [leagueId, setLeagueId] = useState("");
  const [userId, setUserId] = useState("");
  const [playerId, setPlayerId] = useState("");

  const isSuperAdmin = user?.email === 'markus.koenigreich@gmail.com';

  if (userLoading) {
    return <div>Loading...</div>;
  }

  if (!isSuperAdmin) {
    router.push('/');
    return null;
  }

  const handleTest = async (testFn: () => Promise<any>) => {
    setLoading(true);
    setOutput(null);
    try {
      const result = await testFn();
      setOutput(result);
    } catch (error: any) {
      setOutput({ error: error.message, stack: error.stack });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Fetching Test Panel</CardTitle>
          <CardDescription>Use this page to test the data fetching functions from `lib/data.ts`.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Get All Leagues</h3>
            <Button onClick={() => handleTest(getLeagues)}>Run getLeagues()</Button>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-semibold">Get All Users</h3>
            <Button onClick={() => handleTest(getAllUsers)}>Run getAllUsers()</Button>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-semibold">Get League by ID</h3>
            <div className="flex gap-2 items-end">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="leagueId">League ID</Label>
                <Input id="leagueId" value={leagueId} onChange={(e) => setLeagueId(e.target.value)} placeholder="Enter league ID" />
              </div>
              <Button onClick={() => handleTest(() => getLeagueById(leagueId))} disabled={!leagueId}>Run getLeagueById()</Button>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-semibold">Get User by ID</h3>
            <div className="flex gap-2 items-end">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="userId">User ID</Label>
                <Input id="userId" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Enter user ID" />
              </div>
              <Button onClick={() => handleTest(() => getUserById(userId))} disabled={!userId}>Run getUserById()</Button>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-semibold">Get Player Stats</h3>
            <div className="flex gap-2 items-end">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="leagueIdStats">League ID</Label>
                <Input id="leagueIdStats" value={leagueId} onChange={(e) => setLeagueId(e.target.value)} placeholder="Enter league ID" />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="playerId">Player ID</Label>
                <Input id="playerId" value={playerId} onChange={(e) => setPlayerId(e.target.value)} placeholder="Enter player ID" />
              </div>
              <Button onClick={() => handleTest(() => getPlayerStats(leagueId, playerId))} disabled={!leagueId || !playerId}>Run getPlayerStats()</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Output</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <pre className="p-4 bg-muted rounded-md text-sm overflow-auto max-h-[600px]">
              {JSON.stringify(output, null, 2) || "Click a button to see the output here."}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
