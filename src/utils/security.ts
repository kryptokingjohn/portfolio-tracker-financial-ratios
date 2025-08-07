/**
 * Security utilities for input validation and sanitization
 * Protects against XSS, injection attacks, and malformed data
 */

// Email validation regex (RFC 5322 compliant)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Ticker symbol validation (1-8 alphanumeric characters, dots allowed for some formats)
const TICKER_REGEX = /^[A-Z0-9.]{1,8}$/;

// Account types whitelist for validation
const VALID_ACCOUNT_TYPES = ['taxable', 'ira', 'roth_ira', '401k', 'hsa', 'trust', 'other'] as const;

// Transaction types whitelist for validation
const VALID_TRANSACTION_TYPES = ['buy', 'sell', 'dividend', 'split', 'spinoff', 'merger', 'rights', 'return_of_capital', 'fee', 'interest'] as const;

/**
 * Sanitizes text input by removing dangerous characters and limiting length
 */
export const sanitizeText = (input: string, maxLength: number = 1000): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>&"'/\\]/g, '') // Remove potential XSS characters
    .slice(0, maxLength);
};

/**
 * Sanitizes HTML by stripping all tags and entities
 */
export const sanitizeHtml = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[^;]+;/g, '') // Remove HTML entities
    .trim();
};

/**
 * Validates email format
 */
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }
  
  if (email.length > 254) {
    return { valid: false, error: 'Email is too long' };
  }
  
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  return { valid: true };
};

/**
 * Validates password strength
 */
export const validatePassword = (password: string): { valid: boolean; error?: string; strength: 'weak' | 'medium' | 'strong' } => {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required', strength: 'weak' };
  }
  
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long', strength: 'weak' };
  }
  
  if (password.length > 128) {
    return { valid: false, error: 'Password is too long (max 128 characters)', strength: 'weak' };
  }
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  let score = 0;
  
  // Check for different character types
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;
  
  if (score >= 4) strength = 'strong';
  else if (score >= 2) strength = 'medium';
  
  return { 
    valid: score >= 2, 
    error: score < 2 ? 'Password must contain at least 2 of: lowercase, uppercase, numbers, special characters' : undefined,
    strength 
  };
};

/**
 * Validates ticker symbol format
 */
export const validateTicker = (ticker: string): { valid: boolean; error?: string } => {
  if (!ticker || typeof ticker !== 'string') {
    return { valid: false, error: 'Ticker symbol is required' };
  }
  
  const sanitized = ticker.trim().toUpperCase();
  
  if (!TICKER_REGEX.test(sanitized)) {
    return { valid: false, error: 'Invalid ticker format (1-8 alphanumeric characters)' };
  }
  
  return { valid: true };
};

/**
 * Validates numeric input for financial data
 */
export const validateNumber = (
  value: any, 
  options: {
    min?: number;
    max?: number;
    decimals?: number;
    required?: boolean;
    name?: string;
  } = {}
): { valid: boolean; error?: string; value?: number } => {
  const { min, max, decimals = 2, required = true, name = 'Value' } = options;
  
  if (value === null || value === undefined || value === '') {
    if (required) {
      return { valid: false, error: `${name} is required` };
    }
    return { valid: true, value: 0 };
  }
  
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return { valid: false, error: `${name} must be a valid number` };
  }
  
  if (min !== undefined && num < min) {
    return { valid: false, error: `${name} must be at least ${min}` };
  }
  
  if (max !== undefined && num > max) {
    return { valid: false, error: `${name} must be no more than ${max}` };
  }
  
  // Check decimal places
  const decimalPlaces = (num.toString().split('.')[1] || '').length;
  if (decimalPlaces > decimals) {
    return { valid: false, error: `${name} can have at most ${decimals} decimal places` };
  }
  
  return { valid: true, value: num };
};

/**
 * Validates date format and range
 */
export const validateDate = (
  date: string, 
  options: { 
    minDate?: Date; 
    maxDate?: Date; 
    required?: boolean; 
    name?: string;
  } = {}
): { valid: boolean; error?: string; value?: Date } => {
  const { minDate, maxDate, required = true, name = 'Date' } = options;
  
  if (!date) {
    if (required) {
      return { valid: false, error: `${name} is required` };
    }
    return { valid: true };
  }
  
  const parsedDate = new Date(date);
  
  if (isNaN(parsedDate.getTime())) {
    return { valid: false, error: `${name} must be a valid date` };
  }
  
  if (minDate && parsedDate < minDate) {
    return { valid: false, error: `${name} cannot be before ${minDate.toDateString()}` };
  }
  
  if (maxDate && parsedDate > maxDate) {
    return { valid: false, error: `${name} cannot be after ${maxDate.toDateString()}` };
  }
  
  return { valid: true, value: parsedDate };
};

