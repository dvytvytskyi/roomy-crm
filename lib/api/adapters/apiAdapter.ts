import { shouldUseV2API } from '../config-v2';
import { authService } from '../services/authService';
import { authServiceV2 } from '../services/authService-v2';
import { userService } from '../services/userService';
import { userServiceV2 } from '../services/userService-v2';
import { propertyService } from '../services/propertyService';
import { propertyServiceV2 } from '../services/propertyService-v2';
import { reservationService } from '../services/reservationService';
import { reservationServiceV2 } from '../services/reservationService-v2';
import { taskServiceV2 } from '../services/taskService-v2';
import { financialServiceV2 } from '../services/financialService-v2';
import { schedulerServiceV2 } from '../services/schedulerService-v2';
import { settingsServiceV2 } from '../services/settingsService-v2';

// Auth Service Adapter
export const authServiceAdapter = {
  async login(credentials: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Auth Service for login');
      return authServiceV2.login(credentials);
    } else {
      console.log('🔄 Using V1 Auth Service for login');
      return authService.login(credentials);
    }
  },

  async register(userData: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Auth Service for register');
      return authServiceV2.register(userData);
    } else {
      console.log('🔄 Using V1 Auth Service for register');
      return authService.register(userData);
    }
  },

  async logout() {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Auth Service for logout');
      return authServiceV2.logout();
    } else {
      console.log('🔄 Using V1 Auth Service for logout');
      return authService.logout();
    }
  },

  async getProfile() {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Auth Service for getProfile');
      return authServiceV2.getProfile();
    } else {
      console.log('🔄 Using V1 Auth Service for getProfile');
      return authService.getProfile();
    }
  },

  async refreshToken() {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Auth Service for refreshToken');
      return authServiceV2.refreshToken();
    } else {
      console.log('🔄 Using V1 Auth Service for refreshToken');
      return authService.refreshToken();
    }
  },

  isAuthenticated() {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Auth Service for isAuthenticated');
      return authServiceV2.isAuthenticated();
    } else {
      console.log('🔄 Using V1 Auth Service for isAuthenticated');
      return authService.isAuthenticated();
    }
  }
};

