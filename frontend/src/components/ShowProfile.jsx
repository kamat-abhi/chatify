import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { X } from "lucide-react";

const ShowProfile = () => {
  const { selectedUser } = useChatStore();
  const {setShowProfilePic} = useAuthStore();

  return (
    <div className="  w-full h-full size-50 flex flex-col ">
      <div className="cursor-pointer flex justify-end mt-3 mr-2" onClick={() => setShowProfilePic()}>
        <X />
      </div>
      <div className="flex-1 flex items-center justify-center   ">
        <img
          src={selectedUser.profilePic}
          alt="user pic"
          className=" rounded-full size-40"
        ></img>
      </div>
    </div>
  );
};

export default ShowProfile;
