import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, Trash2, Settings, Circle } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearNotifications,
} from "../utils/notifications";

function NotificationCenter({ notifications = [], setNotifications }) {
  const navigate = useNavigate();

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  function handleMarkAsRead(id) {
    const updatedNotifications = markNotificationAsRead(id);
    setNotifications(updatedNotifications);
  }

  function handleMarkAllAsRead() {
    const updatedNotifications = markAllNotificationsAsRead();
    setNotifications(updatedNotifications);
  }

  function handleDelete(id) {
    const updatedNotifications = deleteNotification(id);
    setNotifications(updatedNotifications);
  }

  function handleClearAll() {
    const updatedNotifications = clearNotifications();
    setNotifications(updatedNotifications);
  }

  function formatNotificationTime(createdAt) {
    if (!createdAt) return "";

    const date = new Date(createdAt);
    const now = new Date();

    const difference = Math.floor((now - date) / 1000);

    if (difference < 60) return "Just now";

    if (difference < 3600) {
      return `${Math.floor(difference / 60)}m ago`;
    }

    if (difference < 86400) {
      return `${Math.floor(difference / 3600)}h ago`;
    }

    if (difference < 604800) {
      return `${Math.floor(difference / 86400)}d ago`;
    }

    return date.toLocaleDateString();
  }

  function getNotificationIcon(type) {
    switch (type) {
      case "budget":
        return "🔴";

      case "recurring":
        return "💳";

      case "spending":
        return "⚠️";

      case "summary":
        return "📊";

      case "connection":
        return "🟢";

      default:
        return "🔔";
    }
  }

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell size={19} />

                {unreadCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
          </div>
        </TooltipTrigger>
        <TooltipContent>Notifications</TooltipContent>
      </Tooltip>
      
      <PopoverContent
        align="end"
        sideOffset={8}
        className="
          w-[calc(100vw-20px)]
          max-w-[380px]
          overflow-hidden
          rounded-xl
          border-border
          bg-popover
          p-0
          text-popover-foreground
          shadow-2xl
          shadow-black/30
          sm:w-[380px]
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-3 py-3 sm:px-4 sm:py-3.5">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground sm:text-base">
              Notifications
            </h3>

            <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "You're all caught up"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-8 px-2 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground sm:px-2.5 sm:text-xs"
              >
                <Check size={14} className="mr-1 sm:mr-1.5" />

                <span className="sm:hidden">Read all</span>
                <span className="hidden sm:inline">Mark all read</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
              className="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Notification settings"
            >
              <Settings size={15} />
            </Button>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Empty state */}
        {notifications.length === 0 ? (
          <div className="flex min-h-[210px] flex-col items-center justify-center px-5 text-center sm:min-h-[240px] sm:px-6">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 sm:h-12 sm:w-12">
              <Bell size={19} className="text-primary sm:size-20" />
            </div>

            <p className="text-sm font-medium text-foreground">
              No notifications
            </p>

            <p className="mt-1 max-w-[230px] text-[11px] leading-5 text-muted-foreground sm:max-w-[240px] sm:text-xs">
              We'll let you know when there's something important to see.
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[320px] sm:h-[380px]">
              <div className="divide-y divide-border/60">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`group relative px-3 py-3 transition-colors hover:bg-foreground/[0.025] sm:px-4 sm:py-4 ${
                      !notification.read ? "bg-primary/[0.035]" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      {/* Notification icon */}
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground/[0.04] text-xs sm:h-9 sm:w-9 sm:rounded-xl sm:text-sm">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-1.5">
                          <p className="min-w-0 flex-1 text-[13px] font-medium leading-5 text-foreground sm:text-sm">
                            {notification.title}
                          </p>

                          {!notification.read && (
                            <Circle
                              size={7}
                              fill="currentColor"
                              className="mt-1.5 shrink-0 text-primary"
                            />
                          )}
                        </div>

                        <p className="mt-0.5 break-words text-[11px] leading-4.5 text-muted-foreground sm:mt-1 sm:text-xs sm:leading-5">
                          {notification.message}
                        </p>

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <p className="text-[10px] text-muted-foreground/60 sm:text-[11px]">
                            {formatNotificationTime(notification.createdAt)}
                          </p>

                          {/* Mobile actions */}
                          <div className="flex items-center gap-0.5 sm:hidden">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
                                className="h-7 w-7 text-muted-foreground hover:bg-accent hover:text-foreground"
                                aria-label="Mark as read"
                              >
                                <Check size={13} />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(notification.id)}
                              className="h-7 w-7 text-muted-foreground hover:bg-red-400/10 hover:text-red-400"
                              aria-label="Delete notification"
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Desktop actions */}
                      <div className="absolute right-3 top-3 hidden items-center gap-1 sm:group-hover:flex">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="h-7 w-7 text-muted-foreground hover:bg-accent hover:text-foreground"
                            aria-label="Mark as read"
                          >
                            <Check size={13} />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(notification.id)}
                          className="h-7 w-7 text-muted-foreground hover:bg-red-400/10 hover:text-red-400"
                          aria-label="Delete notification"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator className="bg-border" />

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-8 px-2 text-[11px] text-muted-foreground hover:bg-red-400/10 hover:text-red-400 sm:text-xs"
              >
                <Trash2 size={13} className="mr-1.5" />
                Clear all
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/settings")}
                className="h-8 px-2 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground sm:text-xs"
              >
                <span className="sm:hidden">Settings</span>
                <span className="hidden sm:inline">
                  Notification settings
                </span>
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default NotificationCenter;