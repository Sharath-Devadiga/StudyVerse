import jwt from "jsonwebtoken";

export function generateJwt(payload: object, expiresIn: jwt.SignOptions["expiresIn"] = "7d") {
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn });
}