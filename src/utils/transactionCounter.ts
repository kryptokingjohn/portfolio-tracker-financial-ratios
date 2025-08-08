import { supabase } from '../lib/supabase';

/**
 * Increment the transaction count for a user and return the new count
 */
export const incrementTransactionCount = async (userId: string): Promise<number> => {
  try {
    const { data, error } = await supabase.rpc('increment_transaction_count', {
      user_uuid: userId
    });
    
    if (error) {
      console.error('Failed to increment transaction count:', error);
      throw error;
    }
    
    return data || 0;
  } catch (error) {
    console.error('Error incrementing transaction count:', error);
    throw error;
  }
};

/**
 * Check if user can add more transactions (soft paywall check)
 */
export const canAddTransaction = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('can_add_transaction', {
      user_uuid: userId
    });
    
    if (error) {
      console.error('Failed to check transaction limit:', error);
      // Allow on error to avoid blocking users
      return true;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error checking transaction limit:', error);
    // Allow on error to avoid blocking users  
    return true;
  }
};

/**
 * Get current transaction count for a user
 */
export const getTransactionCount = async (userId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('transaction_count')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Failed to get transaction count:', error);
      return 0;
    }
    
    return data?.transaction_count || 0;
  } catch (error) {
    console.error('Error getting transaction count:', error);
    return 0;
  }
};