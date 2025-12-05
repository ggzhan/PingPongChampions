
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function RefreshButton() {
  const router = useRouter();

  return (
    <Button variant="secondary" onClick={() => router.refresh()}>
      <RefreshCw className="mr-2 h-4 w-4" />
      Refresh
    </Button>
  );
}
