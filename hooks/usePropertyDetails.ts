import { useState, useEffect, useCallback } from 'react';
import { propertyDetailsService, PropertyDetails, Owner, IncomeDistribution, FinancialData } from '../lib/api/services/propertyDetailsService';

interface UsePropertyDetailsReturn {
  // Property data
  property: PropertyDetails | null;
  loading: boolean;
  error: string | null;
  
  // Owner data
  owner: Owner | null;
  owners: Owner[];
  ownersLoading: boolean;
  
  // Financial data
  financialData: FinancialData | null;
  incomeDistribution: IncomeDistribution;
  currentPrice: number | null;
  priceLoading: boolean;
  
  // Actions
  updateProperty: (updates: Partial<PropertyDetails>) => Promise<boolean>;
  assignOwner: (ownerId: string) => Promise<boolean>;
  refreshProperty: () => Promise<void>;
  refreshOwner: () => Promise<void>;
  refreshFinancialData: () => Promise<void>;
  refreshPrice: () => Promise<void>;
}

export const usePropertyDetails = (propertyId: string): UsePropertyDetailsReturn => {
  // Property state
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Owner state
  const [owner, setOwner] = useState<Owner | null>(null);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [ownersLoading, setOwnersLoading] = useState(false);

  // Financial state
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [incomeDistribution, setIncomeDistribution] = useState<IncomeDistribution>({
    ownerIncome: 70,
    roomyAgencyFee: 25,
    referringAgent: 5
  });
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  // Load property details
  const loadPropertyDetails = useCallback(async () => {
    if (!propertyId) return;

    try {
      setLoading(true);
      setError(null);

      const propertyData = await propertyDetailsService.getPropertyDetails(propertyId);
      
      if (propertyData) {
        setProperty(propertyData);
        
        // Load owner if exists
        if (propertyData.ownerId) {
          await loadOwner(propertyData.ownerId);
        }
      } else {
        setError('Property not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load property');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  // Load owner details
  const loadOwner = useCallback(async (ownerId: string) => {
    try {
      const ownerData = await propertyDetailsService.getOwner(ownerId);
      setOwner(ownerData);
    } catch (err) {
      console.error('Error loading owner:', err);
      setOwner(null);
    }
  }, []);

  // Load all owners
  const loadOwners = useCallback(async () => {
    try {
      setOwnersLoading(true);
      const ownersData = await propertyDetailsService.getOwners();
      setOwners(ownersData);
    } catch (err) {
      console.error('Error loading owners:', err);
      setOwners([]);
    } finally {
      setOwnersLoading(false);
    }
  }, []);

  // Load income distribution
  const loadIncomeDistribution = useCallback(async () => {
    try {
      const distribution = await propertyDetailsService.getIncomeDistribution();
      setIncomeDistribution(distribution);
    } catch (err) {
      console.error('Error loading income distribution:', err);
    }
  }, []);

  // Load financial data
  const loadFinancialData = useCallback(async () => {
    if (!propertyId) return;

    try {
      const data = await propertyDetailsService.getFinancialData(propertyId);
      setFinancialData(data);
    } catch (err) {
      console.error('Error loading financial data:', err);
      setFinancialData(null);
    }
  }, [propertyId]);

  // Load current price
  const loadCurrentPrice = useCallback(async () => {
    if (!propertyId) return;

    try {
      setPriceLoading(true);
      const price = await propertyDetailsService.getCurrentPrice(propertyId);
      setCurrentPrice(price);
    } catch (err) {
      console.error('Error loading current price:', err);
      setCurrentPrice(null);
    } finally {
      setPriceLoading(false);
    }
  }, [propertyId]);

  // Update property
  const updateProperty = useCallback(async (updates: Partial<PropertyDetails>): Promise<boolean> => {
    if (!propertyId) return false;

    try {
      const success = await propertyDetailsService.updatePropertyDetails(propertyId, updates);
      
      if (success) {
        // Reload property data
        await loadPropertyDetails();
      }
      
      return success;
    } catch (err) {
      console.error('Error updating property:', err);
      return false;
    }
  }, [propertyId, loadPropertyDetails]);

  // Assign owner
  const assignOwner = useCallback(async (ownerId: string): Promise<boolean> => {
    if (!propertyId) return false;

    try {
      const success = await propertyDetailsService.assignOwner(propertyId, ownerId);
      
      if (success) {
        // Reload property and owner data
        await loadPropertyDetails();
        await loadOwner(ownerId);
      }
      
      return success;
    } catch (err) {
      console.error('Error assigning owner:', err);
      return false;
    }
  }, [propertyId, loadPropertyDetails, loadOwner]);

  // Refresh functions
  const refreshProperty = useCallback(async () => {
    await loadPropertyDetails();
  }, [loadPropertyDetails]);

  const refreshOwner = useCallback(async () => {
    if (property?.ownerId) {
      await loadOwner(property.ownerId);
    }
  }, [property?.ownerId, loadOwner]);

  const refreshFinancialData = useCallback(async () => {
    await loadFinancialData();
  }, [loadFinancialData]);

  const refreshPrice = useCallback(async () => {
    await loadCurrentPrice();
  }, [loadCurrentPrice]);

  // Initial load
  useEffect(() => {
    if (propertyId) {
      loadPropertyDetails();
      loadOwners();
      loadIncomeDistribution();
      loadFinancialData();
      loadCurrentPrice();
    }
  }, [propertyId, loadPropertyDetails, loadOwners, loadIncomeDistribution, loadFinancialData, loadCurrentPrice]);

  return {
    // Property data
    property,
    loading,
    error,
    
    // Owner data
    owner,
    owners,
    ownersLoading,
    
    // Financial data
    financialData,
    incomeDistribution,
    currentPrice,
    priceLoading,
    
    // Actions
    updateProperty,
    assignOwner,
    refreshProperty,
    refreshOwner,
    refreshFinancialData,
    refreshPrice
  };
};
