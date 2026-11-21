import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { useConversationStore } from '../store/useConversationStore';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import NoChatSelected from '../components/chat/NoChatSelected';
import GroupInfoDrawer from '../components/chat/GroupInfoDrawer';

export default function ChatPage() {
    const navigate = useNavigate();
    const { logout, authUser } = useAuthStore();
    const {
        contacts,
        getContacts,
        messages,
        isLoadingMessages,
        getMessages,
        sendMessage,
        isSendingMessage,
        uploadAttachment,
        subscribeToMessages,
        unsubscribeFromMessages,
        sendTyping,
        sendStopTyping,
    } = useChatStore();

    const {
        conversations,
        getConversations,
        activeConversation,
        setActiveConversation,
        getOrCreateDirect,
        subscribeToConversationEvents,
        unsubscribeFromConversationEvents,
    } = useConversationStore();

    const [activeTab, setActiveTab] = useState('chats');
    const [inputMessage, setInputMessage] = useState('');
    const [inChatSearch, setInChatSearch] = useState('');
    const [isChatSearchOpen, setIsChatSearchOpen] = useState(false);
    const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
    const typingTimeoutRef = useRef(null);

    const currentUser = authUser || {
        fullName: 'Loading...',
        email: '',
        profilePic: '',
    };

    useEffect(() => {
        getContacts();
        getConversations();
        subscribeToConversationEvents();
        return () => unsubscribeFromConversationEvents();
    }, [getContacts, getConversations, subscribeToConversationEvents, unsubscribeFromConversationEvents]);

    useEffect(() => {
        if (activeConversation?._id) {
            getMessages(activeConversation._id).then((res) => {
                if (!res?.success && res?.error) toast.error(res.error);
            });
        }
        subscribeToMessages(activeConversation?._id);
        return () => unsubscribeFromMessages();
    }, [activeConversation?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

    const handleLogout = async () => {
        const { success } = await logout();
        if (success) {
            navigate('/login');
        }
    };

    const handleSelectContact = async (contact) => {
        const res = await getOrCreateDirect(contact._id);
        if (res?.success) {
            setActiveTab('chats');
        }
    };

    const handleTyping = () => {
        if (!activeConversation?._id) return;
        sendTyping(activeConversation._id);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            sendStopTyping(activeConversation._id);
        }, 1500);
    };

    const handleSendMessage = async (e, attachedFile) => {
        e?.preventDefault?.();
        const trimmed = inputMessage.trim();
        if ((!trimmed && !attachedFile) || !activeConversation || isSendingMessage) return;

        clearTimeout(typingTimeoutRef.current);
        sendStopTyping(activeConversation._id);

        let attachmentData = {};
        if (attachedFile) {
            const uploadRes = await uploadAttachment(attachedFile);
            if (uploadRes?.success) {
                const isImage = attachedFile.type.startsWith('image/');
                attachmentData = isImage
                    ? { image: uploadRes.data.url }
                    : {
                          fileUrl: uploadRes.data.url,
                          fileName: uploadRes.data.fileName || attachedFile.name,
                          fileType: uploadRes.data.fileType || attachedFile.type,
                          fileSize: uploadRes.data.fileSize || attachedFile.size,
                      };
            } else {
                toast.error(uploadRes?.error || 'Failed to upload attachment');
                return;
            }
        }

        const res = await sendMessage(activeConversation._id, { text: trimmed, ...attachmentData });
        if (res?.success) {
            setInputMessage('');
            getConversations();
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
                    users={conversations}
                    contacts={contacts}
                    selectedUser={activeConversation}
                    onSelectChat={setActiveConversation}
                    onSelectContact={handleSelectContact}
                    onLogout={handleLogout}
                />

                {/* Right Section */}
                <div
                    className={`flex-1 h-full flex-col bg-canvas z-10 relative ${
                        activeConversation ? 'flex' : 'hidden md:flex'
                    }`}
                >
                    {activeConversation ? (
                        <>
                            <ChatHeader
                                selectedUser={activeConversation}
                                onBack={() => setActiveConversation(null)}
                                searchQuery={inChatSearch}
                                onSearchChange={setInChatSearch}
                                isSearchOpen={isChatSearchOpen}
                                onToggleSearch={() => setIsChatSearchOpen((prev) => !prev)}
                                onOpenGroupInfo={() => setIsGroupInfoOpen(true)}
                            />
                            <MessageList
                                messages={messages}
                                isLoading={isLoadingMessages}
                                currentUserId={authUser?._id || authUser?.id}
                                partnerName={activeConversation?.name || activeConversation?.fullName}
                                searchQuery={inChatSearch}
                            />
                            <MessageInput
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onSubmit={handleSendMessage}
                                isSending={isSendingMessage}
                                onTyping={handleTyping}
                            />
                            {activeConversation.type === 'group' && (
                                <GroupInfoDrawer
                                    isOpen={isGroupInfoOpen}
                                    onClose={() => setIsGroupInfoOpen(false)}
                                    conversation={activeConversation}
                                />
                            )}
                        </>
                    ) : (
                        <NoChatSelected />
                    )}
                </div>
            </div>
        </div>
    );
}
