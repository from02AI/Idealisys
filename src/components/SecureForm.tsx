
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { createValidationError, ErrorLogger } from '../utils/errorHandling';

const logger = ErrorLogger.getInstance();

interface SecureFormProps {
  onSubmit: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  multiline?: boolean;
  label?: string;
  required?: boolean;
  className?: string;
}

const SecureForm: React.FC<SecureFormProps> = ({
  onSubmit,
  placeholder = "Enter your response...",
  maxLength = 2000,
  minLength = 3,
  multiline = true,
  label,
  required = true,
  className = ""
}) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sanitizeInput = (input: string): string => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };

  const validateInput = (input: string): { isValid: boolean; error?: string } => {
    const sanitized = sanitizeInput(input);
    
    if (required && (!sanitized || sanitized.length === 0)) {
      return { isValid: false, error: 'This field is required' };
    }
    
    if (sanitized.length < minLength) {
      return { isValid: false, error: `Minimum ${minLength} characters required` };
    }
    
    if (sanitized.length > maxLength) {
      return { isValid: false, error: `Maximum ${maxLength} characters allowed` };
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /eval\s*\(/i,
      /function\s*\(/i,
      /setTimeout\s*\(/i,
      /setInterval\s*\(/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /data:.*base64/i
    ];
    
    const hasSuspiciousContent = suspiciousPatterns.some(pattern => pattern.test(sanitized));
    if (hasSuspiciousContent) {
      return { isValid: false, error: 'Input contains invalid content' };
    }
    
    return { isValid: true };
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
    
    // Real-time validation for length
    if (newValue.length > maxLength) {
      setError(`Maximum ${maxLength} characters allowed`);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const validation = validateInput(value);
      
      if (!validation.isValid) {
        setError(validation.error || 'Invalid input');
        return;
      }
      
      const sanitizedValue = sanitizeInput(value);
      onSubmit(sanitizedValue);
      setValue(''); // Clear form after successful submission
    } catch (err) {
      logger.logError(err as Error, { component: 'SecureForm' });
      setError('An error occurred while processing your input');
    } finally {
      setIsSubmitting(false);
    }
  };

  const InputComponent = multiline ? Textarea : Input;
  const remainingChars = maxLength - value.length;
  const isValid = validateInput(value).isValid;

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <InputComponent
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full ${error ? 'border-red-500 focus:border-red-500' : ''}`}
          rows={multiline ? 3 : undefined}
          maxLength={maxLength + 100} // Allow slightly over for UX, validate in JS
        />
        
        <div className="mt-1 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {remainingChars >= 0 ? (
              <span className={remainingChars < 50 ? 'text-orange-500' : ''}>
                {remainingChars} characters remaining
              </span>
            ) : (
              <span className="text-red-500">
                {Math.abs(remainingChars)} characters over limit
              </span>
            )}
          </div>
          
          {value.length >= minLength && (
            <div className="text-xs">
              {isValid ? (
                <span className="text-green-600">✓ Valid</span>
              ) : (
                <span className="text-red-500">✗ Invalid</span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}
      
      <Button
        type="submit"
        disabled={!isValid || isSubmitting || remainingChars < 0}
        className="w-full"
      >
        {isSubmitting ? 'Processing...' : 'Submit'}
      </Button>
    </form>
  );
};

export default SecureForm;
