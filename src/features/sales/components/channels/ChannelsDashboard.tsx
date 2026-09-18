"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  RefreshCw,
  Rss,
  Settings2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  Code,
  Share2,
} from "lucide-react";
import { useChannels, useTriggerSync } from "../../hooks/useChannels";
import { ChannelConfigDialog } from "./ChannelConfigDialog";
import { FeedPreviewDialog } from "./FeedPreviewDialog";
import type { EcommerceChannel } from "../../types/channels.types";
import { formatDistanceToNow } from "date-fns";

export function ChannelsDashboard() {
  const { data: channels = [], isLoading, refetch } = useChannels();
  const syncMutation = useTriggerSync();

  const [configChannel, setConfigChannel] = useState<EcommerceChannel | null>(null);
  const [previewChannelCode, setPreviewChannelCode] = useState<string | null>(null);

  const totalSyncedOrders = channels.reduce(
    (sum, c) => sum + (c.syncedOrdersCount || 0),
    0
  );
  const activeChannelsCount = channels.filter((c) => c.status === "ACTIVE").length;

  const getChannelIcon = (code: string) => {
    switch (code) {
      case "TIKTOK":
        return "🎵";
      case "FACEBOOK":
        return "📱";
      case "TELEGRAM":
        return "✈️";
      default:
        return "🔌";
    }
  };

  const getChannelColor = (code: string) => {
    switch (code) {
      case "TIKTOK":
        return "from-rose-500/20 via-rose-500/5 to-transparent border-rose-500/30";
      case "FACEBOOK":
        return "from-blue-500/20 via-blue-500/5 to-transparent border-blue-500/30";
      case "TELEGRAM":
        return "from-sky-500/20 via-sky-500/5 to-transparent border-sky-500/30";
      default:
        return "from-purple-500/20 via-purple-500/5 to-transparent border-purple-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Omnichannel & Social Commerce</h1>
          <p className="text-sm text-muted-foreground">
            Connect and synchronize inventory, product catalog feeds, and orders with TikTok Shop, Meta Commerce, Telegram & Webhooks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setPreviewChannelCode("ALL")}
            className="gap-1.5"
          >
            <Rss className="w-3.5 h-3.5" />
            Live Catalog Feed
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
              Connected Channels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center justify-between">
              <span>{activeChannelsCount} / {channels.length}</span>
              <Store className="w-5 h-5 text-primary opacity-80" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Live active synchronization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
              Total Ingested Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center justify-between">
              <span>{totalSyncedOrders}</span>
              <ShoppingBag className="w-5 h-5 text-emerald-500 opacity-80" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Orders auto-routed into ERP</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
              Oversell Protection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center justify-between">
              <span className="text-blue-600 dark:text-blue-400">Buffer Active</span>
              <ShieldCheck className="w-5 h-5 text-blue-500 opacity-80" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Safety stock subtracted from feeds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
              Feed Standards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center justify-between">
              <span>TikTok & Meta</span>
              <Share2 className="w-5 h-5 text-rose-500 opacity-80" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Real-time JSON/Catalog API</p>
          </CardContent>
        </Card>
      </div>

      {/* Channel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {channels.map((channel) => (
          <Card
            key={channel.id}
            className={`border bg-gradient-to-b ${getChannelColor(channel.code)} shadow-sm transition-all hover:shadow-md`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl p-2 rounded-xl bg-background border shadow-xs">
                    {getChannelIcon(channel.code)}
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">{channel.name}</CardTitle>
                    <p className="text-xs font-mono text-muted-foreground">{channel.code}</p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={
                    channel.status === "ACTIVE"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium"
                      : channel.status === "PAUSED"
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium"
                      : "border-muted text-muted-foreground"
                  }
                >
                  {channel.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Channel Stats Row */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-background/80 border text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Orders Synced</span>
                  <span className="font-bold text-sm">{channel.syncedOrdersCount}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Safety Buffer</span>
                  <span className="font-bold text-sm">{channel.stockBuffer} units</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Last Synced</span>
                  <span className="font-medium text-[11px] text-foreground">
                    {channel.lastSyncedAt
                      ? formatDistanceToNow(new Date(channel.lastSyncedAt), { addSuffix: true })
                      : "Never"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  size="sm"
                  variant="default"
                  className="h-8 gap-1 text-xs"
                  onClick={() => syncMutation.mutate(channel.id)}
                  disabled={syncMutation.isPending}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sync Catalog Now
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1 text-xs bg-background"
                  onClick={() => setPreviewChannelCode(channel.code)}
                >
                  <Rss className="w-3.5 h-3.5" />
                  View Feed
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 gap-1 text-xs ml-auto"
                  onClick={() => setConfigChannel(channel)}
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Developer Webhook Integration Guide */}
      <Card className="border bg-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Code className="w-4 h-4 text-primary" />
            Automated Webhook Order Ingestion Endpoint
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <p className="text-muted-foreground">
            TikTok Shop webhooks, Meta Graph webhooks, and Telegram Bot workers can push live orders directly into the ERP inventory ledger using:
          </p>
          <div className="p-3 rounded-lg bg-zinc-950 text-zinc-200 font-mono text-[11px] overflow-x-auto space-y-1">
            <p className="text-emerald-400">POST /api/v1/channels/sync-orders</p>
            <p className="text-zinc-500">{"{"}</p>
            <p className="pl-4 text-zinc-300">"channelCode": "TIKTOK",</p>
            <p className="pl-4 text-zinc-300">"externalOrderId": "TTS-9920194",</p>
            <p className="pl-4 text-zinc-300">"customerName": "Ma Su Mon",</p>
            <p className="pl-4 text-zinc-300">"customerPhone": "09987654321",</p>
            <p className="pl-4 text-zinc-300">"items": [</p>
            <p className="pl-8 text-zinc-400">{"{ \"productVariantId\": \"uuid\", \"quantity\": 1, \"unitPrice\": 35000 }"}</p>
            <p className="pl-4 text-zinc-300">],</p>
            <p className="pl-4 text-zinc-300">"totalAmount": 35000</p>
            <p className="text-zinc-500">{"}"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <ChannelConfigDialog
        channel={configChannel}
        open={Boolean(configChannel)}
        onOpenChange={(open) => !open && setConfigChannel(null)}
      />

      <FeedPreviewDialog
        channelCode={previewChannelCode ?? undefined}
        open={Boolean(previewChannelCode)}
        onOpenChange={(open) => !open && setPreviewChannelCode(null)}
      />
    </div>
  );
}
