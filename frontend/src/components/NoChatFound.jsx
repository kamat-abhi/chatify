import { MessageCircleXIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const NoChatFound = () => {
  const { setActiveTab } = useChatStore();
  return (
    <div className="flex flex-col items-center justify-between py-10 text-center space-y-4">
      <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center">
        <MessageCircleXIcon className="w-8 h-8 text-cyan-400" />
      </div>
      <div>
        <h4 className="text-slate-200 font-medium mb-1">
          Hello Introvert First Chat anyone !
        </h4>
        <p className="text-slate-400 text-sm px-6">
          I have a solution for you, go to <b>Contacts</b> tab.
        </p>
      </div>
      <button onClick={ () => setActiveTab("contacts")} className="px-4 py-2 text-sm text-cyan-400 bg-cyan-500/10 rounded-lg hover:bg-cyan-500/20 transition-colors"> Find contacts</button>
    </div>
  );
};

export default NoChatFound;