/**
 * Validates account type against whitelist
 */
export const validateAccountType = (accountType: string): { valid: boolean; error?: string } => {
  if (!accountType || typeof accountType !== 'string') {
    return { valid: false, error: 'Account type is required' };
  }
  
  if (!VALID_ACCOUNT_TYPES.includes(accountType as any)) {
    return { valid: false, error: 'Invalid account type' };
  }
  
  return { valid: true };
};

/**
 * Validates transaction type against whitelist
 */
export const validateTransactionType = (transactionType: string): { valid: boolean; error?: string } => {
  if (!transactionType || typeof transactionType !== 'string') {
    return { valid: false, error: 'Transaction type is required' };
  }
  
  if (!VALID_TRANSACTION_TYPES.includes(transactionType as any)) {
    return { valid: false, error: 'Invalid transaction type' };
  }
  
  return { valid: true };
};

/**
 * Comprehensive transaction validation
 */
export const validateTransaction = (transaction: {
  ticker: string;
  type: string;
  accountType: string;
  date: string;
  shares?: number;
  price?: number;
  amount: number;
  fees?: number;
  notes?: string;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validate ticker
  const tickerResult = validateTicker(transaction.ticker);
  if (!tickerResult.valid) errors.push(tickerResult.error!);
  
  // Validate transaction type
  const typeResult = validateTransactionType(transaction.type);
  if (!typeResult.valid) errors.push(typeResult.error!);
  
  // Validate account type
  const accountResult = validateAccountType(transaction.accountType);
  if (!accountResult.valid) errors.push(accountResult.error!);
  
  // Validate date (not future, not before 1900)
  const dateResult = validateDate(transaction.date, {
    minDate: new Date('1900-01-01'),
    maxDate: new Date(),
    name: 'Transaction date'
  });
  if (!dateResult.valid) errors.push(dateResult.error!);
  
  // Validate amount
  const amountResult = validateNumber(transaction.amount, {
    min: 0,
    max: 1000000000, // 1 billion max
    name: 'Amount'
  });
  if (!amountResult.valid) errors.push(amountResult.error!);
  
  // Validate shares if provided
  if (transaction.shares !== undefined) {
    const sharesResult = validateNumber(transaction.shares, {
      min: 0,
      max: 1000000000,
      decimals: 6,
      name: 'Shares'
    });
    if (!sharesResult.valid) errors.push(sharesResult.error!);
  }
  
  // Validate price if provided
  if (transaction.price !== undefined) {
    const priceResult = validateNumber(transaction.price, {
      min: 0,
      max: 1000000,
      decimals: 4,
      name: 'Price'
    });
    if (!priceResult.valid) errors.push(priceResult.error!);
  }
  
  // Validate fees if provided
  if (transaction.fees !== undefined) {
    const feesResult = validateNumber(transaction.fees, {
      min: 0,
      max: 10000,
      name: 'Fees'
    });
    if (!feesResult.valid) errors.push(feesResult.error!);
  }
  
  // Validate notes if provided
  if (transaction.notes) {
    const sanitizedNotes = sanitizeText(transaction.notes, 500);
    if (sanitizedNotes !== transaction.notes) {
      errors.push('Notes contain invalid characters or are too long');
    }
  }
  
  return { valid: errors.length === 0, errors };
};

/**
 * Rate limiting for sensitive operations
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  /**
   * Check if an operation is allowed for a given identifier
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);
    
    if (!attempt || now > attempt.resetTime) {
      // Reset or create new entry
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (attempt.count >= this.maxAttempts) {
      return false;
    }
    
    attempt.count++;
    return true;
  }
  
  /**
   * Get remaining attempts for an identifier
   */
  getRemainingAttempts(identifier: string): number {
    const attempt = this.attempts.get(identifier);
    if (!attempt || Date.now() > attempt.resetTime) {
      return this.maxAttempts;
    }
    return Math.max(0, this.maxAttempts - attempt.count);
  }
}

// Export singleton instances for common use cases
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const apiRateLimiter = new RateLimiter(100, 60 * 1000); // 100 requests per minute