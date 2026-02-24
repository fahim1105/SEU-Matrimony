import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User, Search, Clock, CheckCircle2, Heart, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import UseAuth from '../../Hooks/UseAuth';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import BackButton from '../../Components/BackButton/BackButton';
import Loader from '../../Components/Loader/Loader';
import toast from 'react-hot-toast';

const Messages = () => {
    const { t } = useTranslation();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef(null);
    const pollIntervalRef = useRef(null);
    
    const { user } = UseAuth();
    const axiosSecure = UseAxiosSecure();

    useEffect(() => {
        if (user?.email) {
            fetchConversations();
        }
    }, [user]);

    // Handle URL parameters for direct conversation access
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const conversationId = urlParams.get('conversation');
        const userEmail = urlParams.get('user');
        
        if (conversationId && conversations.length > 0) {
            const conversation = conversations.find(conv => conv._id === conversationId);
            if (conversation) {
                setSelectedConversation(conversation);
            }
        } else if (userEmail && conversations.length > 0) {
            const conversation = conversations.find(conv => conv.otherUser.email === userEmail);
            if (conversation) {
                setSelectedConversation(conversation);
            }
        }
    }, [conversations]);

    useEffect(() => {
        // Set up polling for real-time updates when a conversation is selected
        if (selectedConversation) {
            fetchMessages(selectedConversation._id);
            
            // Poll for new messages every 3 seconds
            pollIntervalRef.current = setInterval(() => {
                fetchMessages(selectedConversation._id, true); // Silent fetch
            }, 3000);
        }

        // Cleanup polling when conversation changes
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [selectedConversation]);

    // Smart scroll: only scroll to bottom when opening conversation or sending message
    const scrollToBottom = (smooth = true) => {
        messagesEndRef.current?.scrollIntoView({ 
            behavior: smooth ? 'smooth' : 'auto',
            block: 'end',
            inline: 'nearest'
        });
    };

    const fetchConversations = async () => {
        setLoading(true);
        try {
            // Get accepted requests to create conversations
            const response = await axiosSecure.get(`/accepted-conversations/${user.email}`);
            if (response.data.success) {
                setConversations(response.data.conversations || []);
            } else {
                setConversations([]);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
            setConversations([]);
            if (error.response?.status !== 404) {
                toast.error('কথোপকথন লোড করতে সমস্যা হয়েছে');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (conversationId, silent = false) => {
        try {
            const response = await axiosSecure.get(`/messages/${conversationId}`);
            if (response.data.success) {
                setMessages(response.data.messages || []);
                
                // Mark messages as read
                if (!silent && response.data.messages?.length > 0) {
                    await axiosSecure.patch(`/mark-messages-read/${conversationId}/${user.email}`);
                }
                
                // Scroll to bottom when first loading messages (not silent)
                if (!silent) {
                    setTimeout(() => scrollToBottom(false), 100); // Small delay to ensure DOM is updated
                }
            } else {
                setMessages([]);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            setMessages([]);
            if (!silent && error.response?.status !== 404) {
                toast.error('মেসেজ লোড করতে সমস্যা হয়েছে');
            }
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            const messageData = {
                conversationId: selectedConversation._id,
                senderEmail: user.email,
                receiverEmail: selectedConversation.otherUser.email,
                message: newMessage.trim()
            };

            const response = await axiosSecure.post('/send-message', messageData);
            if (response.data.success) {
                // Add message to local state immediately for better UX
                const newMsg = {
                    ...messageData,
                    sentAt: new Date(),
                    isRead: false
                };
                setMessages(prev => [...prev, newMsg]);
                setNewMessage('');
                
                // Scroll to bottom after sending message
                setTimeout(() => scrollToBottom(true), 100);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('মেসেজ পাঠাতে সমস্যা হয়েছে');
        }
    };

    const handleConversationSelect = (conversation) => {
        setSelectedConversation(conversation);
        setMessages([]); // Clear previous messages
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.otherUser.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('bn-BD', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (date) => {
        const messageDate = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (messageDate.toDateString() === today.toDateString()) {
            return t('messagesPage.today');
        } else if (messageDate.toDateString() === yesterday.toDateString()) {
            return t('messagesPage.yesterday');
        } else {
            return messageDate.toLocaleDateString('bn-BD');
        }
    };

    if (loading) {
        return (
            // <div className="min-h-screen flex items-center justify-center">
            //     <div className="text-center">
            //         <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
            //         <p className="text-neutral/70">{t('messagesPage.loading')}</p>
            //     </div>
            // </div>
            <Loader></Loader>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 py-20 md:py-15">
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <BackButton label={t('messagesPage.backToDashboard')} />
                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral flex items-center gap-3">
                        <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                        {t('messagesPage.title')}
                    </h1>
                    <p className="text-neutral/70 mt-2 text-sm sm:text-base">{t('messagesPage.subtitle')}</p>
                </div>

                {/* Mobile: Stack layout, Desktop: Side by side */}
                <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6 h-[calc(100vh-200px)] sm:h-[calc(100vh-180px)] lg:h-[calc(100vh-220px)]">
                    {/* Conversations List */}
                    <div className={`${selectedConversation ? 'hidden lg:flex' : 'flex'} flex-col lg:col-span-1 bg-base-200 rounded-2xl sm:rounded-3xl overflow-hidden`}>
                        {/* Search - Fixed at top */}
                        <div className="p-4 sm:p-6 flex-shrink-0 border-b border-base-300">
                            <div className="flex items-center gap-3">
                                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-neutral/50 flex-shrink-0" />
                                <input
                                    type="text"
                                    placeholder={t('messagesPage.searchConversations')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-1 bg-base-100 border border-base-300 rounded-xl px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>

                        {/* Conversations - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 sm:space-y-3">
                            {filteredConversations.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center py-6 sm:py-8">
                                        <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-neutral/30 mx-auto mb-3 sm:mb-4" />
                                        <h3 className="text-base sm:text-lg font-semibold text-neutral mb-2">
                                            {searchTerm ? t('messagesPage.noResults') : t('messagesPage.noConversations')}
                                        </h3>
                                        <p className="text-neutral/70 text-xs sm:text-sm">
                                            {searchTerm ? t('messagesPage.noResultsDesc') : t('messagesPage.noConversationsDesc')}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                filteredConversations.map((conversation) => (
                                    <div
                                        key={conversation._id}
                                        onClick={() => handleConversationSelect(conversation)}
                                        className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl cursor-pointer transition-all hover:bg-base-100 flex-shrink-0 ${
                                            selectedConversation?._id === conversation._id 
                                                ? 'bg-primary/10 border-2 border-primary/20' 
                                                : 'bg-base-100'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {conversation.otherUser.profileImage ? (
                                                    <img 
                                                        src={conversation.otherUser.profileImage} 
                                                        alt={conversation.otherUser.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'block';
                                                        }}
                                                    />
                                                ) : null}
                                                <User 
                                                    className="w-5 h-5 sm:w-6 sm:h-6 text-primary" 
                                                    style={{ display: conversation.otherUser.profileImage ? 'none' : 'block' }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-neutral truncate text-sm sm:text-base">
                                                    {conversation.otherUser.name}
                                                </h4>
                                                {conversation.lastMessage ? (
                                                    <p className="text-xs sm:text-sm text-neutral/70 truncate">
                                                        {conversation.lastMessage.senderEmail === user.email ? `${t('messagesPage.you')}: ` : ''}
                                                        {conversation.lastMessage.message}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs sm:text-sm text-neutral/70 truncate">
                                                        {conversation.otherUser.email}
                                                    </p>
                                                )}
                                                <div className="flex items-center justify-between mt-1">
                                                    <div className="flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3 text-success" />
                                                        <span className="text-xs text-success">{t('messagesPage.connected')}</span>
                                                    </div>
                                                    {conversation.lastMessage && (
                                                        <span className="text-xs text-neutral/50">
                                                            {formatTime(conversation.lastMessage.sentAt)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={`${selectedConversation ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'} lg:col-span-2 bg-base-200 rounded-2xl sm:rounded-3xl h-full overflow-hidden`}>
                        {selectedConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 sm:p-6 border-b border-base-300 flex items-center gap-3 flex-shrink-0">
                                    {/* Mobile back button */}
                                    <button
                                        onClick={() => {
                                            setSelectedConversation(null);
                                            // Clear URL parameters when going back
                                            window.history.replaceState({}, '', window.location.pathname);
                                        }}
                                        className="lg:hidden p-2 hover:bg-base-300 rounded-xl transition-colors flex-shrink-0"
                                    >
                                        <ArrowLeft className="w-5 h-5 text-neutral" />
                                    </button>
                                    
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {selectedConversation.otherUser.profileImage ? (
                                            <img 
                                                src={selectedConversation.otherUser.profileImage} 
                                                alt={selectedConversation.otherUser.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                        ) : null}
                                        <User 
                                            className="w-5 h-5 sm:w-6 sm:h-6 text-primary" 
                                            style={{ display: selectedConversation.otherUser.profileImage ? 'none' : 'block' }}
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-neutral truncate text-sm sm:text-base">
                                            {selectedConversation.otherUser.name}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-neutral/70 truncate">
                                            {selectedConversation.otherUser.email}
                                        </p>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 p-4 sm:p-6 overflow-y-auto min-h-0">
                                    {messages.length === 0 ? (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center py-8 sm:py-12">
                                                <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-neutral/30 mx-auto mb-3 sm:mb-4" />
                                                <h3 className="text-base sm:text-lg font-semibold text-neutral mb-2">
                                                    কথোপকথন শুরু করুন
                                                </h3>
                                                <p className="text-neutral/70 text-sm">
                                                    প্রথম মেসেজ পাঠিয়ে কথোপকথন শুরু করুন
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 sm:space-y-4">
                                            {messages.map((message, index) => {
                                                const isOwnMessage = message.senderEmail === user.email;
                                                const showDate = index === 0 || 
                                                    formatDate(message.sentAt) !== formatDate(messages[index - 1].sentAt);
                                                
                                                return (
                                                    <div key={index}>
                                                        {showDate && (
                                                            <div className="text-center my-3 sm:my-4">
                                                                <span className="bg-base-300 text-neutral/70 px-3 py-1 rounded-full text-xs">
                                                                    {formatDate(message.sentAt)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div
                                                            className={`flex ${
                                                                isOwnMessage ? 'justify-end' : 'justify-start'
                                                            }`}
                                                        >
                                                            <div
                                                                className={`max-w-[280px] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
                                                                    isOwnMessage
                                                                        ? 'bg-primary text-base-100 rounded-br-md'
                                                                        : 'bg-base-100 text-neutral rounded-bl-md border border-base-300'
                                                                }`}
                                                            >
                                                                <p className="text-sm leading-relaxed break-words">{message.message}</p>
                                                                <div className="flex items-center justify-end gap-1 mt-1 sm:mt-2">
                                                                    <Clock className="w-3 h-3 opacity-70" />
                                                                    <span className="text-xs opacity-70">
                                                                        {formatTime(message.sentAt)}
                                                                    </span>
                                                                    {isOwnMessage && (
                                                                        <span className="text-xs opacity-70 ml-1">
                                                                            {message.isRead ? '✓✓' : '✓'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    )}
                                </div>

                                {/* Message Input */}
                                <div className="p-4 sm:p-6 border-t border-base-300 flex-shrink-0">
                                    <div className="flex gap-2 sm:gap-3">
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={handleKeyPress}
                                            placeholder={t('messagesPage.typePlaceholder')}
                                            className="flex-1 bg-base-100 border border-base-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none min-h-[40px] sm:min-h-[50px] max-h-[100px] sm:max-h-[120px] text-sm sm:text-base"
                                            rows={1}
                                            style={{ height: 'auto' }}
                                            onInput={(e) => {
                                                e.target.style.height = 'auto';
                                                e.target.style.height = Math.min(e.target.scrollHeight, window.innerWidth < 640 ? 100 : 120) + 'px';
                                            }}
                                        />
                                        <button
                                            onClick={sendMessage}
                                            className="bg-primary text-base-100 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 self-end text-sm sm:text-base flex-shrink-0"
                                        >
                                            <Send className="w-4 h-4" />
                                            <span className="hidden sm:inline">{t('messagesPage.send')}</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center p-4">
                                <div className="text-center">
                                    <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-neutral/30 mx-auto mb-3 sm:mb-4" />
                                    <h3 className="text-base sm:text-lg font-semibold text-neutral mb-2">
                                        {t('messagesPage.selectConversation')}
                                    </h3>
                                    <p className="text-neutral/70 text-sm">
                                        {t('messagesPage.selectConversationDesc')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messages;