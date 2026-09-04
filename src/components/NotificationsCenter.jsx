import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, Trash2, Settings, Circle } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { ScrollArea } from "@/components/ui/scroll-area";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import { Separator } from "@/components/ui/separator";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

    if (difference < 60) {
      return "Just now";
    }

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
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-xl text-gray-300 hover:bg-white/[0.06] hover:text-white"
              aria-label="Notifications"
            >
              <Bell size={19} />

              {unreadCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#0f1714] bg-[#049552] px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>

        <TooltipContent>Notifications</TooltipContent>
      </Tooltip>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[360px] overflow-hidden border-white/10 bg-[#1b2922] p-0 text-white shadow-2xl shadow-black/30"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Notifications</h3>

            <p className="mt-0.5 text-xs text-gray-500">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "You're all caught up"}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-8 px-2 text-xs text-gray-400 hover:bg-white/[0.06] hover:text-white"
              >
                <Check size={14} className="mr-1.5" />
                Mark all read
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
              className="h-8 w-8 text-gray-400 hover:bg-white/[0.06] hover:text-white"
              aria-label="Notification settings"
            >
              <Settings size={15} />
            </Button>
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Notifications */}
        {notifications.length === 0 ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#049552]/10">
              <Bell size={20} className="text-[#049552]" />
            </div>

            <p className="text-sm font-medium text-gray-300">
              No notifications
            </p>

            <p className="mt-1 max-w-[240px] text-xs leading-5 text-gray-500">
              We'll let you know when there's something important to see.
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[380px]">
              <div className="divide-y divide-white/[0.06]">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`group relative px-4 py-4 transition-colors hover:bg-white/[0.025] ${
                      !notification.read ? "bg-[#049552]/[0.035]" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-sm">
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="min-w-0 flex-1 pr-4">
                        <div className="flex items-start gap-2">
                          <p className="text-sm font-medium text-gray-200">
                            {notification.title}
                          </p>

                          {!notification.read && (
                            <Circle
                              size={7}
                              fill="currentColor"
                              className="mt-1.5 shrink-0 text-[#049552]"
                            />
                          )}
                        </div>

                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          {notification.message}
                        </p>

                        <p className="mt-2 text-[11px] text-gray-600">
                          {formatNotificationTime(notification.createdAt)}
                        </p>
                      </div>

                      <div className="absolute right-3 top-3 hidden items-center gap-1 group-hover:flex">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="h-7 w-7 text-gray-500 hover:bg-white/[0.06] hover:text-white"
                            aria-label="Mark as read"
                          >
                            <Check size={13} />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(notification.id)}
                          className="h-7 w-7 text-gray-500 hover:bg-red-400/10 hover:text-red-400"
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

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-between px-4 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-8 px-2 text-xs text-gray-500 hover:bg-red-400/10 hover:text-red-400"
              >
                <Trash2 size={13} className="mr-1.5" />
                Clear all
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/settings")}
                className="h-8 px-2 text-xs text-gray-400 hover:bg-white/[0.06] hover:text-white"
              >
                Notification settings
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default NotificationCenter;
