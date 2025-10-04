/**
 * Notification Service - Automated Communication System
 * 
 * Handles automated notifications for:
 * - Reservation confirmations and updates
 * - Task assignments and completions
 * - Financial transactions and payouts
 * - System alerts and reminders
 */

const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

class NotificationService {
  constructor() {
    this.prisma = new PrismaClient();
    this.notificationTemplates = new Map();
    this.setupTemplates();
  }

  /**
   * Setup notification templates
   */
  setupTemplates() {
    // Reservation Confirmation Template
    this.notificationTemplates.set('RESERVATION_CONFIRMED', {
      subject: 'Reservation Confirmed - {propertyName}',
      emailTemplate: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">Reservation Confirmed!</h2>
          <p>Dear {guestName},</p>
          <p>Your reservation has been confirmed for <strong>{propertyName}</strong>.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Reservation Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Property:</strong> {propertyName}</li>
              <li><strong>Check-in:</strong> {checkInDate}</li>
              <li><strong>Check-out:</strong> {checkOutDate}</li>
              <li><strong>Guests:</strong> {guestCount}</li>
              <li><strong>Total Amount:</strong> AED {totalAmount}</li>
            </ul>
          </div>
          
          <p>We look forward to hosting you!</p>
          <p>Best regards,<br>The Roomy Team</p>
        </div>
      `,
      smsTemplate: 'Reservation confirmed for {propertyName}. Check-in: {checkInDate}. Total: AED {totalAmount}.'
    });

    // Task Assignment Template
    this.notificationTemplates.set('TASK_ASSIGNED', {
      subject: 'New Task Assigned - {taskTitle}',
      emailTemplate: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">New Task Assigned</h2>
          <p>Hello {assigneeName},</p>
          <p>A new task has been assigned to you:</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Task Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Title:</strong> {taskTitle}</li>
              <li><strong>Type:</strong> {taskType}</li>
              <li><strong>Property:</strong> {propertyName}</li>
              <li><strong>Priority:</strong> {priority}</li>
              <li><strong>Due Date:</strong> {dueDate}</li>
              <li><strong>Description:</strong> {description}</li>
            </ul>
          </div>
          
          <p>Please complete this task by the due date.</p>
          <p>Best regards,<br>The Roomy Team</p>
        </div>
      `,
      smsTemplate: 'New task assigned: {taskTitle} at {propertyName}. Due: {dueDate}. Priority: {priority}.'
    });

    // Payment Confirmation Template
    this.notificationTemplates.set('PAYMENT_CONFIRMED', {
      subject: 'Payment Confirmed - Reservation {reservationId}',
      emailTemplate: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Payment Confirmed!</h2>
          <p>Dear {guestName},</p>
          <p>Your payment has been successfully processed.</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Payment Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Amount:</strong> AED {amount}</li>
              <li><strong>Method:</strong> {paymentMethod}</li>
              <li><strong>Transaction ID:</strong> {transactionId}</li>
              <li><strong>Date:</strong> {paymentDate}</li>
              <li><strong>Reservation:</strong> {reservationId}</li>
            </ul>
          </div>
          
          <p>Thank you for your payment!</p>
          <p>Best regards,<br>The Roomy Team</p>
        </div>
      `,
      smsTemplate: 'Payment confirmed: AED {amount} for reservation {reservationId}. Transaction ID: {transactionId}.'
    });

    // Owner Payout Template
    this.notificationTemplates.set('OWNER_PAYOUT', {
      subject: 'Payout Processed - AED {amount}',
      emailTemplate: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Payout Processed</h2>
          <p>Dear {ownerName},</p>
          <p>Your payout has been processed successfully.</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Payout Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Amount:</strong> AED {amount}</li>
              <li><strong>Property:</strong> {propertyName}</li>
              <li><strong>Reservation:</strong> {reservationId}</li>
              <li><strong>Date:</strong> {payoutDate}</li>
              <li><strong>Method:</strong> {paymentMethod}</li>
            </ul>
          </div>
          
          <p>Thank you for using Roomy!</p>
          <p>Best regards,<br>The Roomy Team</p>
        </div>
      `,
      smsTemplate: 'Payout processed: AED {amount} for {propertyName}. Transaction ID: {transactionId}.'
    });
  }

