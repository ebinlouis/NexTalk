import User from '../models/user.model.js';

export const getAllContactsService = async (currentUserId) => {
    // Find all users except the logged-in user, excluding passwords
    const users = await User.find({ _id: { $ne: currentUserId } }).select('-password');
    return users;
};