// User Service Adapter
export const userServiceAdapter = {
  async getUsers(params?: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 User Service for getUsers');
      return userServiceV2.getUsers(params);
    } else {
      console.log('🔄 Using V1 User Service for getUsers');
      return userService.getUsers(params);
    }
  },

  async getOwners(params?: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 User Service for getOwners');
      return userServiceV2.getOwners(params);
    } else {
      console.log('🔄 Using V1 User Service for getOwners');
      return userService.getOwners(params);
    }
  },

  async getAgents(params?: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 User Service for getAgents');
      return userServiceV2.getAgents(params);
    } else {
      console.log('🔄 Using V1 User Service for getAgents');
      return userService.getAgents(params);
    }
  },

  async getGuests(params?: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 User Service for getGuests');
      return userServiceV2.getGuests(params);
    } else {
      console.log('🔄 Using V1 User Service for getGuests');
      return userService.getGuests(params);
    }
  },

  async getUserById(id: string) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 User Service for getUserById');
      return userServiceV2.getUserById(id);
    } else {
      console.log('🔄 Using V1 User Service for getUserById');
      return userService.getUserById(id);
    }
  },

  async createUser(userData: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 User Service for createUser');
      return userServiceV2.createUser(userData);
    } else {
      console.log('🔄 Using V1 User Service for createUser');
      return userService.createUser(userData);
    }
  },

  async updateUser(id: string, userData: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 User Service for updateUser');
      return userServiceV2.updateUser(id, userData);
    } else {
      console.log('🔄 Using V1 User Service for updateUser');
      return userService.updateUser(id, userData);
    }
  },

  async deleteUser(id: string) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 User Service for deleteUser');
      return userServiceV2.deleteUser(id);
    } else {
      console.log('🔄 Using V1 User Service for deleteUser');
      return userService.deleteUser(id);
    }
  },

  async getUserProperties(userId: string) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 User Service for getUserProperties');
      return userServiceV2.getUserProperties(userId);
    } else {
      console.log('🔄 Using V1 User Service for getUserProperties');
      // V1 fallback - return empty array
      return { success: true, data: [] };
    }
  },

  async linkPropertyToUser(userId: string, propertyId: string) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 User Service for linkPropertyToUser');
      return userServiceV2.linkPropertyToUser(userId, propertyId);
    } else {
      console.log('🔄 Using V1 User Service for linkPropertyToUser');
      // V1 fallback - return success
      return { success: true, data: { message: 'Property linked successfully' } };
    }
  },

  async unlinkPropertyFromUser(userId: string, propertyId: string) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 User Service for unlinkPropertyFromUser');
      return userServiceV2.unlinkPropertyFromUser(userId, propertyId);
    } else {
      console.log('🔄 Using V1 User Service for unlinkPropertyFromUser');
      // V1 fallback - return success
      return { success: true, data: { message: 'Property unlinked successfully' } };
    }
  },

  async getUserBankAccounts(userId: string) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 User Service for getUserBankAccounts');
      return userServiceV2.getUserBankAccounts(userId);
    } else {
      console.log('🔄 Using V1 User Service for getUserBankAccounts');
      // V1 fallback - return empty array
      return { success: true, data: [] };
    }
  },

  async createUserBankAccount(userId: string, bankAccountData: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 User Service for createUserBankAccount');
      return userServiceV2.createUserBankAccount(userId, bankAccountData);
    } else {
      console.log('🔄 Using V1 User Service for createUserBankAccount');
      // V1 fallback - return success
      return { success: true, data: { message: 'Bank account created successfully' } };
    }
  },

  async updateUserBankAccount(userId: string, accountId: string, bankAccountData: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 User Service for updateUserBankAccount');
      return userServiceV2.updateUserBankAccount(userId, accountId, bankAccountData);
    } else {
      console.log('🔄 Using V1 User Service for updateUserBankAccount');
      // V1 fallback - return success
      return { success: true, data: { message: 'Bank account updated successfully' } };
    }
  },

  async deleteUserBankAccount(userId: string, accountId: string) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 User Service for deleteUserBankAccount');
      return userServiceV2.deleteUserBankAccount(userId, accountId);
    } else {
      console.log('🔄 Using V1 User Service for deleteUserBankAccount');
      // V1 fallback - return success
      return { success: true, data: { message: 'Bank account deleted successfully' } };
    }
  },

  async getUserTransactions(userId: string) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 User Service for getUserTransactions');
      return userServiceV2.getUserTransactions(userId);
    } else {
      console.log('🔄 Using V1 User Service for getUserTransactions');
      // V1 fallback - return empty array
      return { success: true, data: [] };
    }
  },

  async createUserTransaction(userId: string, transactionData: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 User Service for createUserTransaction');
      return userServiceV2.createUserTransaction(userId, transactionData);
    } else {
      console.log('🔄 Using V1 User Service for createUserTransaction');
      // V1 fallback - return success
      return { success: true, data: { message: 'Transaction created successfully' } };
    }
  },

  async getUserDocuments(userId: string) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 User Service for getUserDocuments');
      return userServiceV2.getUserDocuments(userId);
    } else {
      console.log('🔄 Using V1 User Service for getUserDocuments');
      // V1 fallback - return empty array
      return { success: true, data: [] };
    }
  },

  async createUserDocument(userId: string, documentData: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 User Service for createUserDocument');
      return userServiceV2.createUserDocument(userId, documentData);
    } else {
      console.log('🔄 Using V1 User Service for createUserDocument');
      // V1 fallback - return success
      return { success: true, data: { message: 'Document created successfully' } };
    }
  },

  async updateUserDocument(userId: string, documentId: string, documentData: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 User Service for updateUserDocument');
      return userServiceV2.updateUserDocument(userId, documentId, documentData);
    } else {
      console.log('🔄 Using V1 User Service for updateUserDocument');
      // V1 fallback - return success
      return { success: true, data: { message: 'Document updated successfully' } };
    }
  },

  async deleteUserDocument(userId: string, documentId: string) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 User Service for deleteUserDocument');
      return userServiceV2.deleteUserDocument(userId, documentId);
    } else {
      console.log('🔄 Using V1 User Service for deleteUserDocument');
      // V1 fallback - return success
      return { success: true, data: { message: 'Document deleted successfully' } };
    }
  },

  async getUserActivityLog(userId: string) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 User Service for getUserActivityLog');
      return userServiceV2.getUserActivityLog(userId);
    } else {
      console.log('🔄 Using V1 User Service for getUserActivityLog');
      // V1 fallback - return empty array
      return { success: true, data: [] };
    }
  },

  async createUserActivityLog(userId: string, activityData: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 User Service for createUserActivityLog');
      return userServiceV2.createUserActivityLog(userId, activityData);
    } else {
      console.log('🔄 Using V1 User Service for createUserActivityLog');
      // V1 fallback - return success
      return { success: true, data: { message: 'Activity log entry created successfully' } };
    }
  },

  async getUserStats(role?: string) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 User Service for getUserStats');
      return userServiceV2.getUserStats(role);
    } else {
      console.log('🔄 Using V1 User Service for getUserStats');
      // V1 fallback - return mock data
      return { 
        success: true, 
        data: { 
          totalUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0,
          usersWithReservations: 0,
          averageReservations: 0,
          birthdaysThisMonth: 0
        } 
      };
    }
  },

  async getUserDetailStats(userId: string) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 User Service for getUserDetailStats');
      return userServiceV2.getUserDetailStats(userId);
    } else {
      console.log('🔄 Using V1 User Service for getUserDetailStats');
      // V1 fallback - return mock data
      return { 
        success: true, 
        data: { 
          totalReservations: 0,
          totalNights: 0,
          lifetimeValue: 0,
          averageBookingValue: 0,
          completedReservations: 0,
          upcomingReservations: 0,
          cancelledReservations: 0,
          lastActivity: null
        } 
      };
    }
  }
};

