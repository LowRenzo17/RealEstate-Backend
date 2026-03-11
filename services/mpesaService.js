import axios from 'axios';
import { Buffer } from 'buffer';
import { DateTime } from 'luxon';

class MpesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.shortCode = process.env.MPESA_SHORTCODE;
    this.passkey = process.env.MPESA_PASSKEY;
    this.callbackUrl = process.env.MPESA_CALLBACK_URL;
    this.env = process.env.MPESA_ENV || 'sandbox';
    
    this.baseUrl = this.env === 'sandbox' 
      ? 'https://sandbox.safaricom.co.ke' 
      : 'https://api.safaricom.co.ke';
  }

  async getAccessToken() {
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    try {
      const response = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: { Authorization: `Basic ${auth}` }
      });
      return response.data.access_token;
    } catch (error) {
      console.error('Error generating M-Pesa access token:', error.response?.data || error.message);
      throw new Error('Failed to generate M-Pesa access token');
    }
  }

  async stkPush(phoneNumber, amount, accountReference, transactionDesc) {
    const accessToken = await this.getAccessToken();
    const timestamp = DateTime.now().toFormat('yyyyMMddHHmmss');
    const password = Buffer.from(`${this.shortCode}${this.passkey}${timestamp}`).toString('base64');

    const payload = {
      BusinessShortCode: this.shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: this.shortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: this.callbackUrl,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc
    };

    try {
      const response = await axios.post(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, payload, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('M-Pesa STK Push error:', error.response?.data || error.message);
      throw new Error('Failed to initiate M-Pesa STK Push');
    }
  }
}

export default new MpesaService();
