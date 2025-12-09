
'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center text-center">
        <Card className="max-w-md">
            <CardHeader>
                <div className="mx-auto bg-muted rounded-full h-16 w-16 flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle className="mt-4 text-3xl font-bold">404 - Page Not Found</CardTitle>
                <CardDescription>
                    Sorry, we couldn&apos;t find the page you were looking for.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/">Go Back Home</Link>
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
