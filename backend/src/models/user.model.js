import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            minLength: 6,
        },
        profilePic: {
            type: String,
            default: '',
        },
        refreshTokens: [
            {
                tokenHash: { type: String, required: true },
                createdAt: { type: Date, default: Date.now },
            },
        ],
        lastSeen: {
            type: Date,
            default: Date.now,
        },
        bio: {
            type: String,
            default: 'Hey there! I am using NexTalk.',
            maxLength: 150,
        },
        status: {
            type: String,
            enum: ['available', 'busy', 'away'],
            default: 'available',
        },
    },
    {
        timestamps: true,
    },
);

const User = mongoose.model('User', userSchema);
export default User;
