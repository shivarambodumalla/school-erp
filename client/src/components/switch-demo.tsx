"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function SwitchDemo() {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Email notifications</Label>
                <Switch id="notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="marketing">Marketing emails</Label>
                <Switch id="marketing" />
            </div>
        </div>
    );
}
