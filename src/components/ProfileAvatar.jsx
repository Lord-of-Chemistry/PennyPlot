import { getInitials } from "../utils/profile";

function ProfileAvatar({
  profile,
  size = "md",
  className = "",
}) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-lg",
    xl: "h-24 w-24 text-2xl",
  };

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full border border-white/10 bg-[#049552]/10 ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {profile?.avatar ? (
        <img
          src={profile.avatar}
          alt={profile.name || "Profile"}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-semibold text-[#049552]">
          {getInitials(profile?.name)}
        </div>
      )}
    </div>
  );
}

export default ProfileAvatar;