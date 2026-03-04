"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TabsDemo() {
    return (
        <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4 text-sm text-muted-foreground">
                This is the overview panel. It gives you a summary of the key metrics and recent activity.
            </TabsContent>
            <TabsContent value="analytics" className="mt-4 text-sm text-muted-foreground">
                Analytics data will appear here. Track performance, engagement, and growth.
            </TabsContent>
            <TabsContent value="settings" className="mt-4 text-sm text-muted-foreground">
                Manage your preferences, notifications, and account settings here.
            </TabsContent>
        </Tabs>
    );
}
