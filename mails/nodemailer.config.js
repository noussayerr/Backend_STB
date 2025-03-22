import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'noussayer.rahal.83@gmail.com',
        pass:'ssmyhggpkuabjlkj', 
    },
});

export const Sender = {
    email:'noussayer.rahal.83@gmail.com',
    name: "STB",
};
