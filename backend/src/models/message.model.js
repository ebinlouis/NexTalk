import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
            index: true,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        text: {
            type: String,
            default: '',
        },
        image: {
            type: String,
            default: null,
        },
        fileUrl: {
            type: String,
            default: null,
        },
        fileName: {
            type: String,
            default: null,
        },
        fileType: {
            type: String,
            default: null,
        },
        fileSize: {
            type: Number,
            default: null,
        },
        isEdited: {
            type: Boolean,
            default: false,
        },
        editedAt: {
            type: Date,
            default: null,
        },
        isDeletedForEveryone: {
            type: Boolean,
            default: false,
        },
        deletedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        timestamps: true,
    }
);

messageSchema.index({
    conversationId: 1,
    createdAt: -1,
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
