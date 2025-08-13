import jwt from 'jsonwebtoken'

export function generateJwt(payload: object) {
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" });
}