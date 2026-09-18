"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Check, ExternalLink, Rss } from "lucide-react";
import { useCatalogFeed } from "../../hooks/useChannels";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelCode?: string;
}

export function FeedPreviewDialog({ open, onOpenChange, channelCode }: Props) {
  const { data, isLoading } = useCatalogFeed(channelCode);
  const [copied, setCopied] = React.useState(false);

  const feedUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/v1/channels/catalog-feed?channel=${channelCode || "TIKTOK"}`
    : "";

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(feedUrl);
    setCopied(true);
    toast.success("Feed URL copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Rss className="w-5 h-5 text-rose-500" />
            Live Catalog Feed ({channelCode || "ALL"})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Feed URL Banner */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg border bg-muted/40">
            <div className="space-y-0.5 overflow-hidden">
              <p className="text-xs font-semibold">Feed URL for TikTok Shop / Meta Commerce Catalog</p>
              <p className="text-xs font-mono text-muted-foreground truncate">{feedUrl}</p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCopyUrl}
              className="gap-1.5 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy URL"}
            </Button>
          </div>

          {/* Feed stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Catalog Products: <strong className="text-foreground">{data?.totalProducts ?? 0}</strong></span>
            <span>Generated: {data?.generatedAt ? new Date(data.generatedAt).toLocaleTimeString() : "-"}</span>
          </div>

          {/* Feed Items Table */}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 text-xs">
                  <TableHead>SKU</TableHead>
                  <TableHead>Product Title & Variant</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Available Inventory</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                      Generating real-time catalog feed...
                    </TableCell>
                  </TableRow>
                ) : !data?.items || data.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                      No active products found in catalog.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.items.slice(0, 15).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                      <TableCell className="font-medium text-xs">
                        <p>{item.title}</p>
                        {(item.color || item.size) && (
                          <p className="text-[11px] text-muted-foreground">
                            {[item.color, item.size].filter(Boolean).join(" • ")}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.brand}</TableCell>
                      <TableCell className="text-right text-xs font-semibold">{item.price}</TableCell>
                      <TableCell className="text-right text-xs font-bold">
                        {item.inventory} units
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                            item.availability === "in stock"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                          }`}
                        >
                          {item.availability}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {data?.items && data.items.length > 15 && (
            <p className="text-center text-xs text-muted-foreground italic">
              Showing first 15 of {data.items.length} items. Full catalog feed is exported directly via the feed URL.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
