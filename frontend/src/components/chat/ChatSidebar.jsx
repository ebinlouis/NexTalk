import { LogOut } from 'lucide-react';
import { getInitials } from '../../utils/getInitials';

/**
 * Left chat dashboard sidebar with user profile header, segmented tabs, and user/contact lists.
 */
export default function ChatSidebar({
    currentUser,
    activeTab,
    onTabChange,
    users,
    contacts,
    selectedUser,
    onSelectChat,
    onSelectContact,
    onLogout,
}) {
    const tabs = [
        { id: 'chats', label: 'Chats', count: users.length },
        { id: 'contacts', label: 'Contacts', count: contacts.length },
    ];

    return (
        <div
            className={`w-full md:w-[340px] lg:w-[380px] shrink-0 h-full flex flex-col border-r border-line bg-white z-10 ${
                selectedUser ? 'hidden md:flex' : 'flex'
            }`}
        >
            {/* Profile Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold border border-line">
                            <span className="text-sm">
                                {currentUser.profilePic || getInitials(currentUser.fullName)}
                            </span>
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-white" />
                    </div>
                    <div className="text-left">
                        <h4 className="text-sm font-semibold tracking-tight text-ink">
                            {currentUser.fullName}
                        </h4>
                        <p className="text-xs text-muted mt-0.5">{currentUser.email}</p>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-all duration-200 cursor-pointer focus:outline-none"
                    title="Logout"
                >
                    <LogOut size={18} />
                </button>
            </div>

            {/* Navigation Tab Buttons */}
            <div className="p-3 border-b border-slate-100 bg-white shrink-0">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer focus:outline-none ${
                                    isActive
                                        ? 'bg-white text-ink shadow-xs font-semibold'
                                        : 'text-muted hover:text-ink font-medium'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span
                                    className={`text-[10px] px-1.5 rounded-full ${
                                        isActive
                                            ? 'bg-slate-100 text-ink-slate'
                                            : 'bg-slate-200 text-muted'
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Users/Contacts List */}
            <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1 bg-white custom-scrollbar">
                {activeTab === 'chats'
                    ? users.map((chat) => (
                          <button
                              key={chat._id}
                              onClick={() => onSelectChat(chat)}
                              className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all duration-150 border-l-4 cursor-pointer focus:outline-none group ${
                                  selectedUser?._id === chat._id
                                      ? 'bg-teal-50/70 border-primary shadow-xs'
                                      : 'border-transparent hover:bg-slate-50'
                              }`}
                          >
                              <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-semibold relative shrink-0 ring-2 ring-white shadow-xs">
                                      <span className="text-xs">
                                          {chat.profilePic || getInitials(chat.fullName)}
                                      </span>
                                      {chat.status === 'Online' && (
                                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-white" />
                                      )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                      <h5
                                          className={`text-xs font-semibold truncate transition-colors ${
                                              selectedUser?._id === chat._id
                                                  ? 'text-primary'
                                                  : 'text-ink'
                                          }`}
                                      >
                                          {chat.fullName}
                                      </h5>
                                      <p className="text-xs text-muted truncate max-w-[180px] leading-tight mt-0.5">
                                          {chat.lastMessage}
                                      </p>
                                  </div>
                              </div>
                              <div className="text-right shrink-0 ml-2">
                                  <span className="text-[11px] text-subtle">{chat.time}</span>
                              </div>
                          </button>
                      ))
                    : contacts.map((contact) => (
                          <button
                              key={contact._id}
                              onClick={() => onSelectContact(contact)}
                              className="w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-colors hover:bg-slate-50 cursor-pointer focus:outline-none group"
                          >
                              <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold relative shrink-0">
                                      <span className="text-xs">
                                          {contact.profilePic || getInitials(contact.fullName)}
                                      </span>
                                  </div>
                                  <div className="min-w-0">
                                      <h5 className="text-xs font-semibold text-ink group-hover:text-primary transition-colors truncate">
                                          {contact.fullName}
                                      </h5>
                                      <p className="text-[11px] text-muted truncate mt-0.5">
                                          {contact.email}
                                      </p>
                                  </div>
                              </div>
                              <span className="px-2.5 py-1 text-xs font-medium text-primary bg-teal-50 group-hover:bg-primary group-hover:text-white rounded-lg transition-all shrink-0 ml-2">
                                  Message
                              </span>
                          </button>
                      ))}
            </div>
        </div>
    );
}
