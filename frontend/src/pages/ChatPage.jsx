import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, MessageSquare, ArrowLeft, CheckCheck, SendHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';

export default function ChatPage() {
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const { logout, authUser } = useAuthStore();
    const { contacts, getContacts, users, getUsers, messages, isLoadingMessages, getMessages, sendMessage, isSendingMessage } = useChatStore();

    // Navigation and state
    const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'contacts'
    const [selectedUser, setSelectedUser] = useState(null);
    const [inputMessage, setInputMessage] = useState('');

    const currentUser = authUser || {
        fullName: 'Loading...',
        email: '',
        profilePic: '',
    };

    // Scroll to bottom on new message or user swap
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [selectedUser, messages]);

    useEffect(() => {
        getContacts();
        getUsers();
    }, []);

    useEffect(() => {
        if (!selectedUser?._id) return;
        getMessages(selectedUser._id).then((res) => {
            if (!res?.success && res?.error) toast.error(res.error);
        });
    }, [selectedUser?._id]);

    const handleLogout = async () => {
        const { success } = await logout();
        if (success) {
            navigate('/login');
        }
    };

    const getInitials = (name = '') =>
        name
            .trim()
            .split(/\s+/)
            .map((part) => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

    // Handle message sending
    const handleSendMessage = async (e) => {
        e.preventDefault();
        const trimmed = inputMessage.trim();
        if (!trimmed || !selectedUser || isSendingMessage) return;

        const isExistingChat = users.some((u) => u._id === selectedUser._id);
        const res = await sendMessage(selectedUser._id, { text: trimmed });
        if (res?.success) {
            setInputMessage('');
            if (!isExistingChat) getUsers();
        } else if (res?.error) {
            toast.error(res.error);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-backdrop text-ink flex items-stretch md:items-center justify-center p-0 md:p-5 overflow-hidden font-sans select-none">
            {/* Chat Card Container */}
            <div className="w-full max-w-[1360px] h-screen md:h-[860px] md:max-h-[calc(100vh-40px)] flex flex-col md:flex-row bg-white border-0 md:border md:border-line rounded-none md:rounded-[20px] shadow-card overflow-hidden z-10">
                {/* Left Section */}
                <div className={`w-full md:w-[340px] lg:w-[380px] shrink-0 h-full flex flex-col border-r border-line bg-white z-10 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                    {/* First Div: Profile Header */}
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 shrink-0">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold border border-line">
                                    <span className="text-sm">{currentUser.profilePic || getInitials(currentUser.fullName)}</span>
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
                            onClick={handleLogout}
                            className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-all duration-200 cursor-pointer focus:outline-none"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>

                    {/* Second Div: Navigation Tab Buttons */}
                    <div className="p-3 border-b border-slate-100 bg-white shrink-0">
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setActiveTab('chats')}
                                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer focus:outline-none ${
                                    activeTab === 'chats'
                                        ? 'bg-white text-ink shadow-xs font-semibold'
                                        : 'text-muted hover:text-ink font-medium'
                                }`}
                            >
                                <span>Chats</span>
                                <span className={`text-[10px] px-1.5 rounded-full ${activeTab === 'chats' ? 'bg-slate-100 text-ink-slate' : 'bg-slate-200 text-muted'}`}>
                                    {users.length}
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab('contacts')}
                                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer focus:outline-none ${
                                    activeTab === 'contacts'
                                        ? 'bg-white text-ink shadow-xs font-semibold'
                                        : 'text-muted hover:text-ink font-medium'
                                }`}
                            >
                                <span>Contacts</span>
                                <span className={`text-[10px] px-1.5 rounded-full ${activeTab === 'contacts' ? 'bg-slate-100 text-ink-slate' : 'bg-slate-200 text-muted'}`}>
                                    {contacts.length}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Third Div: Users/Contacts List */}
                    <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1 bg-white custom-scrollbar">
                        {activeTab === 'chats'
                            ? users.map((chat) => (
                                  <button
                                      key={chat._id}
                                      onClick={() => setSelectedUser(chat)}
                                      className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all duration-150 border-l-4 cursor-pointer focus:outline-none group ${
                                          selectedUser?._id === chat._id
                                              ? 'bg-teal-50/70 border-primary shadow-xs'
                                              : 'border-transparent hover:bg-slate-50'
                                      }`}
                                  >
                                      <div className="flex items-center gap-3 min-w-0">
                                          <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-semibold relative shrink-0 ring-2 ring-white shadow-xs">
                                              <span className="text-xs">{chat.profilePic || getInitials(chat.fullName)}</span>
                                              {chat.status === 'Online' && (
                                                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-white" />
                                              )}
                                          </div>
                                          <div className="min-w-0 flex-1">
                                              <h5
                                                  className={`text-xs font-semibold truncate transition-colors ${selectedUser?._id === chat._id ? 'text-primary' : 'text-ink'}`}
                                              >
                                                  {chat.fullName}
                                              </h5>
                                              <p className="text-xs text-muted truncate max-w-[180px] leading-tight mt-0.5">
                                                  {chat.lastMessage}
                                              </p>
                                          </div>
                                      </div>
                                      <div className="text-right shrink-0 ml-2">
                                          <span className="text-[11px] text-subtle">
                                              {chat.time}
                                          </span>
                                      </div>
                                  </button>
                              ))
                            : contacts.map((contact) => (
                                  <button
                                      key={contact._id}
                                      onClick={() => {
                                          setSelectedUser(contact);
                                          setActiveTab('chats'); // Jump to chats tab upon selection
                                      }}
                                      className="w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-colors hover:bg-slate-50 cursor-pointer focus:outline-none group"
                                  >
                                      <div className="flex items-center gap-3 min-w-0">
                                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold relative shrink-0">
                                              <span className="text-xs">{contact.profilePic || getInitials(contact.fullName)}</span>
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

                {/* Right Section */}
                <div className={`flex-1 h-full flex-col bg-canvas z-10 relative ${selectedUser ? 'flex' : 'hidden md:flex'}`}>
                    {selectedUser ? (
                        <>
                            {/* Selected Partner Header */}
                            <div className="px-5 md:px-6 py-3.5 border-b border-line flex items-center justify-between bg-white shrink-0">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedUser(null)}
                                        className="md:hidden p-1.5 -ml-1 text-muted hover:text-ink hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                        aria-label="Back to conversations"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold relative border border-line shrink-0">
                                        <span className="text-xs">
                                            {selectedUser.profilePic || getInitials(selectedUser.fullName)}
                                        </span>
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-sm md:text-base font-semibold tracking-tight text-ink">
                                            {selectedUser.fullName}
                                        </h4>
                                        <p className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-success inline-block animate-pulse" />
                                            active now
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Message History list */}
                            <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-4 bg-canvas custom-scrollbar flex flex-col">
                                <div className="flex items-center justify-center my-2">
                                    <div className="bg-white border border-line text-muted text-xs px-3 py-1 rounded-full shadow-xs font-medium">
                                        Today, End-to-End Encrypted
                                    </div>
                                </div>
                                {isLoadingMessages ? (
                                    <div className="flex-1 flex items-center justify-center text-xs text-muted">
                                        Loading messages...
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex-1 flex items-center justify-center text-xs text-muted">
                                        No messages yet. Say hello!
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isMe = msg.senderId === (authUser?._id || authUser?.id);
                                        return (
                                            <div
                                                key={msg._id}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`animate-message max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed text-left border border-line bg-white text-ink shadow-xs ${
                                                        isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'
                                                    }`}
                                                >
                                                    <p>{msg.text}</p>
                                                    <div className="flex items-center justify-end gap-1 mt-1 text-[11px] text-subtle">
                                                        <span>
                                                            {new Date(msg.createdAt).toLocaleTimeString(
                                                                [],
                                                                { hour: '2-digit', minute: '2-digit' },
                                                            )}
                                                        </span>
                                                        {isMe && <CheckCheck size={14} className="text-subtle" />}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Sender controls */}
                            <form
                                onSubmit={handleSendMessage}
                                className="p-3 md:p-4 border-t border-line bg-white shrink-0"
                            >
                                <div className="flex items-center gap-2 md:gap-3">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        className="flex-1 bg-slate-50 border border-line text-ink placeholder:text-subtle rounded-xl px-4 py-2.5 md:py-3 text-xs md:text-sm outline-none transition-all focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!inputMessage.trim() || isSendingMessage}
                                        className="bg-primary hover:bg-primary-hover disabled:opacity-40 text-white px-4 md:px-5 py-2.5 md:py-3 rounded-xl flex items-center gap-2 font-medium text-xs md:text-sm shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
                                    >
                                        <span>Send</span>
                                        <SendHorizontal size={16} className="text-teal-200" />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        /* Welcome Screen Placeholder */
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in relative overflow-hidden">
                            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-accent-mint mb-6 shadow-btn animate-float z-10">
                                <MessageSquare size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-ink mb-2 z-10">
                                Welcome to NexTalk
                            </h3>
                            <p className="text-xs text-muted max-w-xs leading-relaxed z-10">
                                Select a chat or contact from the left list to begin messaging and
                                sharing.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
