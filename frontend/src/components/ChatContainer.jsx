import { useChatStore } from "../store/useChatStore"
import { useAuthStore } from "../store/useAuthStore"
import { useEffect } from "react";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageLoadingSkeleton from "./MessageLoadingSkeleton";


const ChatContainer = () => {
  const {getMessagesByUserId, messages, selectedUser, isMessagesLoading} = useChatStore();
  const {authUser} = useAuthStore();

  useEffect (() => {
    getMessagesByUserId(selectedUser._id);
  }, [selectedUser, getMessagesByUserId]);
  return (
    <>
    <ChatHeader />
    <div className="flex-1 px-6 overflow-y-auto py-8">
      {messages.length > 0 && !isMessagesLoading ? (<p>kaar e</p>) : isMessagesLoading ? <MessageLoadingSkeleton /> : (<NoChatHistoryPlaceholder name={selectedUser.fullName} />)}
    </div>
    </>
  )
}

export default ChatContainer