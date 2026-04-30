import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { signToken } from "../utils/token.js";
import { toUser } from "../utils/serializers.js";

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) return res.status(409).json({ message: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash });

  res.status(201).json({ token: signToken(user), user: toUser(user) });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) return res.status(401).json({ message: "Invalid credentials" });

  res.json({ token: signToken(user), user: toUser(user) });
};

export const me = async (req, res) => {
  res.json({ user: toUser(req.user) });
};
