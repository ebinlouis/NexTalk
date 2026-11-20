import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        text: {
            type: String,
        },
        image: {
            type: String,
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
        seen: {
            type: Boolean,
            default: false,
        },
        seenAt: {
            type: Date,
            default: null,
        },
        delivered: {
            type: Boolean,
            default: false,
        },
        deliveredAt: {
            type: Date,
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
    },
);

messageSchema.index({
    senderId: 1,
    receiverId: 1,
    createdAt: 1
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
