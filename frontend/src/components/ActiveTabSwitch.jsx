import { useChatStore } from "../store/useChatStore";

const ActiveTabSwitch = () => {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div className="tabs tabs-boxed bg-transparent p-2 m-2">
      <button
        onClick={() => setActiveTab("chats")}
        className={`tab transition-colors duration-300
          ${activeTab === "chats"
            ? "!bg-cyan-500/20 !text-cyan-400"
            : "!bg-transparent !text-slate-400"
          }`}
      >
        Chats
      </button>

      <button
        onClick={() => setActiveTab("contacts")}
        className={`tab transition-colors duration-300
          ${activeTab === "contacts"
            ? "!bg-cyan-500/20 !text-cyan-400"
            : "!bg-transparent !text-slate-400"
          }`}
      >
        Contacts
      </button>
    </div>
  );
};

export default ActiveTabSwitch;
