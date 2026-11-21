import mongoose from 'mongoose';

const conversationMemberSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        role: {
            type: String,
            enum: ['creator', 'admin', 'member'],
            default: 'member',
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
        lastReadAt: {
            type: Date,
            default: Date.now,
        },
        clearedHistoryAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

conversationMemberSchema.index({ conversationId: 1, userId: 1 }, { unique: true });
conversationMemberSchema.index({ userId: 1, conversationId: 1 });

const ConversationMember = mongoose.model('ConversationMember', conversationMemberSchema);
export default ConversationMember;
