import Notification from '../models/Notification.js';
import axios from 'axios';

class NotificationService {
  constructor() {
    this.atApiKey = process.env.AFRICASTALKING_API_KEY;
    this.atUsername = process.env.AFRICASTALKING_USERNAME;
  }

  async sendSMS(to, message, userId, organizationId, type = 'general') {
    try {
      // Mocking Africa's Talking API call
      // In production:
      // const options = {
      //   apiKey: this.atApiKey,
      //   username: this.atUsername
      // };
      // const AfricasTalking = require('africastalking')(options);
      // const sms = AfricasTalking.SMS;
      // await sms.send({ to: [to], message });

      console.log(`[SMS Sent] To: ${to}, Message: ${message}`);

      // Log notification in database
      await Notification.create({
        userId,
        organizationId,
        title: type.toUpperCase(),
        message,
        type,
        channel: 'sms',
        status: 'sent'
      });

      return true;
    } catch (error) {
      console.error('SMS Notification Error:', error.message);
      return false;
    }
  }

  async sendEmail(to, subject, message, userId, organizationId, type = 'general') {
    try {
      // Mocking Email sending logic (e.g., using SendGrid or Nodemailer)
      console.log(`[Email Sent] To: ${to}, Subject: ${subject}`);

      // Log notification in database
      await Notification.create({
        userId,
        organizationId,
        title: subject,
        message,
        type,
        channel: 'email',
        status: 'sent'
      });

      return true;
    } catch (error) {
      console.error('Email Notification Error:', error.message);
      return false;
    }
  }
}

export default new NotificationService();
