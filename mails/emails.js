import { transporter, Sender } from './nodemailer.config.js';
import { VERIFICATION_EMAIL_TEMPLATE } from './emailtemplate.js';
import { PASSWORD_RESET_REQUEST_TEMPLATE } from './emailtemplate.js';
import { PASSWORD_RESET_SUCCESS_TEMPLATE } from './emailtemplate.js';
import { CARD_APPROVAL_TEMPLATE } from './emailtemplate.js';
import { CARD_REJECTION_TEMPLATE } from './emailtemplate.js';


export const sendVerificationEmail = async (email, verificationToken) => {
    try {
        await transporter.sendMail({
            from: `${Sender.name} <${Sender.email}>`,
            to: email,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
        });
        console.log("Verification email sent successfully.");
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw new Error("Error sending verification email.");
    }
};


export const sendCardApprovalEmail = async (email, cardDetails) => {
    try {
        await transporter.sendMail({
            from: `${Sender.name} <${Sender.email}>`,
            to: email,
            subject: "Your Card Has Been Approved",
            html: CARD_APPROVAL_TEMPLATE(cardDetails),
        });
        console.log("Card approval email sent successfully.");
    } catch (error) {
        console.error("Error sending card approval email:", error);
        throw new Error("Error sending card approval email.");
    }
};

export const sendCardRejectionEmail = async (email, adminNotes) => {
    try {
        await transporter.sendMail({
            from: `${Sender.name} <${Sender.email}>`,
            to: email,
            subject: "Card Application Rejected",
            html: CARD_REJECTION_TEMPLATE(adminNotes),
        });
        console.log("Card rejection email sent successfully.");
    } catch (error) {
        console.error("Error sending card rejection email:", error);
        throw new Error("Error sending card rejection email.");
    }
};
/*export const sendWelcomeEmail = async (email, name) => {
    try {
        await transporter.sendMail({
            from: `${Sender.name} <${Sender.email}>`,
            to: email,
            subject: "Welcome to our service!",
            html: `<p>Hello ${name},</p><p>Welcome to STB! We are excited to have you on board.</p>`,  
        });
        console.log("Welcome email sent successfully.");
    } catch (error) {
        console.error("Error sending welcome email:", error);
        throw new Error("Error sending welcome email.");
    }
};*/

export const sendPasswordResetEmail = async (email, resetUrl) => {
    try {
        await transporter.sendMail({
            from: `${Sender.name} <${Sender.email}>`,
            to: email,
            subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE(resetUrl),
        });
        console.log("Password reset email sent successfully.");
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw new Error("Error sending password reset email.");
    }
};

export const sendResetSuccessEmail = async (email) => {
    try {
        await transporter.sendMail({
            from: `${Sender.name} <${Sender.email}>`,
            to: email,
            subject: "Password Reset Successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
        });
        console.log("Password reset success email sent successfully.");
    } catch (error) {
        console.error("Error sending password reset success email:", error);
        throw new Error("Error sending password reset success email.");
    }
};
