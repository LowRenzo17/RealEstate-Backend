import User from "../models/User.js";

import generateToken from "../utils/generateToken.js";

export const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(404).json({ success: false, message: "All fields are required" })
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(404).json({ success: false, message: "The user already exist!" })
        }
        const user = await User.create({ name, email, password, role });
        const token = generateToken(user._id);
        res.status(201).json({ success: true, message: "User created successfully", token })
    } catch (error) {
        next(error)
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please provide email and password" })
        }
        const user = await User.findOne({ email }).select("+password");
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: "Invalid credentials" })
        }
        const token = generateToken(user._id);
        res.status(200).json({ success: true, message: "Login successfully", token })
    } catch (error) {
        next(error)
    }
}

export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user })
    } catch (error) {
        next(error)
    }
}