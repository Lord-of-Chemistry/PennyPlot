import { useEffect, useRef, useState } from "react";
import {
  UserRound,
  Settings,
  ChevronRight,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProfileAvatar from "./ProfileAvatar";

function ProfileMenu({
  profile,
  isCollapsed = false,
  mobile = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function openProfile() {
    setIsOpen(false);
    navigate("/profile");
  }

  function openSettings() {
    setIsOpen(false);
    navigate("/settings");
  }

  return (
    <div
      ref={menuRef}
      className={`relative ${mobile ? "z-[200]" : ""}`}
    >
      {/* Profile Button */}
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        aria-label="Open profile menu"
        className={`group relative flex items-center rounded-xl transition-all duration-200 ${
          mobile
            ? "h-11 w-11 justify-center rounded-full border border-white/10 bg-[#22332b] p-0 shadow-lg shadow-black/20 hover:border-[#049552]/40"
            : `w-full px-3 py-2.5 ${
                isOpen
                  ? "bg-white/[0.06]"
                  : "hover:bg-white/[0.04]"
              } ${
                isCollapsed
                  ? "justify-center"
                  : "gap-3"
              }`
        }`}
      >
        <ProfileAvatar
          profile={profile}
          size={mobile ? "sm" : "md"}
        />

        {/* Desktop Profile Information */}
        {!mobile && (
          <>
            <div
              className={`min-w-0 overflow-hidden text-left transition-all duration-300 ${
                isCollapsed
                  ? "max-w-0 opacity-0"
                  : "max-w-40 opacity-100"
              }`}
            >
              <p className="truncate text-sm font-medium text-white">
                {profile?.name || "PennyPlot User"}
              </p>

              <p className="truncate text-xs text-gray-500">
                {profile?.email || "Personal account"}
              </p>
            </div>

            {!isCollapsed && (
              <ChevronRight
                size={16}
                className={`ml-auto shrink-0 text-gray-500 transition-transform duration-200 ${
                  isOpen
                    ? "rotate-90 text-[#049552]"
                    : ""
                }`}
              />
            )}

            {isCollapsed && (
              <span className="pointer-events-none absolute left-full z-40 ml-3 origin-left scale-0 whitespace-nowrap rounded-lg border border-white/10 bg-[#22332b] px-3 py-1.5 text-xs font-medium text-white shadow-lg transition-all duration-200 group-hover:scale-100">
                {profile?.name || "PennyPlot User"}
              </span>
            )}
          </>
        )}
      </button>

      {/* Profile Menu */}
      <div
        className={`absolute z-[250] w-64 rounded-2xl border border-white/10 bg-[#1b2922] p-2 shadow-2xl shadow-black/50 transition-all duration-200 ${
          mobile
            ? "right-0 top-full mt-3 origin-top-right"
            : `bottom-full left-0 mb-3 origin-bottom-left ${
                isCollapsed
                  ? "left-full bottom-0 ml-3 mb-0 origin-bottom-left"
                  : ""
              }`
        } ${
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : `pointer-events-none scale-95 opacity-0 ${
                mobile
                  ? "-translate-y-2"
                  : "translate-y-2"
              }`
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
          <ProfileAvatar
            profile={profile}
            size="lg"
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {profile?.name || "PennyPlot User"}
            </p>

            <p className="truncate text-xs text-gray-500">
              {profile?.email || "Personal account"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="ml-auto shrink-0 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-white/[0.06] hover:text-white"
            aria-label="Close profile menu"
          >
            <X size={15} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="mt-2 space-y-1">
          <button
            type="button"
            onClick={openProfile}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-gray-300 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <UserRound
              size={17}
              className="text-gray-500"
            />

            <span className="flex-1">
              View profile
            </span>

            <ChevronRight
              size={15}
              className="text-gray-600"
            />
          </button>

          <button
            type="button"
            onClick={openSettings}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-gray-300 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <Settings
              size={17}
              className="text-gray-500"
            />

            <span className="flex-1">
              Settings
            </span>

            <ChevronRight
              size={15}
              className="text-gray-600"
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileMenu;