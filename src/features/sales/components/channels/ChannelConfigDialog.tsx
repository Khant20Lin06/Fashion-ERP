"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings2, ShieldCheck } from "lucide-react";
import type { EcommerceChannel, ChannelStatus } from "../../types/channels.types";
import { useUpdateChannel } from "../../hooks/useChannels";

interface Props {
  channel: EcommerceChannel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChannelConfigDialog({ channel, open, onOpenChange }: Props) {
  const updateMutation = useUpdateChannel();

  const [status, setStatus] = useState<ChannelStatus>("ACTIVE");
  const [apiKey, setApiKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [stockBuffer, setStockBuffer] = useState(2);

  useEffect(() => {
    if (channel) {
      setStatus(channel.status);
      setApiKey(channel.apiKey || "");
      setWebhookSecret(channel.webhookSecret || "");
      setStockBuffer(channel.stockBuffer || 0);
    }
  }, [channel]);

  if (!channel) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync({
      id: channel.id,
      input: {
        status,
        apiKey: apiKey.trim() || undefined,
        webhookSecret: webhookSecret.trim() || undefined,
        stockBuffer: Number(stockBuffer) || 0,
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Settings2 className="w-5 h-5 text-primary" />
            Configure {channel.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label className="text-xs">Integration Status</Label>
            <Select value={status} onValueChange={(val) => setStatus(val as ChannelStatus)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active (Live Sync)</SelectItem>
                <SelectItem value="PAUSED">Paused (Temporary Hold)</SelectItem>
                <SelectItem value="DISCONNECTED">Disconnected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Safety Stock Buffer (Units)</Label>
            <Input
              type="number"
              min={0}
              value={stockBuffer}
              onChange={(e) => setStockBuffer(parseInt(e.target.value, 10) || 0)}
              className="mt-1"
              placeholder="e.g. 2"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Deducts {stockBuffer} units from online catalog feed to prevent overselling of high-traffic items.
            </p>
          </div>

          <div>
            <Label className="text-xs">API Key / Access Token</Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter channel API token"
              className="mt-1 font-mono"
            />
          </div>

          <div>
            <Label className="text-xs">Webhook Secret Verification</Label>
            <Input
              type="password"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder="Enter webhook secret"
              className="mt-1 font-mono"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
            >
              Save Configuration
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
