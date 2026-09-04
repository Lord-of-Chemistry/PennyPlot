import { useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ProfileAvatar from "../components/ProfileAvatar";
import { formatCurrency } from "../utils/currency";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ArrowDownLeft, ArrowUpRight, Wallet, Receipt } from "lucide-react";

function createCroppedImage(
  imageSource,
  imageWidth,
  imageHeight,
  zoom,
  position,
  cropSize = 288,
) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const outputSize = 600;

      canvas.width = outputSize;
      canvas.height = outputSize;

      const context = canvas.getContext("2d");

      const aspectRatio = imageWidth / imageHeight;

      let baseWidth;
      let baseHeight;

      if (aspectRatio > 1) {
        baseHeight = cropSize;
        baseWidth = cropSize * aspectRatio;
      } else {
        baseWidth = cropSize;
        baseHeight = cropSize / aspectRatio;
      }

      const displayedWidth = baseWidth * zoom;
      const displayedHeight = baseHeight * zoom;

      const scale = displayedWidth / imageWidth;

      const sourceSize = cropSize / scale;

      let sourceX = (imageWidth - sourceSize) / 2 - position.x / scale;

      let sourceY = (imageHeight - sourceSize) / 2 - position.y / scale;

      sourceX = Math.max(0, Math.min(imageWidth - sourceSize, sourceX));

      sourceY = Math.max(0, Math.min(imageHeight - sourceSize, sourceY));

      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        0,
        0,
        outputSize,
        outputSize,
      );

      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };

    image.onerror = reject;
    image.src = imageSource;
  });
}

