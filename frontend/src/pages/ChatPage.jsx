import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, MessageSquare, Users, SendHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock data for initial presentation
const MOCK_CHATS = [
    { _id: '1', fullName: 'Sarah Connor', email: 'sarah@resistance.org', profilePic: '', lastMessage: 'No fate but what we make.', time: '10:42 AM', isOnline: true },
    { _id: '2', fullName: 'John Doe', email: 'john@example.com', profilePic: '', lastMessage: 'Hey, is the NexTalk UI ready yet?', time: 'Yesterday', isOnline: false },
    { _id: '3', fullName: 'Alice Vance', email: 'alice@blackmesa.com', profilePic: '', lastMessage: 'See you at the hazard course.', time: 'Monday', isOnline: true },
];

const MOCK_CONTACTS = [
    { _id: '1', fullName: 'Sarah Connor', email: 'sarah@resistance.org', profilePic: '', status: 'Online' },
    { _id: '2', fullName: 'John Doe', email: 'john@example.com', profilePic: '', status: 'Offline' },
    { _id: '3', fullName: 'Alice Vance', email: 'alice@blackmesa.com', profilePic: '', status: 'Online' },
    { _id: '4', fullName: 'Gordon Freeman', email: 'freeman@blackmesa.com', profilePic: '', status: 'Offline' },
    { _id: '5', fullName: 'Bruce Wayne', email: 'bruce@waynecorp.com', profilePic: '', status: 'Online' },
];

const MOCK_MESSAGES = {
    '1': [
        { _id: 'm1', senderId: '1', receiverId: 'me', text: 'Hello! Are you ready for the resistance?', createdAt: '2026-07-21T10:40:00.000Z' },
        { _id: 'm2', senderId: 'me', receiverId: '1', text: 'I am building the NexTalk chat UI now!', createdAt: '2026-07-21T10:41:00.000Z' },
        { _id: 'm3', senderId: '1', receiverId: 'me', text: 'No fate but what we make.', createdAt: '2026-07-21T10:42:00.000Z' },
    ],
    '2': [
        { _id: 'm4', senderId: 'me', receiverId: '2', text: 'Hi John, did you check the store integrations?', createdAt: '2026-07-20T15:30:00.000Z' },
        { _id: 'm5', senderId: '2', receiverId: 'me', text: 'Hey, is the NexTalk UI ready yet?', createdAt: '2026-07-20T15:32:00.000Z' },
    ],
    '3': [
        { _id: 'm6', senderId: '3', receiverId: 'me', text: 'Gordon says hello.', createdAt: '2026-07-19T09:12:00.000Z' },
        { _id: 'm7', senderId: 'me', receiverId: '3', text: 'Tell him I am busy pair programming.', createdAt: '2026-07-19T09:15:00.000Z' },
        { _id: 'm8', senderId: '3', receiverId: 'me', text: 'See you at the hazard course.', createdAt: '2026-07-19T09:16:00.000Z' },
    ]
};

