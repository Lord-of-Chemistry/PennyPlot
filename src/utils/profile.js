const PROFILE_KEY = "pennyplot-profile";

export const DEFAULT_PROFILE = {
  name: "PennyPlot User",
  email: "",
  bio: "",
  avatar: "",
};

export function getProfile() {
  try {
    const savedProfile = localStorage.getItem(PROFILE_KEY);

    if (!savedProfile) {
      return DEFAULT_PROFILE;
    }

    const parsedProfile = JSON.parse(savedProfile);

    return {
      ...DEFAULT_PROFILE,
      ...parsedProfile,
    };
  } catch (error) {
    console.error("Failed to load profile:", error);
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify({
        ...DEFAULT_PROFILE,
        ...profile,
      }),
    );

    return true;
  } catch (error) {
    console.error("Failed to save profile:", error);
    return false;
  }
}

export function removeProfileAvatar() {
  const profile = getProfile();

  return saveProfile({
    ...profile,
    avatar: "",
  });
}

export function getInitials(name = "") {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "PP";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}