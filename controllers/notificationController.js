import { User } from '../models/user.model.js';
import { Expo } from 'expo-server-sdk';

// Create a new Expo SDK client
let expo = new Expo();

const notificationController = {
    // Endpoint to register a user's push token
    registerPushToken: async (req, res) => {
        const { userId, token } = req.body;

        if (!userId || !token) {
            return res.status(400).json({ message: 'User ID and token are required.' });
        }

        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            // Check if the token already exists for the user
            const tokenExists = user.expoPushTokens.some(
                (t) => t.token === token
            );

            if (!tokenExists) {
                user.expoPushTokens.push({ token: token });
                await user.save();
                return res.status(200).json({ message: 'Push token registered successfully.' });
            } else {
                return res.status(200).json({ message: 'Push token already registered.' });
            }
        } catch (error) {
            console.error('Error registering push token:', error);
            res.status(500).json({ message: 'Server error.', error: error.message });
        }
    },

    // Function to send a push notification
    sendPushNotification: async (userId, title, body, data = {}) => {
        try {
            const user = await User.findById(userId);
            if (!user || !user.expoPushTokens || user.expoPushTokens.length === 0) {
                console.log(`No push tokens found for user ${userId}. Skipping notification.`);
                return;
            }

            let messages = [];
            for (let pushTokenEntry of user.expoPushTokens) {
                const pushToken = pushTokenEntry.token;

                // Check that all your push tokens appear to be valid Expo push tokens
                if (!Expo.isExpoPushToken(pushToken)) {
                    console.error(`Push token ${pushToken} is not a valid Expo push token.`);
                    continue;
                }

                messages.push({
                    to: pushToken,
                    sound: 'default',
                    title: title,
                    body: body,
                    data: data, // Optional data for deep linking or custom handling
                });
            }

            let chunks = expo.chunkPushNotifications(messages);
            let tickets = [];

            for (let chunk of chunks) {
                try {
                    let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                    console.log('Sent push notification chunk:', ticketChunk);
                    tickets.push(...ticketChunk);
                    // Handle Expo push ticket errors (optional, but good for debugging)
                    // You might want to store these tickets to check their status later
                } catch (error) {
                    console.error('Error sending push notification chunk:', error);
                }
            }

            // You can optionally check the receipt IDs for delivery status
            // (This is more advanced and often done in a separate cron job or endpoint)
            // let receiptIds = [];
            // for (let ticket of tickets) {
            //   if (ticket.id) {
            //     receiptIds.push(ticket.id);
            //   }
            // }
            // let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
            // for (let chunk of receiptIdChunks) {
            //   try {
            //     let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
            //     console.log(receipts);
            //   } catch (error) {
            //     console.error('Error getting receipts:', error);
            //   }
            // }

        } catch (error) {
            console.error('Error sending push notification:', error);
        }
    }
};

export default notificationController;