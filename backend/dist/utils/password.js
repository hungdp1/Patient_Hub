import bcrypt from 'bcryptjs';
export const hashPassword = async (plainText) => {
    return bcrypt.hash(plainText, 12);
};
export const comparePassword = async (plainText, hash) => {
    return bcrypt.compare(plainText, hash);
};
//# sourceMappingURL=password.js.map