import { shouldUseV2API } from '../config-v2';
import { authService } from '../services/authService';
import { authServiceV2 } from '../services/authService-v2';
import { userService } from '../services/userService';
import { userServiceV2 } from '../services/userService-v2';
import { propertyService } from '../services/propertyService';
import { propertyServiceV2 } from '../services/propertyService-v2';
import { reservationService } from '../services/reservationService';
import { reservationServiceV2 } from '../services/reservationService-v2';

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
      // V2 doesn't support create yet, fallback to V1
      return propertyService.createProperty(data);
    } else {
      console.log('🔄 Using V1 Property Service for create');
      return propertyService.createProperty(data);
    }
  },

  async update(id: string, data: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Property Service for update');
      // V2 doesn't support update yet, fallback to V1
      return propertyService.updateProperty(id, data);
    } else {
      console.log('🔄 Using V1 Property Service for update');
      return propertyService.updateProperty(id, data);
    }
  },

  async delete(id: string) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Property Service for delete');
      // V2 doesn't support delete yet, fallback to V1
      return propertyService.deleteProperty(id);
    } else {
      console.log('🔄 Using V1 Property Service for delete');
      return propertyService.deleteProperty(id);
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
      // V2 doesn't support create yet, fallback to V1
      return reservationService.createReservation(data);
    } else {
      console.log('🔄 Using V1 Reservation Service for create');
      return reservationService.createReservation(data);
    }
  },

  async update(id: string, data: any) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Reservation Service for update');
      // V2 doesn't support update yet, fallback to V1
      return reservationService.updateReservation(id, data);
    } else {
      console.log('🔄 Using V1 Reservation Service for update');
      return reservationService.updateReservation(id, data);
    }
  },

  async delete(id: string) {
    if (shouldUseV2API()) {
      console.log('🔄 Using V2 Reservation Service for delete');
      // V2 doesn't support delete yet, fallback to V1
      return reservationService.deleteReservation(id);
    } else {
      console.log('🔄 Using V1 Reservation Service for delete');
      return reservationService.deleteReservation(id);
    }
  }
};

// Export the adapters as the default services
export const authServiceAdapted = authServiceAdapter;
export const userServiceAdapted = userServiceAdapter;
export const propertyServiceAdapted = propertyServiceAdapter;
export const reservationServiceAdapted = reservationServiceAdapter;