  /**
   * Send notification
   */
  async sendNotification(type, recipient, data, channels = ['email']) {
    try {
      const template = this.notificationTemplates.get(type);
      if (!template) {
        throw new Error(`Notification template not found: ${type}`);
      }

      const results = [];

      // Send email notification
      if (channels.includes('email')) {
        const emailResult = await this.sendEmail(recipient, template, data);
        results.push(emailResult);
      }

      // Send SMS notification
      if (channels.includes('sms')) {
        const smsResult = await this.sendSMS(recipient, template, data);
        results.push(smsResult);
      }

      // Log notification
      await this.logNotification(type, recipient, data, results);

      logger.info(`Notification sent: ${type} to ${recipient}`);
      
      return {
        success: true,
        data: results,
        message: 'Notification sent successfully'
      };

    } catch (error) {
      logger.error(`Error sending notification: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send notification'
      };
    }
  }

  /**
   * Send email notification
   */
  async sendEmail(recipient, template, data) {
    try {
      // Replace template variables
      const subject = this.replaceVariables(template.subject, data);
      const htmlContent = this.replaceVariables(template.emailTemplate, data);

      // In a real implementation, this would integrate with an email service
      // like SendGrid, AWS SES, or similar
      logger.info(`Email sent to ${recipient}:`, {
        subject,
        htmlContent: htmlContent.substring(0, 200) + '...'
      });

      // Mock email sending
      return {
        channel: 'email',
        recipient,
        subject,
        status: 'sent',
        sentAt: new Date()
      };

    } catch (error) {
      logger.error(`Error sending email: ${error.message}`);
      return {
        channel: 'email',
        recipient,
        status: 'failed',
        error: error.message
      };
    }
  }

  /**
   * Send SMS notification
   */
  async sendSMS(recipient, template, data) {
    try {
      // Replace template variables
      const message = this.replaceVariables(template.smsTemplate, data);

      // In a real implementation, this would integrate with an SMS service
      // like Twilio, AWS SNS, or similar
      logger.info(`SMS sent to ${recipient}:`, {
        message
      });

      // Mock SMS sending
      return {
        channel: 'sms',
        recipient,
        message,
        status: 'sent',
        sentAt: new Date()
      };

    } catch (error) {
      logger.error(`Error sending SMS: ${error.message}`);
      return {
        channel: 'sms',
        recipient,
        status: 'failed',
        error: error.message
      };
    }
  }

  /**
   * Replace template variables with actual data
   */
  replaceVariables(template, data) {
    let result = template;
    
    Object.keys(data).forEach(key => {
      const placeholder = `{${key}}`;
      const value = data[key] || '';
      result = result.replace(new RegExp(placeholder, 'g'), value);
    });

    return result;
  }

  /**
   * Log notification for audit trail
   */
  async logNotification(type, recipient, data, results) {
    try {
      // In a real implementation, this would store in a notifications table
      logger.info(`Notification logged: ${type}`, {
        recipient,
        data,
        results,
        timestamp: new Date()
      });

      return true;
    } catch (error) {
      logger.error(`Error logging notification: ${error.message}`);
      return false;
    }
  }

  /**
   * Send reservation confirmation notification
   */
  async sendReservationConfirmation(reservation) {
    const data = {
      guestName: reservation.guestName,
      propertyName: reservation.property.name,
      checkInDate: new Date(reservation.checkInDate).toLocaleDateString(),
      checkOutDate: new Date(reservation.checkOutDate).toLocaleDateString(),
      guestCount: reservation.guests,
      totalAmount: reservation.totalAmount
    };

    return await this.sendNotification(
      'RESERVATION_CONFIRMED',
      reservation.guestEmail,
      data,
      ['email', 'sms']
    );
  }

  /**
   * Send task assignment notification
   */
  async sendTaskAssignment(task, assignee) {
    const data = {
      assigneeName: `${assignee.firstName} ${assignee.lastName}`,
      taskTitle: task.title,
      taskType: task.type,
      propertyName: task.property.name,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not specified',
      description: task.description || 'No description provided'
    };

    return await this.sendNotification(
      'TASK_ASSIGNED',
      assignee.email,
      data,
      ['email']
    );
  }

  /**
   * Send payment confirmation notification
   */
  async sendPaymentConfirmation(transaction, reservation) {
    const data = {
      guestName: reservation.guestName,
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod || 'Credit Card',
      transactionId: transaction.id,
      paymentDate: new Date(transaction.processedAt).toLocaleDateString(),
      reservationId: reservation.id
    };

    return await this.sendNotification(
      'PAYMENT_CONFIRMED',
      reservation.guestEmail,
      data,
      ['email', 'sms']
    );
  }

  /**
   * Send owner payout notification
   */
  async sendOwnerPayout(transaction, property, owner) {
    const data = {
      ownerName: `${owner.firstName} ${owner.lastName}`,
      amount: transaction.amount,
      propertyName: property.name,
      reservationId: transaction.reservationId,
      payoutDate: new Date(transaction.processedAt).toLocaleDateString(),
      paymentMethod: transaction.paymentMethod || 'Bank Transfer',
      transactionId: transaction.id
    };

    return await this.sendNotification(
      'OWNER_PAYOUT',
      owner.email,
      data,
      ['email']
    );
  }

  /**
   * Send reminder notification
   */
  async sendReminder(type, recipient, data) {
    try {
      // Custom reminder logic based on type
      let templateType;
      let reminderData;

      switch (type) {
        case 'CHECK_IN_REMINDER':
          templateType = 'CHECK_IN_REMINDER';
          reminderData = {
            guestName: data.guestName,
            propertyName: data.propertyName,
            checkInDate: data.checkInDate,
            checkInTime: data.checkInTime || '3:00 PM'
          };
          break;
        case 'CHECK_OUT_REMINDER':
          templateType = 'CHECK_OUT_REMINDER';
          reminderData = {
            guestName: data.guestName,
            propertyName: data.propertyName,
            checkOutDate: data.checkOutDate,
            checkOutTime: data.checkOutTime || '11:00 AM'
          };
          break;
        default:
          throw new Error(`Unknown reminder type: ${type}`);
      }

      return await this.sendNotification(
        templateType,
        recipient,
        reminderData,
        ['email', 'sms']
      );

    } catch (error) {
      logger.error(`Error sending reminder: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send reminder'
      };
    }
  }

  /**
   * Get notification history
   */
  async getNotificationHistory(filters = {}) {
    try {
      // In a real implementation, this would query a notifications table
      // For now, return mock data
      const notifications = [
        {
          id: '1',
          type: 'RESERVATION_CONFIRMED',
          recipient: 'guest@example.com',
          status: 'sent',
          sentAt: new Date(),
          channel: 'email'
        }
      ];

      return {
        success: true,
        data: notifications,
        message: 'Notification history retrieved successfully'
      };

    } catch (error) {
      logger.error(`Error retrieving notification history: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve notification history'
      };
    }
  }
}

// Singleton instance
const notificationService = new NotificationService();

module.exports = notificationService;
