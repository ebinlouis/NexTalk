import { useState } from 'react';
import { LogOut, Search } from 'lucide-react';
import { getInitials } from '../../utils/getInitials';
import { useAuthStore } from '../../store/useAuthStore';
import ProfileModal from '../profile/ProfileModal';

const renderAvatar = (user, textClass = 'text-xs') =>
    user?.profilePic ? (
        <img
            src={user.profilePic}
            alt={user.fullName || ''}
            className="w-full h-full object-cover rounded-full"
        />
    ) : (
        <span className={textClass}>{getInitials(user?.fullName)}</span>
    );

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
    const { onlineUsers } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const filteredUsers = users.filter((u) => {
        const matches = u.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matches) return false;
        if (activeFilter === 'Unread') return (u.unreadCount || 0) > 0;
        return true;
    });

    const filteredContacts = contacts.filter((c) =>
        c.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const tabs = [
        { id: 'chats', label: 'Chats', count: filteredUsers.length },
        { id: 'contacts', label: 'Contacts', count: filteredContacts.length },
    ];

    return (
        <div
            className={`w-full md:w-[340px] lg:w-[380px] shrink-0 h-full flex flex-col border-r border-line bg-white z-10 ${
                selectedUser ? 'hidden md:flex' : 'flex'
            }`}
        >
            {/* Profile Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <button
                    type="button"
                    onClick={() => setIsProfileOpen(true)}
                    className="flex items-center gap-3 text-left hover:opacity-85 transition-opacity cursor-pointer group"
                    title="Click to edit profile"
                >
                    <div className="relative w-10 h-10 shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold border border-line overflow-hidden">
                            {renderAvatar(currentUser, 'text-sm')}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-white" />
                    </div>
                    <div className="text-left">
                        <h4 className="text-sm font-semibold tracking-tight text-ink group-hover:text-primary transition-colors">
                            {currentUser.fullName}
                        </h4>
                        <p className="text-xs text-muted flex items-center gap-1.5 mt-0.5 capitalize">
                            <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                                currentUser.status === 'busy'
                                    ? 'bg-rose-500'
                                    : currentUser.status === 'away'
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                            }`} />
                            {currentUser.status || 'Available'}
                        </p>
                    </div>
                </button>
                <button
                    type="button"
                    onClick={onLogout}
                    className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer focus:outline-none"
                    title="Sign Out"
                >
                    <LogOut size={18} />
                </button>
            </div>

            {/* Search Bar */}
            <div className="px-3.5 py-2.5 border-b border-slate-100 bg-white shrink-0">
                <div className="relative flex items-center">
                    <Search size={15} className="absolute left-3 text-muted pointer-events-none" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search chats or people..."
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-8 pr-3 py-2 text-xs text-ink placeholder:text-muted focus:outline-none focus:border-primary transition-all"
                    />
                </div>
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

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-white shrink-0">
                {['All', 'Unread', 'Direct', 'Groups'].map((item) => (
                    <button
                        key={item}
                        type="button"
                        onClick={() => setActiveFilter(item)}
                        className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                            activeFilter === item
                                ? 'bg-ink text-white font-medium'
                                : 'text-muted hover:text-ink bg-slate-100/70 hover:bg-slate-100'
                        }`}
                    >
                        {item}
                    </button>
                ))}
            </div>

            {/* Users/Contacts List */}
            <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1 bg-white custom-scrollbar">
                {activeTab === 'chats'
                    ? filteredUsers.map((chat) => {
                          const isLastFromMe =
                              chat.lastMessage?.senderId?.toString() ===
                              (currentUser?._id || currentUser?.id)?.toString();
                          const previewText = chat.lastMessage
                              ? isLastFromMe
                                  ? `You: ${chat.lastMessage.text}`
                                  : chat.lastMessage.text
                              : 'No messages yet';
                          const formattedTime = chat.lastMessage?.createdAt
                              ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })
                              : '';
                          return (
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
                                          {renderAvatar(chat, 'text-xs')}
                                          {onlineUsers.includes(chat._id?.toString()) && (
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
                                              {previewText}
                                          </p>
                                      </div>
                                  </div>
                                  <div className="text-right shrink-0 ml-2 flex flex-col items-end gap-1">
                                      <span className="text-[11px] text-subtle">{formattedTime}</span>
                                      {chat.unreadCount > 0 && (
                                          <span className="min-w-4 h-4 px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                              {chat.unreadCount}
                                          </span>
                                      )}
                                  </div>
                              </button>
                          );
                      })
                    : filteredContacts.map((contact) => (
                          <button
                              key={contact._id}
                              onClick={() => onSelectContact(contact)}
                              className="w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-colors hover:bg-slate-50 cursor-pointer focus:outline-none group"
                          >
                              <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold relative shrink-0">
                                      {renderAvatar(contact, 'text-xs')}
                                      {onlineUsers.includes(contact._id?.toString()) && (
                                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-white" />
                                      )}
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

            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </div>
    );
}
