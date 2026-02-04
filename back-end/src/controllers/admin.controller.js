import { findAllUsers } from "../repositories/users.repository.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await findAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};
