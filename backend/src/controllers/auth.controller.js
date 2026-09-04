import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { sequelize } from "../config/db.js";


export const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.json({ token });
};

export const register = async (req, res) => {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
    if (username.length < 3) {
        return res.status(400).json({ message: "Username must be at least 3 characters long" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        return res.status(409).json({ message: "Email already exists" });
    }
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
        return res.status(409).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        username,
        email,
        password_hash: hashedPassword
    });

    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.json({ token });
};

export const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ message: "Missing Google credential" });
        }

        let email, name, picture, googleId;

        const isDevOrDemo = credential.startsWith("demo_google_") || 
            (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID.includes("your_google"));

        if (isDevOrDemo) {
            email = req.body.email || "google_user@ceferly.com";
            name = req.body.name || "Google Learner";
            googleId = "google_sub_" + Buffer.from(email).toString('hex').slice(0, 16);
        } else {
            const { OAuth2Client } = await import('google-auth-library');
            const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID
            });

            const payload = ticket.getPayload();
            email = payload.email;
            name = payload.name;
            picture = payload.picture;
            googleId = payload.sub;
        }

        if (!email) {
            return res.status(400).json({ message: "Email not provided by Google" });
        }

        let user = await User.findOne({
            where: {
                [sequelize.Sequelize.Op.or]: [
                    { email },
                    { google_id: googleId }
                ]
            }
        });

        if (!user) {
            const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
            user = await User.create({
                name: name || email.split('@')[0],
                username,
                email,
                password_hash: await bcrypt.hash(Math.random().toString(36), 10),
                google_id: googleId,
                avatar_seed: email,
                coins: 10
            });
        } else if (!user.google_id) {
            user.google_id = googleId;
            await user.save();
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(401).json({ message: "Invalid Google token" });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const crypto = await import('crypto');
        const token = crypto.randomBytes(20).toString('hex');
        const expires = Date.now() + 3600000;

        user.reset_password_token = token;
        user.reset_password_expires = expires;
        await user.save();

        const rawUrl = process.env.ENV === "TEST" ? process.env.URL_FRONT_TEST : process.env.URL_PROD;

        const resetUrl = `${rawUrl}/reset-password/${token}`;

        try {
            const { Resend } = await import('resend');
            const resend = new Resend(process.env.RESEND_API_KEY);

            await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: email,
                subject: 'Restablecer contraseña - QuickGram',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin: 0; padding: 0; background-color: #0e1515; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0e1515; padding: 40px 0;">
                            <tr>
                                <td align="center">
                                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #161f1f; border-radius: 20px; border: 1px solid #2a3b3b; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                                        
                                        <tr>
                                            <td align="center" style="padding: 40px 0 20px 0;">
                                                <div style="display: inline-block; padding: 15px; border-radius: 50%; background-color: rgba(46, 204, 113, 0.1);">
                                                    <span style="font-size: 30px;">🔐</span>
                                                </div>
                                            </td>
                                        </tr>
                                
                                        <tr>
                                            <td align="center" style="padding: 0 40px;">
                                                <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: 600;">Restablecer Contraseña</h1>
                                            </td>
                                        </tr>
                                
                                        <tr>
                                            <td align="center" style="padding: 20px 40px; color: #a0aec0; font-size: 16px; line-height: 1.5;">
                                                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Si fuiste tú, haz clic en el botón de abajo.
                                            </td>
                                        </tr>
                                
                                        <tr>
                                            <td align="center" style="padding: 30px 40px;">
                                                <a href="${resetUrl}" style="background-color: #2ecc71; color: #0e1515; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 0 15px rgba(46, 204, 113, 0.4); letter-spacing: 0.5px;">
                                                    Restablecer mi contraseña &rarr;
                                                </a>
                                            </td>
                                        </tr>
                                
                                        <tr>
                                            <td align="center" style="padding: 0 40px 40px 40px; color: #718096; font-size: 13px;">
                                                <p style="margin: 0;">Este enlace expirará en <strong>1 hora</strong>.</p>
                                                <p style="margin: 10px 0 0 0;">Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
                                            </td>
                                        </tr>
                                        
                                    </table>
                                    
                                    <p style="color: #4a5568; font-size: 12px; margin-top: 20px;">
                                        &copy; ${new Date().getFullYear()} QuickGram. Todos los derechos reservados.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
                    `
            });
            console.log(`Reset email sent to ${email}`);
        } catch (emailError) {
            console.error('Resend error:', emailError);
            console.log(`Backup Link: ${resetUrl}`);
            return res.status(500).json({ message: "Error sending email, check console for backup link" });
        }

        res.json({ message: "Enlace de recuperación enviado a tu correo" });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    try {
        const { Op } = await import("sequelize");
        const user = await User.findOne({
            where: {
                reset_password_token: token,
                reset_password_expires: { [Op.gt]: Date.now() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: "Password reset token is invalid or has expired" });
        }

        user.password_hash = await bcrypt.hash(password, 10);
        user.reset_password_token = null;
        user.reset_password_expires = null;
        await user.save();

        res.json({ message: "Password has been reset" });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};
