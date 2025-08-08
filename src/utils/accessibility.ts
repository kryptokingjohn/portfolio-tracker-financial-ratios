/**
 * Accessibility utilities for WCAG AA compliance
 * Provides consistent implementation of accessibility features
 */

/**
 * Generate unique IDs for form elements and ARIA relationships
 */
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create screen reader announcements
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Focus management utilities
 */
export class FocusManager {
  private static focusStack: HTMLElement[] = [];
  
  /**
   * Save current focus and move to new element
   */
  static saveFocusAndMoveTo(element: HTMLElement): void {
    const currentFocus = document.activeElement as HTMLElement;
    if (currentFocus) {
      this.focusStack.push(currentFocus);
    }
    element.focus();
  }
  
  /**
   * Restore previous focus
   */
  static restoreFocus(): void {
    const previousFocus = this.focusStack.pop();
    if (previousFocus) {
      previousFocus.focus();
    }
  }
  
  /**
   * Trap focus within a container (for modals)
   */
  static trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();
    
    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }
  
  /**
   * Handle escape key to close modals/overlays
   */
  static handleEscapeKey(onEscape: () => void): (e: KeyboardEvent) => void {
    return (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onEscape();
      }
    };
  }
}

/**
 * ARIA utilities for common patterns
 */
export const ARIA = {
  /**
   * Button with proper accessibility
   */
  button: (label: string, options: {
    expanded?: boolean;
    controls?: string;
    describedBy?: string;
    disabled?: boolean;
  } = {}) => ({
    'aria-label': label,
    'aria-expanded': options.expanded,
    'aria-controls': options.controls,
    'aria-describedby': options.describedBy,
    'aria-disabled': options.disabled,
    tabIndex: options.disabled ? -1 : 0,
  }),
  
  /**
   * Input field with proper accessibility
   */
  input: (label: string, options: {
    required?: boolean;
    invalid?: boolean;
    describedBy?: string;
    placeholder?: string;
  } = {}) => ({
    'aria-label': label,
    'aria-required': options.required,
    'aria-invalid': options.invalid,
    'aria-describedby': options.describedBy,
    placeholder: options.placeholder,
  }),
  
  /**
   * Table with proper accessibility
   */
  table: (caption: string, options: {
    sortable?: boolean;
    rowCount?: number;
  } = {}) => ({
    role: 'table',
    'aria-label': caption,
    'aria-rowcount': options.rowCount,
  }),
  
  /**
   * Table header with sorting
   */
  columnHeader: (label: string, sortDirection?: 'ascending' | 'descending' | 'none') => ({
    role: 'columnheader',
    'aria-label': label,
    'aria-sort': sortDirection || 'none',
    tabIndex: 0,
  }),
  
  /**
   * Modal dialog
   */
  modal: (title: string, describedBy?: string) => ({
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': title,
    'aria-describedby': describedBy,
  }),
  
  /**
   * Live region for dynamic content
   */
  liveRegion: (priority: 'polite' | 'assertive' = 'polite') => ({
    'aria-live': priority,
    'aria-atomic': true,
  }),
  
  /**
   * Progress indicator
   */
  progress: (label: string, value?: number, max?: number) => ({
    role: 'progressbar',
    'aria-label': label,
    'aria-valuenow': value,
    'aria-valuemax': max,
  }),
};

/**
 * Keyboard navigation utilities
 */
export const KeyboardHandlers = {
  /**
   * Arrow key navigation for lists/grids
   */
  arrowNavigation: (
    container: HTMLElement,
    onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void
  ) => {
    return (e: KeyboardEvent) => {
      const { key } = e;
      
      switch (key) {
        case 'ArrowUp':
          e.preventDefault();
          onNavigate?.('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          onNavigate?.('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onNavigate?.('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNavigate?.('right');
          break;
      }
    };
  },
  
  /**
   * Enter/Space activation for custom interactive elements
   */
  activation: (onClick: () => void) => {
    return (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    };
  },
  
  /**
   * Tab navigation helper
   */
  tabNavigation: (onTab: (direction: 'forward' | 'backward') => void) => {
    return (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        onTab(e.shiftKey ? 'backward' : 'forward');
      }
    };
  },
};

/**
 * Color contrast utilities
 */
export const ColorContrast = {
  /**
   * Calculate contrast ratio between two colors
   * Returns ratio where 4.5:1 is WCAG AA minimum for normal text
   */
  calculateRatio: (foreground: string, background: string): number => {
    const getLuminance = (color: string): number => {
      // Convert hex to RGB
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      
      // Calculate relative luminance
      const sRGB = [r, g, b].map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    };
    
    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  },
  
  /**
   * Check if color combination meets WCAG standards
   */
  meetsWCAG: (foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
    const ratio = ColorContrast.calculateRatio(foreground, background);
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7.0;
  },
};

/**
 * Screen reader utilities
 */
export const ScreenReader = {
  /**
   * Hide decorative elements from screen readers
   */
  decorative: () => ({
    'aria-hidden': true,
  }),
  
  /**
   * Provide alternative text for complex UI
   */
  describe: (description: string) => ({
    'aria-label': description,
  }),
  
  /**
   * Create screen reader only content
   */
  onlyClass: 'sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
  
  /**
   * Skip link for keyboard navigation
   */
  skipLink: (target: string, text: string = 'Skip to main content') => ({
    href: `#${target}`,
    className: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded',
    children: text,
  }),
};

/**
 * Form accessibility helpers
 */
export const FormAccessibility = {
  /**
   * Associate label with input
   */
  labelFor: (inputId: string, text: string, required: boolean = false) => ({
    htmlFor: inputId,
    children: (
      <>
        {text}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </>
    ),
  }),
  
  /**
   * Error message for input
   */
  errorMessage: (inputId: string, error: string) => ({
    id: `${inputId}-error`,
    className: 'text-red-600 text-sm mt-1',
    role: 'alert',
    'aria-live': 'polite',
    children: error,
  }),
  
  /**
   * Help text for input
   */
  helpText: (inputId: string, text: string) => ({
    id: `${inputId}-help`,
    className: 'text-gray-600 text-sm mt-1',
    children: text,
  }),
};

// Export commonly used constants
export const WCAG_CONTRAST_RATIOS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3.0,
  AAA_NORMAL: 7.0,
  AAA_LARGE: 4.5,
} as const;

export const KEYBOARD_CODES = {
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
} as const;