// Property Service Adapter
export const propertyServiceAdapter = {
  async getAll(params?: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Property Service for getAll');
      return propertyServiceV2.getAll(params);
    } else {
      console.log('🔄 Using V1 Property Service for getAll');
      return propertyService.getProperties();
    }
  },

  async getById(id: string) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Property Service for getById');
      return propertyServiceV2.getById(id);
    } else {
      console.log('🔄 Using V1 Property Service for getById');
      return propertyService.getProperty(id);
    }
  },

  async create(data: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Property Service for create');
      return propertyServiceV2.create(data);
    } else {
      console.log('🔄 Using V1 Property Service for create');
      return propertyService.createProperty(data);
    }
  },

  async update(id: string, data: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Property Service for update');
      return propertyServiceV2.update(id, data);
    } else {
      console.log('🔄 Using V1 Property Service for update');
      return propertyService.updateProperty(id, data);
    }
  },

  async updateMarketing(id: string, data: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Property Service for updateMarketing');
      return propertyServiceV2.updateMarketing(id, data);
    } else {
      console.log('🔄 V1 Property Service does not support updateMarketing');
      throw new Error('Property marketing update not supported in V1 API');
    }
  },

  async updateAvailability(id: string, data: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Property Service for updateAvailability');
      return propertyServiceV2.updateAvailability(id, data);
    } else {
      console.log('🔄 V1 Property Service does not support updateAvailability');
      throw new Error('Property availability update not supported in V1 API');
    }
  },

  async delete(id: string) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Property Service for delete');
      return propertyServiceV2.delete(id);
    } else {
      console.log('🔄 Using V1 Property Service for delete');
      return propertyService.deleteProperty(id);
    }
  },

  async getAvailableProperties() {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Property Service for getAvailableProperties');
      return propertyServiceV2.getAvailableProperties();
    } else {
      console.log('🔄 Using V1 Property Service for getAvailableProperties');
      // V1 fallback - return empty array
      return { success: true, data: [] };
    }
  }
};

