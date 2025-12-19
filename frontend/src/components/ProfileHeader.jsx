import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useRef } from "react";
import { Loader2, LogOutIcon, Volume1Icon, VolumeOffIcon } from "lucide-react";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

const ProfileHeader = () => {
  const { logout, authUser, updateProfile, isUploading } = useAuthStore();
  const { isSoundEnabled, toggleSound} = useChatStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(authUser?.fullName || "");

  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const handleNameUpdate = async () => {
    if (newName.trim() && newName !== authUser.fullName) {
      await updateProfile({ fullName: newName.trim() });
    }
    setIsEditingName(false);
  };

  return (
    <div className="p-6 border-b border-slate-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar online">
            {/* these classes come from daisy ui*/}
            <button
              disabled={isUploading}
              className={`size-14 rounded-full overflow-hidden relative group 
                ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={isUploading ? null : () => fileInputRef.current.click()}
            >
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="User Img"
                className="size-full object-cover"
              />

              {/* overlay text */}
              {isUploading ? (
                // Full overlay with loader during uploading
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                </div>
              ) : (
                // Normal hover overlay
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white text-xs">Change</span>
                </div>
              )}
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/*UserName and Online Text */}
          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNameUpdate();
                    if (e.key === "Escape") {
                      setNewName(authUser.fullName);
                      setIsEditingName(false);
                    }
                  }}
                  className="bg-slate-700 text-slate-200 px-2 py-1 rounded text-sm flex-1 min-w-0 truncate"
                  autoFocus
                />
                <button
                  onClick={handleNameUpdate}
                  className="text-green-400 hover:text-green-300 flex-shrink-0"
                >
                  ✓
                </button>
                <button
                  onClick={() => {
                    setNewName(authUser.fullName);
                    setIsEditingName(false);
                  }}
                  className="text-red-400 hover:text-red-300 flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-slate-200 font-medium text-base truncate hover:text-slate-100 transition-colors text-left min-w-0 max-w-[140px]"
                >
                  {authUser.fullName}
                </button>
                
              </div>
            )}
            <p className="text-slate-400 text-xs">Online</p>
          </div>
        </div>

        {/* Buttons */}
        {!isEditingName && (
          <div className="flex gap-4 items-center">
            {/* Logout BTN */}
            <button
              className="text-slate-400 hover:text-slate-200 transition-colors"
              onClick={logout}
            >
              <LogOutIcon className="size-5" />
            </button>

            {/*Sound Toggle BTN */}
            <button
              className="text-slate-400 hover:text-slate-200 transition-colors"
              onClick={() => {
                mouseClickSound.currentTime = 0;
                mouseClickSound
                  .play()
                  .catch((error) => console.log("Audio play failed", error));
                toggleSound();
              }}
            >
              {isSoundEnabled ? (
                <Volume1Icon className="size-5" />
              ) : (
                <VolumeOffIcon className="size-5" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