export default function ChatPage() {
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);

    // Navigation and state
    const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'contacts'
    const [selectedUser, setSelectedUser] = useState(null);
    const [localMessages, setLocalMessages] = useState(MOCK_MESSAGES);
    const [inputMessage, setInputMessage] = useState('');

    // Mock logged-in user profile info
    const currentUser = {
        fullName: 'Ebin Louis',
        email: 'ebin@nextalk.com',
        profilePic: '',
    };

    // Scroll to bottom on new message or user swap
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [selectedUser, localMessages]);

    // Handle logout button
    const handleLogout = () => {
        toast.success('Logged out successfully');
        navigate('/login');
    };

    // Handle message sending
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || !selectedUser) return;

        const newMessage = {
            _id: Date.now().toString(),
            senderId: 'me',
            receiverId: selectedUser._id,
            text: inputMessage,
            createdAt: new Date().toISOString(),
        };

        setLocalMessages((prev) => {
            const userMsgs = prev[selectedUser._id] || [];
            return {
                ...prev,
                [selectedUser._id]: [...userMsgs, newMessage],
            };
        });

        setInputMessage('');
    };

    // Get current message thread
    const currentThread = selectedUser ? localMessages[selectedUser._id] || [] : [];

    return (
        <div className="relative h-screen w-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 md:p-6 overflow-hidden font-sans select-none">
            {/* Ambient Background Glows */}
            <div className="absolute top-[15%] left-[5%] w-[45%] h-[45%] rounded-full bg-blue-500/10 blur-[130px] animate-pulse duration-8000 pointer-events-none" />
            <div className="absolute bottom-[15%] right-[5%] w-[45%] h-[45%] rounded-full bg-purple-500/8 blur-[130px] animate-pulse duration-6000 pointer-events-none" />
            <div className="absolute top-[40%] right-[30%] w-[30%] h-[30%] rounded-full bg-indigo-500/5 blur-[120px] animate-pulse duration-7000 pointer-events-none" />

            {/* Radial Dot Grid Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-35 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_20%,rgba(0,0,0,0.65)_100%)] pointer-events-none" />

            {/* Chat Card Container */}
            <div className="w-full max-w-6xl h-[85vh] min-h-[600px] flex flex-col md:flex-row bg-slate-950/50 backdrop-blur-2xl border border-slate-800/95 border-t-white/10 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.65),0_0_50px_rgba(59,130,246,0.06)] overflow-hidden z-10 transition-all duration-500 hover:border-slate-700/50">
                
                {/* Left Section (30% Width) */}
                <div className="w-full md:w-[30%] h-1/2 md:h-full flex flex-col border-r border-slate-900 bg-slate-950/10 z-10">
                    
                    {/* First Div: Profile Header */}
                    <div className="p-5 border-b border-slate-900 flex items-center justify-between bg-slate-950/20 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center text-slate-200 font-semibold shadow-inner">
                                <span className="text-sm">
                                    {currentUser.fullName.split(' ').map(n => n[0]).join('')}
                                </span>
                            </div>
                            <div className="text-left">
                                <h4 className="text-base font-semibold text-slate-200">{currentUser.fullName}</h4>
                                <p className="text-xs text-slate-500 mt-0.5">{currentUser.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-450 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200 cursor-pointer focus:outline-none"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>

                    {/* Second Div: Navigation Tab Buttons */}
                    <div className="p-3 border-b border-slate-900 flex gap-2 bg-slate-950/10">
                        <button
                            onClick={() => setActiveTab('chats')}
                            className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer focus:outline-none border ${
                                activeTab === 'chats'
                                    ? 'bg-blue-600/15 border-blue-500/30 text-blue-400 shadow-inner'
                                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                            }`}
                        >
                            <MessageSquare size={16} />
                            Chats
                        </button>
                        <button
                            onClick={() => setActiveTab('contacts')}
                            className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer focus:outline-none border ${
                                activeTab === 'contacts'
                                    ? 'bg-blue-600/15 border-blue-500/30 text-blue-400 shadow-inner'
                                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                            }`}
                        >
                            <Users size={16} />
                            Contacts
                        </button>
                    </div>

                    {/* Third Div: Users/Contacts List */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-transparent scrollbar-thin">
                        {activeTab === 'chats' ? (
                            MOCK_CHATS.map((chat) => (
                                <button
                                    key={chat._id}
                                    onClick={() => setSelectedUser(chat)}
                                    className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all duration-200 border cursor-pointer focus:outline-none group ${
                                        selectedUser?._id === chat._id
                                            ? 'bg-slate-900/50 border-slate-800/80 text-white shadow-inner shadow-black/20'
                                            : 'bg-slate-900/5 border-transparent text-slate-400 hover:bg-slate-900/25 hover:border-slate-800/40 hover:text-slate-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 flex items-center justify-center text-slate-200 font-semibold relative shadow-inner shrink-0">
                                            <span className="text-xs">{chat.fullName.split(' ').map(n => n[0]).join('')}</span>
                                            {chat.isOnline && (
                                                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
                                            )}
                                        </div>
                                        <div className="overflow-hidden">
                                            <h5 className={`text-sm font-semibold transition-colors duration-200 ${selectedUser?._id === chat._id ? 'text-white' : 'text-slate-350'}`}>
                                                {chat.fullName}
                                            </h5>
                                            <p className="text-xs text-slate-505 truncate max-w-[180px] mt-0.5">{chat.lastMessage}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-2">
                                        <span className="text-[10px] text-slate-600 group-hover:text-slate-500 transition-colors">{chat.time}</span>
                                    </div>
                                </button>
                            ))
                        ) : (
                            MOCK_CONTACTS.map((contact) => (
                                <button
                                    key={contact._id}
                                    onClick={() => {
                                        setSelectedUser(contact);
                                        setActiveTab('chats'); // Jump to chats tab upon selection
                                    }}
                                    className="w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all duration-205 border border-transparent hover:bg-slate-900/25 hover:border-slate-800/40 text-slate-400 hover:text-slate-200 cursor-pointer focus:outline-none"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 flex items-center justify-center text-slate-200 font-semibold relative shadow-inner shrink-0">
                                            <span className="text-xs">{contact.fullName.split(' ').map(n => n[0]).join('')}</span>
                                            {contact.status === 'Online' && (
                                                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
                                            )}
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-semibold text-slate-300">{contact.fullName}</h5>
                                            <p className="text-xs text-slate-500 mt-0.5">{contact.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-[10px] text-slate-600">{contact.status}</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Section (70% Width) */}
                <div className="w-full md:w-[70%] h-1/2 md:h-full flex flex-col bg-slate-950/40 backdrop-blur-3xl z-10 relative">
                    
                    {selectedUser ? (
                        <>
                            {/* Selected Partner Header */}
                            <div className="p-4 border-b border-slate-900 flex items-center justify-between bg-slate-950/20 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 flex items-center justify-center text-slate-200 font-semibold relative shadow-inner">
                                        <span className="text-xs">{selectedUser.fullName.split(' ').map(n => n[0]).join('')}</span>
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-base font-semibold text-slate-200">{selectedUser.fullName}</h4>
                                        <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                                            <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                                            active now
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Message History list */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950/5">
                                {currentThread.map((msg) => {
                                    const isMe = msg.senderId === 'me';
                                    return (
                                        <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed text-left border bg-slate-900/40 text-slate-200 border-slate-850 shadow-md ${
                                                isMe ? 'rounded-tr-none border-blue-500/10 shadow-blue-500/2' : 'rounded-tl-none'
                                            }`}>
                                                <p>{msg.text}</p>
                                                <span className="text-[10px] text-slate-500 block text-right mt-1.5">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Sender controls */}
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-900 bg-slate-950/20">
                                <div className="flex items-stretch gap-2">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        className="flex-1 bg-slate-900/10 border border-slate-800/80 rounded-xl px-4 py-3.5 text-base text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10 focus:bg-slate-950/60 shadow-inner"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!inputMessage.trim()}
                                        className="px-5 bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-md shadow-blue-500/10 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] flex items-center justify-center shrink-0"
                                    >
                                        <SendHorizontal size={20} />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        /* Welcome Screen Placeholder */
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in relative overflow-hidden">
                            {/* Ambient back glow behind logo */}
                            <div className="absolute w-[200px] h-[200px] rounded-full bg-blue-500/5 blur-[80px] pointer-events-none" />
                            
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 shadow-[0_0_40px_rgba(59,130,246,0.12)] border-t-white/10 animate-float z-10">
                                <MessageSquare size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-200 mb-2 z-10">Welcome to NexTalk</h3>
                            <p className="text-xs text-slate-500 max-w-xs leading-relaxed z-10">
                                Select a chat or contact from the left list to begin messaging and sharing.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