function Profile() {
  const { profile, setProfile, transactions, currency } = useOutletContext();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    bio: profile?.bio || "",
  });
  const [previewAvatar, setPreviewAvatar] = useState(profile?.avatar || "");
  const fileInputRef = useRef(null);
  const [cropImage, setCropImage] = useState(null);
  const [cropImageSize, setCropImageSize] = useState({
    width: 0,
    height: 0,
  });
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef({
    pointerX: 0,
    pointerY: 0,
    positionX: 0,
    positionY: 0,
  });

  const CROP_SIZE = 288;

  const imageAspectRatio = cropImageSize.width / cropImageSize.height || 1;

  let baseWidth;
  let baseHeight;

  if (imageAspectRatio > 1) {
    baseHeight = CROP_SIZE;
    baseWidth = CROP_SIZE * imageAspectRatio;
  } else {
    baseWidth = CROP_SIZE;
    baseHeight = CROP_SIZE / imageAspectRatio;
  }

  const totalTransactions = transactions?.length || 0;

  const totalIncome = (transactions || [])
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);

  const totalExpenses = (transactions || [])
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);

  const currentBalance = totalIncome - totalExpenses;

  const incomeTransactions = (transactions || []).filter(
    (transaction) => transaction.type === "income",
  ).length;

  const expenseTransactions = (transactions || []).filter(
    (transaction) => transaction.type === "expense",
  ).length;

  const currentMonth = new Date().toISOString().slice(0, 7);

  const thisMonthTransactions = (transactions || []).filter(
    (transaction) => transaction.date?.slice(0, 7) === currentMonth,
  );

  const thisMonthIncome = thisMonthTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);

  const thisMonthExpenses = thisMonthTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);

  const thisMonthNet = thisMonthIncome - thisMonthExpenses;

  const thisMonthTransactionCount = thisMonthTransactions.length;
  const displayedWidth = baseWidth * zoom;
  const displayedHeight = baseHeight * zoom;

  const maxX = Math.max(0, (displayedWidth - CROP_SIZE) / 2);

  const maxY = Math.max(0, (displayedHeight - CROP_SIZE) / 2);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSave() {
    setProfile((previous) => ({
      ...previous,
      ...formData,
      avatar: previewAvatar,
    }));

    setIsEditing(false);
  }

  function handleCancel() {
    setFormData({
      name: profile?.name || "",
      email: profile?.email || "",
      bio: profile?.bio || "",
    });

    setPreviewAvatar(profile?.avatar || "");
    setIsEditing(false);
  }

  function handleAvatarChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        setCropImageSize({
          width: image.naturalWidth,
          height: image.naturalHeight,
        });

        setCropImage(reader.result);
        setZoom(1);
        setPosition({
          x: 0,
          y: 0,
        });
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  }

  function handleRemoveAvatar() {
    setPreviewAvatar("");
  }

  function handlePointerDown(event) {
    if (!cropImage) return;

    event.currentTarget.setPointerCapture(event.pointerId);

    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      positionX: position.x,
      positionY: position.y,
    };

    setIsDragging(true);
  }

  function handlePointerMove(event) {
    if (!isDragging) return;

    const deltaX = event.clientX - dragStartRef.current.pointerX;

    const deltaY = event.clientY - dragStartRef.current.pointerY;

    const newX = Math.max(
      -maxX,
      Math.min(maxX, dragStartRef.current.positionX + deltaX),
    );

    const newY = Math.max(
      -maxY,
      Math.min(maxY, dragStartRef.current.positionY + deltaY),
    );

    setPosition({
      x: newX,
      y: newY,
    });
  }

  function handlePointerUp(event) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setIsDragging(false);
  }

  async function handleUsePhoto() {
    if (!cropImage) return;

    try {
      const croppedImage = await createCroppedImage(
        cropImage,
        cropImageSize.width,
        cropImageSize.height,
        zoom,
        position,
        CROP_SIZE,
      );

      setPreviewAvatar(croppedImage);
      setCropImage(null);

      setZoom(1);
      setPosition({
        x: 0,
        y: 0,
      });
    } catch (error) {
      console.error("Failed to crop image:", error);
      alert("Something went wrong while processing the photo.");
    }
  }

  return (
    <section className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mt-1 text-3xl font-bold text-white">Your profile</h1>

        <p className="mt-2 text-sm text-gray-400">
          Manage your personal information and profile details.
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl border border-white/10 bg-[#1b2922] p-6 shadow-xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <ProfileAvatar
            profile={{
              ...profile,
              avatar: previewAvatar,
            }}
            size="xl"
          />
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-300">
                    Profile photo
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                    >
                      {previewAvatar ? "Change photo" : "Upload photo"}
                    </button>

                    {previewAvatar && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-400/10"
                      >
                        Remove photo
                      </button>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">
                    Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-white/10 bg-[#0f1714] px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#049552]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-white/10 bg-[#0f1714] px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#049552]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">
                    Bio
                  </label>

                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us a little about yourself..."
                    rows={4}
                    className="w-full resize-none rounded-xl border border-white/10 bg-[#0f1714] px-4 py-2.5 text-sm leading-6 text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#049552]"
                  />
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="rounded-xl bg-[#049552] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#038447]"
                  >
                    Save changes
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="truncate text-2xl font-semibold text-white">
                  {profile?.name || "PennyPlot User"}
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  {profile?.email || "No email added"}
                </p>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
                  {profile?.bio || "No bio added yet."}
                </p>
              </>
            )}
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-xl bg-[#049552] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#038447] hover:shadow-lg hover:shadow-[#049552]/20"
            >
              Edit profile
            </button>
          )}
        </div>
      </div>

      {/* All Time Activity */}
      <div className="mt-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">
            All Time Activity
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Your complete financial activity in PennyPlot.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {/* Current Balance */}
          <div className="rounded-2xl border border-white/10 bg-[#1b2922] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-[#049552]/10 p-2.5">
                <Wallet size={18} className="text-[#049552]" />
              </div>
            </div>

            <p className="text-sm text-gray-400">Current balance</p>

            <p className="mt-1 text-2xl font-semibold text-white">
              {formatCurrency(currentBalance, currency)}
            </p>
          </div>

          {/* Total Income */}
          <div className="rounded-2xl border border-white/10 bg-[#1b2922] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-emerald-400/10 p-2.5">
                <ArrowDownLeft size={18} className="text-emerald-400" />
              </div>
            </div>

            <p className="text-sm text-gray-400">Total income</p>

            <p className="mt-1 text-2xl font-semibold text-white">
              {formatCurrency(totalIncome, currency)}
            </p>
          </div>

          {/* Total Expenses */}
          <div className="rounded-2xl border border-white/10 bg-[#1b2922] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-red-400/10 p-2.5">
                <ArrowUpRight size={18} className="text-red-400" />
              </div>
            </div>

            <p className="text-sm text-gray-400">Total expenses</p>

            <p className="mt-1 text-2xl font-semibold text-white">
              {formatCurrency(totalExpenses, currency)}
            </p>
          </div>

          {/* Total Transactions */}
          <div className="rounded-2xl border border-white/10 bg-[#1b2922] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-blue-400/10 p-2.5">
                <Receipt size={18} className="text-blue-400" />
              </div>
            </div>

            <p className="text-sm text-gray-400">Total transactions</p>

            <p className="mt-1 text-2xl font-semibold text-white">
              {totalTransactions}
            </p>
          </div>

          {/* Income Transactions */}
          <div className="rounded-2xl border border-white/10 bg-[#1b2922] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-emerald-400/10 p-2.5">
                <ArrowDownLeft size={18} className="text-emerald-400" />
              </div>
            </div>

            <p className="text-sm text-gray-400">Income transactions</p>

            <p className="mt-1 text-2xl font-semibold text-white">
              {incomeTransactions}
            </p>
          </div>

          {/* Expense Transactions */}
          <div className="rounded-2xl border border-white/10 bg-[#1b2922] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-red-400/10 p-2.5">
                <ArrowUpRight size={18} className="text-red-400" />
              </div>
            </div>

            <p className="text-sm text-gray-400">Expense transactions</p>

            <p className="mt-1 text-2xl font-semibold text-white">
              {expenseTransactions}
            </p>
          </div>
        </div>
      </div>

      <Dialog
        open={Boolean(cropImage)}
        onOpenChange={(open) => {
          if (!open) {
            setCropImage(null);
          }
        }}
      >
        <DialogContent className="max-w-lg border-white/10 bg-[#1b2922] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Adjust your photo</DialogTitle>

            <DialogDescription className="text-gray-400">
              Position and zoom your photo until it looks right.
            </DialogDescription>
          </DialogHeader>

          {/* Crop Preview */}
          <div className="flex justify-center">
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`relative h-72 w-72 overflow-hidden rounded-full border-2 border-[#049552]/40 bg-[#0f1714] touch-none select-none ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
            >
              {cropImage && (
                <img
                  src={cropImage}
                  alt="Crop preview"
                  className="absolute left-1/2 top-1/2 max-w-none select-none"
                  style={{
                    width: `${displayedWidth}px`,
                    height: `${displayedHeight}px`,
                    transform: `
            translate(-50%, -50%)
            translate(${position.x}px, ${position.y}px)
          `,
                  }}
                  draggable={false}
                />
              )}
              <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/20" />
            </div>
          </div>

          {/* Zoom */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Zoom</label>

              <span className="text-xs text-gray-500">{zoom.toFixed(1)}x</span>
            </div>

            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(event) => {
                const newZoom = Number(event.target.value);

                setZoom(newZoom);

                setPosition((previous) => ({
                  x: Math.max(
                    -Math.max(0, (baseWidth * newZoom - CROP_SIZE) / 2),
                    Math.min(
                      Math.max(0, (baseWidth * newZoom - CROP_SIZE) / 2),
                      previous.x,
                    ),
                  ),

                  y: Math.max(
                    -Math.max(0, (baseHeight * newZoom - CROP_SIZE) / 2),
                    Math.min(
                      Math.max(0, (baseHeight * newZoom - CROP_SIZE) / 2),
                      previous.y,
                    ),
                  ),
                }));
              }}
              className="w-full accent-[#049552]"
            />
          </div>

          {/* Position */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  Horizontal
                </label>

                <span className="text-xs text-gray-500">
                  {Math.round(position.x)}px
                </span>
              </div>

              <input
                type="range"
                min={-maxX}
                max={maxX}
                step="1"
                value={position.x}
                disabled={maxX === 0}
                onChange={(event) => {
                  setPosition((previous) => ({
                    ...previous,
                    x: Number(event.target.value),
                  }));
                }}
                className="w-full accent-[#049552] disabled:opacity-30"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  Vertical
                </label>

                <span className="text-xs text-gray-500">
                  {Math.round(position.y)}px
                </span>
              </div>

              <input
                type="range"
                min={-maxY}
                max={maxY}
                step="1"
                value={position.y}
                disabled={maxY === 0}
                onChange={(event) => {
                  setPosition((previous) => ({
                    ...previous,
                    y: Number(event.target.value),
                  }));
                }}
                className="w-full accent-[#049552] disabled:opacity-30"
              />
            </div>
          </div>
          {/* Actions */}
          <div className="flex justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setPosition({
                  x: 0,
                  y: 0,
                });
              }}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              Reset
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCropImage(null)}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUsePhoto}
                className="rounded-xl bg-[#049552] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#038447]"
              >
                Use photo
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default Profile;
