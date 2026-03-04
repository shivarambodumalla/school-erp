import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { TabsDemo } from "@/components/tabs-demo";
import { SwitchDemo } from "@/components/switch-demo";

export default async function Home() {
  let apiMessage = "API not connected";
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/health`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      apiMessage = data.message;
    }
  } catch {
    // API not reachable
  }

  return (
    <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      {/* Top bar */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-5xl mx-auto space-y-10">
        {/* Hero */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Starter App
          </h1>
          <p className="text-muted-foreground text-lg">
            Next.js 14 · Node.js API · PostgreSQL · shadcn/ui
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Badge>v1.0</Badge>
            <Badge variant="secondary">Stable</Badge>
            <Badge variant="outline">Open Source</Badge>
            <Badge variant="destructive">Hot</Badge>
          </div>
        </div>

        <Separator />

        {/* API Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>API Connection</CardTitle>
            <CardDescription>
              Real-time health check from the Express backend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm font-semibold">
                Status:{" "}
                <span
                  className={
                    apiMessage === "API is running"
                      ? "text-green-600"
                      : "text-red-500"
                  }
                >
                  {apiMessage}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Component Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Buttons Card */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>All button variants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button disabled>Disabled</Button>
              </div>
            </CardContent>
          </Card>

          {/* Form Elements Card */}
          <Card>
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
              <CardDescription>Inputs, labels, and switches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>
              <SwitchDemo />
            </CardContent>
            <CardFooter>
              <Button className="w-full">Submit</Button>
            </CardFooter>
          </Card>

          {/* Tabs Card */}
          <Card>
            <CardHeader>
              <CardTitle>Tabs</CardTitle>
              <CardDescription>Switch between content panels</CardDescription>
            </CardHeader>
            <CardContent>
              <TabsDemo />
            </CardContent>
          </Card>

          {/* Alerts & Avatars Card */}
          <Card>
            <CardHeader>
              <CardTitle>Alerts &amp; Avatars</CardTitle>
              <CardDescription>
                Informational alerts and user avatars
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                  This is a default alert to keep you informed.
                </AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Something went wrong. Please try again later.
                </AlertDescription>
              </Alert>
              <Separator />
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    SV
                  </AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    AB
                  </AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback className="bg-accent text-accent-foreground">
                    CD
                  </AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    EF
                  </AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Color Palette Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Palette</CardTitle>
            <CardDescription>
              Visual preview of all theme color tokens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {[
                { name: "Primary", bg: "bg-primary", fg: "text-primary-foreground" },
                { name: "Secondary", bg: "bg-secondary", fg: "text-secondary-foreground" },
                { name: "Accent", bg: "bg-accent", fg: "text-accent-foreground" },
                { name: "Muted", bg: "bg-muted", fg: "text-muted-foreground" },
                { name: "Destructive", bg: "bg-destructive", fg: "text-destructive-foreground" },
                { name: "Card", bg: "bg-card", fg: "text-card-foreground" },
                { name: "Background", bg: "bg-background border", fg: "text-foreground" },
                { name: "Border", bg: "bg-border", fg: "text-foreground" },
                { name: "Input", bg: "bg-input", fg: "text-foreground" },
                { name: "Ring", bg: "bg-ring", fg: "text-primary-foreground" },
                { name: "Chart 1", bg: "bg-chart-1", fg: "text-white" },
                { name: "Chart 2", bg: "bg-chart-2", fg: "text-white" },
              ].map((color) => (
                <div
                  key={color.name}
                  className={`${color.bg} ${color.fg} rounded-lg p-3 text-center text-xs font-medium`}
                >
                  {color.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground pb-8">
          Toggle the 🌙 / ☀️ button in the top-right corner to switch themes.
        </p>
      </div>
    </main>
  );
}
