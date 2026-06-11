import User from '../models/user.model.js';
import CustomError from '../utils/error.js';
import { hashPassword } from '../utils/bcrypt.js';

export const signupService = async (data) => {
    const { fullName, email, password } = data;
    try {
        if (!fullName || !email || !password) {
            throw new CustomError('All Fields are required', 400);
        }

        if (password.length < 6) {
            throw new CustomError('Password must be at least 6 characters long', 400);
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) throw new CustomError('User already exists', 409);

        const hashedPassword = await hashPassword(password);

       const newUser = await User.create({
        fullName:fullName,
        email:email,
        password:hashedPassword,
       })

        return { userId: newUser._id, success: true, message: 'User created successfully' };
    } catch (error) {
        throw error;
    }
};
export const loginService = () => {};
export const logoutService = () => {};
