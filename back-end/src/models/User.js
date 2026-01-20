// In-memory user storage (replace with database in production)
class UserModel {
  constructor() {
    this.users = [];
    this.currentId = 1;
  }

  findByEmail(email) {
    return this.users.find(user => user.email === email);
  }

  findById(id) {
    return this.users.find(user => user.id === id);
  }

  create(userData) {
    const user = {
      id: this.currentId++,
      ...userData,
      createdAt: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }

  getAll() {
    return this.users;
  }
}

export default new UserModel();
