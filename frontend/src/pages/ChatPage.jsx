import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import NoChatSelected from '../components/chat/NoChatSelected';

export default function ChatPage() {
    const navigate = useNavigate();
    const { logout, authUser } = useAuthStore();
    const {
        contacts,
        getContacts,
        users,
        getUsers,
        messages,
        isLoadingMessages,
        getMessages,
        sendMessage,
        isSendingMessage,
        subscribeToMessages,
        unsubscribeFromMessages,
    } = useChatStore();

    // Navigation and state
    const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'contacts'
    const [selectedUser, setSelectedUser] = useState(null);
    const [inputMessage, setInputMessage] = useState('');

    const currentUser = authUser || {
        fullName: 'Loading...',
        email: '',
        profilePic: '',
    };

    useEffect(() => {
        getContacts();
        getUsers();
    }, []);

    useEffect(() => {
        if (selectedUser?._id) {
            getMessages(selectedUser._id).then((res) => {
                if (!res?.success && res?.error) toast.error(res.error);
            });
        }
        subscribeToMessages(selectedUser?._id);
        return () => unsubscribeFromMessages();
    }, [selectedUser?._id]);

    const handleLogout = async () => {
        const { success } = await logout();
        if (success) {
            navigate('/login');
        }
    };

    const handleSelectContact = (contact) => {
        setSelectedUser(contact);
        setActiveTab('chats');
    };

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
                <ChatSidebar
                    currentUser={currentUser}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    users={users}
                    contacts={contacts}
                    selectedUser={selectedUser}
                    onSelectChat={setSelectedUser}
                    onSelectContact={handleSelectContact}
                    onLogout={handleLogout}
                />

                {/* Right Section */}
                <div className={`flex-1 h-full flex-col bg-canvas z-10 relative ${selectedUser ? 'flex' : 'hidden md:flex'}`}>
                    {selectedUser ? (
                        <>
                            <ChatHeader
                                selectedUser={selectedUser}
                                onBack={() => setSelectedUser(null)}
                            />
                            <MessageList
                                messages={messages}
                                isLoading={isLoadingMessages}
                                currentUserId={authUser?._id || authUser?.id}
                                partnerName={selectedUser?.fullName}
                            />
                            <MessageInput
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onSubmit={handleSendMessage}
                                isSending={isSendingMessage}
                            />
                        </>
                    ) : (
                        <NoChatSelected />
                    )}
                </div>
            </div>
        </div>
    );
}
