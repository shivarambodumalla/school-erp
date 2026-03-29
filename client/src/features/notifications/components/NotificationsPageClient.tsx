'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InboxTab } from './InboxTab'
import { SendNotificationTab } from './SendNotificationTab'

export function NotificationsPageClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage and send notifications
        </p>
      </div>
      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox" className="min-h-[44px]">
            Inbox
          </TabsTrigger>
          <TabsTrigger value="send" className="min-h-[44px]">
            Send
          </TabsTrigger>
        </TabsList>
        <TabsContent value="inbox">
          <InboxTab />
        </TabsContent>
        <TabsContent value="send">
          <SendNotificationTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