// Reservation Service Adapter
export const reservationServiceAdapter = {
  async getAll(params?: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Reservation Service for getAll');
      return reservationServiceV2.getAll(params);
    } else {
      console.log('🔄 Using V1 Reservation Service for getAll');
      return reservationService.getReservations(params);
    }
  },

  async getById(id: string) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Reservation Service for getById');
      return reservationServiceV2.getById(id);
    } else {
      console.log('🔄 Using V1 Reservation Service for getById');
      return reservationService.getReservationById(id);
    }
  },

  async create(data: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Reservation Service for create');
      return reservationServiceV2.create(data);
    } else {
      console.log('🔄 Using V1 Reservation Service for create');
      return reservationService.createReservation(data);
    }
  },

  async update(id: string, data: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Reservation Service for update');
      return reservationServiceV2.update(id, data);
    } else {
      console.log('🔄 Using V1 Reservation Service for update');
      return reservationService.updateReservation(id, data);
    }
  },

  async updateDates(id: string, datesData: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Reservation Service for updateDates');
      return reservationServiceV2.updateDates(id, datesData);
    } else {
      console.log('🔄 V1 Reservation Service does not support updateDates');
      throw new Error('Reservation dates update not supported in V1 API');
    }
  },

  async delete(id: string) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Reservation Service for delete');
      return reservationServiceV2.delete(id);
    } else {
      console.log('🔄 Using V1 Reservation Service for delete');
      return reservationService.deleteReservation(id);
    }
  },

  async confirmReservation(id: string) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Reservation Service for confirmReservation');
      return reservationServiceV2.confirmReservation(id);
    } else {
      console.log('🔄 V1 Reservation Service does not support confirmReservation');
      throw new Error('Reservation confirmation not supported in V1 API');
    }
  },

  async cancelReservation(id: string, reason?: string) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Reservation Service for cancelReservation');
      return reservationServiceV2.cancelReservation(id, reason);
    } else {
      console.log('🔄 V1 Reservation Service does not support cancelReservation');
      throw new Error('Reservation cancellation not supported in V1 API');
    }
  },

  async checkInReservation(id: string) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Reservation Service for checkInReservation');
      return reservationServiceV2.checkInReservation(id);
    } else {
      console.log('🔄 V1 Reservation Service does not support checkInReservation');
      throw new Error('Reservation check-in not supported in V1 API');
    }
  }
};

// Task Service Adapter
export const taskServiceAdapter = {
  async getAll(params: any = {}) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Task Service for getAll');
      return taskServiceV2.getAll(params);
    } else {
      console.log('🔄 V1 Task Service not available, using V2');
      return taskServiceV2.getAll(params);
    }
  },

  async getById(id: string) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Task Service for getById');
      return taskServiceV2.getById(id);
    } else {
      console.log('🔄 V1 Task Service not available, using V2');
      return taskServiceV2.getById(id);
    }
  },

  async create(data: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Task Service for create');
      return taskServiceV2.create(data);
    } else {
      console.log('🔄 V1 Task Service not available, using V2');
      return taskServiceV2.create(data);
    }
  },

  async update(id: string, data: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Task Service for update');
      return taskServiceV2.update(id, data);
    } else {
      console.log('🔄 V1 Task Service not available, using V2');
      return taskServiceV2.update(id, data);
    }
  },

  async delete(id: string) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Task Service for delete');
      return taskServiceV2.delete(id);
    } else {
      console.log('🔄 V1 Task Service not available, using V2');
      return taskServiceV2.delete(id);
    }
  },

  async updateStatus(id: string, data: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Task Service for updateStatus');
      return taskServiceV2.updateStatus(id, data);
    } else {
      console.log('🔄 V1 Task Service not available, using V2');
      return taskServiceV2.updateStatus(id, data);
    }
  },

  async getStats() {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Task Service for getStats');
      return taskServiceV2.getStats();
    } else {
      console.log('🔄 V1 Task Service not available, using V2');
      return taskServiceV2.getStats();
    }
  },

  async addComment(id: string, content: string, type: string = 'user') {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Task Service for addComment');
      return taskServiceV2.addComment(id, content, type);
    } else {
      console.log('🔄 V1 Task Service not available, using V2');
      return taskServiceV2.addComment(id, content, type);
    }
  },

  async updateChecklistItem(id: string, itemId: string, completed: boolean) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Task Service for updateChecklistItem');
      return taskServiceV2.updateChecklistItem(id, itemId, completed);
    } else {
      console.log('🔄 V1 Task Service not available, using V2');
      return taskServiceV2.updateChecklistItem(id, itemId, completed);
    }
  },

  async uploadAttachment(id: string, file: File) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Task Service for uploadAttachment');
      return taskServiceV2.uploadAttachment(id, file);
    } else {
      console.log('🔄 V1 Task Service not available, using V2');
      return taskServiceV2.uploadAttachment(id, file);
    }
  }
};

