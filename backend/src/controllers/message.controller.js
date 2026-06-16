import { getAllContactsService } from '../services/message.service.js';

export const getContacts = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const contacts = await getAllContactsService(currentUserId);
        res.status(200).json({
            success: true,
            data: contacts,
        });
    } catch (error) {
        console.error('Error in getContacts:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
