/**
 * Saga Orchestrator for Complex Business Processes
 * 
 * Implements the Saga pattern for managing distributed transactions
 * across multiple services and entities.
 */

const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

class SagaOrchestrator {
  constructor() {
    this.prisma = new PrismaClient();
    this.sagas = new Map();
  }

  /**
   * Register a new saga with its steps
   */
  registerSaga(name, steps) {
    this.sagas.set(name, {
      steps,
      compensations: [],
      status: 'pending',
      currentStep: 0,
      data: {},
      createdAt: new Date(),
      updatedAt: new Date()
    });
    logger.info(`Saga registered: ${name}`);
  }

  /**
   * Execute a saga with the given data
   */
  async executeSaga(sagaName, initialData) {
    const saga = this.sagas.get(sagaName);
    if (!saga) {
      throw new Error(`Saga not found: ${sagaName}`);
    }

    saga.data = { ...initialData };
    saga.status = 'running';
    saga.currentStep = 0;
    saga.compensations = [];

    logger.info(`Starting saga execution: ${sagaName}`, { data: saga.data });

    try {
      // Execute each step in sequence
      for (let i = 0; i < saga.steps.length; i++) {
        saga.currentStep = i;
        const step = saga.steps[i];
        
        logger.info(`Executing step ${i + 1}/${saga.steps.length}: ${step.name}`);
        
        // Execute the step
        const result = await step.execute(saga.data);
        
        // Store compensation action if provided
        if (step.compensate) {
          saga.compensations.unshift({
            name: step.name,
            compensate: step.compensate,
            data: saga.data
          });
        }

        // Update saga data with step result
        if (result) {
          saga.data = { ...saga.data, ...result };
        }

        saga.updatedAt = new Date();
        logger.info(`Step completed: ${step.name}`, { result });
      }

      saga.status = 'completed';
      logger.info(`Saga completed successfully: ${sagaName}`);
      
      return {
        success: true,
        data: saga.data,
        message: 'Saga executed successfully'
      };

    } catch (error) {
      logger.error(`Saga execution failed at step ${saga.currentStep}: ${error.message}`);
      saga.status = 'failed';
      
      // Execute compensations in reverse order
      await this.executeCompensations(saga);
      
      return {
        success: false,
        error: error.message,
        compensated: true,
        data: saga.data
      };
    }
  }

  /**
   * Execute compensation actions in reverse order
   */
  async executeCompensations(saga) {
    logger.info(`Executing compensations for saga: ${saga.name}`);
    
    for (const compensation of saga.compensations) {
      try {
        logger.info(`Executing compensation: ${compensation.name}`);
        await compensation.compensate(compensation.data);
        logger.info(`Compensation completed: ${compensation.name}`);
      } catch (error) {
        logger.error(`Compensation failed: ${compensation.name}`, error);
        // Continue with other compensations even if one fails
      }
    }
    
    saga.status = 'compensated';
    saga.updatedAt = new Date();
  }

  /**
   * Get saga status
   */
  getSagaStatus(sagaName) {
    const saga = this.sagas.get(sagaName);
    if (!saga) {
      return null;
    }

    return {
      name: sagaName,
      status: saga.status,
      currentStep: saga.currentStep,
      totalSteps: saga.steps.length,
      createdAt: saga.createdAt,
      updatedAt: saga.updatedAt,
      data: saga.data
    };
  }

  /**
   * List all registered sagas
   */
  listSagas() {
    return Array.from(this.sagas.keys()).map(name => ({
      name,
      stepsCount: this.sagas.get(name).steps.length,
      status: this.sagas.get(name).status
    }));
  }
}

// Singleton instance
const sagaOrchestrator = new SagaOrchestrator();

module.exports = sagaOrchestrator;
