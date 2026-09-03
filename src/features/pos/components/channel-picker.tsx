"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { SalesChannel } from "@/features/channels/types";
import { useTranslation } from "@/features/i18n/hooks/use-translation";

export function ChannelPicker({
  channels,
  value,
  onChange,
}: {
  channels: SalesChannel[];
  value: string | null;
  onChange: (channelId: string | null) => void;
}) {
  const { t } = useTranslation();

  if (channels.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>{t("ui.web.channels.channel")}</Label>
      <div className="flex flex-wrap gap-1.5">
        <Button
          type="button"
          size="sm"
          variant={value === null ? "default" : "outline"}
          onClick={() => onChange(null)}
        >
          {t("ui.web.channels.none")}
        </Button>
        {channels.map((channel) => (
          <Button
            key={channel.id}
            type="button"
            size="sm"
            variant={value === channel.id ? "default" : "outline"}
            onClick={() => onChange(value === channel.id ? null : channel.id)}
          >
            {channel.name}
            <span className="ml-1 text-xs opacity-70">
              {channel.commissionPercent}%
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
