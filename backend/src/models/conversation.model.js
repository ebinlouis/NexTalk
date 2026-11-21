import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['direct', 'group'],
            default: 'direct',
            required: true,
        },
        name: {
            type: String,
            trim: true,
            maxlength: 60,
            default: null,
        },
        description: {
            type: String,
            maxlength: 250,
            default: null,
        },
        avatar: {
            type: String,
            default: null,
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        permissions: {
            onlyAdminsCanPost: {
                type: Boolean,
                default: false,
            },
            onlyAdminsCanEditInfo: {
                type: Boolean,
                default: true,
            },
            onlyAdminsCanAddMembers: {
                type: Boolean,
                default: true,
            },
        },
        lastMessage: {
            text: {
                type: String,
                default: null,
            },
            senderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                default: null,
            },
            senderName: {
                type: String,
                default: null,
            },
            createdAt: {
                type: Date,
                default: null,
            },
        },
    },
    {
        timestamps: true,
    }
);

conversationSchema.index({ 'lastMessage.createdAt': -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