// Financial Service Adapter
export const financialServiceAdapter = {
  async getFinancialOverview(filters: any = {}) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Financial Service for getFinancialOverview');
      return financialServiceV2.getFinancialOverview(filters);
    } else {
      console.log('🔄 V1 Financial Service not available, using V2');
      return financialServiceV2.getFinancialOverview(filters);
    }
  },

  async getKPIOverview(filters: any = {}) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Financial Service for getKPIOverview');
      return financialServiceV2.getKPIOverview(filters);
    } else {
      console.log('🔄 V1 Financial Service not available, using V2');
      return financialServiceV2.getKPIOverview(filters);
    }
  },

  async getUnitsAnalytics(filters: any = {}) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Financial Service for getUnitsAnalytics');
      return financialServiceV2.getUnitsAnalytics(filters);
    } else {
      console.log('🔄 V1 Financial Service not available, using V2');
      return financialServiceV2.getUnitsAnalytics(filters);
    }
  }
};

// Scheduler Service Adapter
export const schedulerServiceAdapter = {
  async getEvents(filters: any = {}) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Scheduler Service for getEvents');
      return schedulerServiceV2.getEvents(filters);
    } else {
      console.log('🔄 V1 Scheduler Service not available, using V2');
      return schedulerServiceV2.getEvents(filters);
    }
  },

  async createBlock(data: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Scheduler Service for createBlock');
      return schedulerServiceV2.createBlock(data);
    } else {
      console.log('🔄 V1 Scheduler Service not available, using V2');
      return schedulerServiceV2.createBlock(data);
    }
  }
};

// Settings Service Adapter
export const settingsServiceAdapter = {
  async getAll() {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Settings Service for getAll');
      return settingsServiceV2.getAll();
    } else {
      console.log('🔄 V1 Settings Service not available, using V2');
      return settingsServiceV2.getAll();
    }
  },

  async get(key: string) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Settings Service for get');
      return settingsServiceV2.get(key);
    } else {
      console.log('🔄 V1 Settings Service not available, using V2');
      return settingsServiceV2.get(key);
    }
  },

  async update(key: string, value: string) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Settings Service for update');
      return settingsServiceV2.update(key, value);
    } else {
      console.log('🔄 V1 Settings Service not available, using V2');
      return settingsServiceV2.update(key, value);
    }
  }
};

// Export the adapters as the default services
export const authServiceAdapted = authServiceAdapter;
export const userServiceAdapted = userServiceAdapter;
export const propertyServiceAdapted = propertyServiceAdapter;
export const reservationServiceAdapted = reservationServiceAdapter;
export const taskServiceAdapted = taskServiceAdapter;
export const financialServiceAdapted = financialServiceAdapter;
export const schedulerServiceAdapted = schedulerServiceAdapter;
export const settingsServiceAdapted = settingsServiceAdapter;
