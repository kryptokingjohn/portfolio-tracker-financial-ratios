import React from 'react';
import { ChevronUp, ChevronDown, HelpCircle } from 'lucide-react';
import { ARIA, KeyboardHandlers } from '../utils/accessibility';

interface AccessibleTableHeaderProps {
  label: string;
  sortKey: string;
  sortField?: string;
  sortDirection: 'asc' | 'desc';
  onSort: (key: string) => void;
  tooltip?: string;
  isNumeric?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const AccessibleTableHeader: React.FC<AccessibleTableHeaderProps> = ({
  label,
  sortKey,
  sortField,
  sortDirection,
  onSort,
  tooltip,
  isNumeric = false,
  className = '',
  children,
}) => {
  const isSorted = sortField === sortKey;
  const [showTooltip, setShowTooltip] = React.useState(false);
  
  const getSortDirection = (): 'ascending' | 'descending' | 'none' => {
    if (!isSorted) return 'none';
    return sortDirection === 'asc' ? 'ascending' : 'descending';
  };

  const handleSort = () => {
    onSort(sortKey);
  };

  const handleKeyDown = KeyboardHandlers.activation(handleSort);

  const getSortAriaLabel = () => {
    const direction = getSortDirection();
    if (direction === 'none') {
      return `Sort by ${label}`;
    }
    const nextDirection = direction === 'ascending' ? 'descending' : 'ascending';
    return `Sort by ${label} ${nextDirection}`;
  };

  return (
    <th
      scope="col"
      className={`
        px-4 py-3 text-left text-xs font-medium uppercase tracking-wider
        ${isNumeric ? 'text-right' : 'text-left'}
        ${className}
      `}
      {...ARIA.columnHeader(label, getSortDirection())}
    >
      <div className="flex items-center space-x-2 group">
        <button
          onClick={handleSort}
          onKeyDown={handleKeyDown}
          className={`
            flex items-center space-x-1 text-left font-medium uppercase tracking-wider
            hover:text-primary-700 focus:text-primary-700 transition-colors
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded
            ${isNumeric ? 'flex-row-reverse space-x-reverse' : ''}
            ${isSorted ? 'text-primary-600' : 'text-neutral-600'}
          `}
          {...ARIA.button(getSortAriaLabel())}
        >
          <span>{children || label}</span>
          
          {/* Sort indicator */}
          <span className="flex flex-col" aria-hidden="true">
            <ChevronUp
              className={`w-3 h-3 ${
                isSorted && sortDirection === 'asc'
                  ? 'text-primary-600'
                  : 'text-neutral-300 group-hover:text-neutral-400'
              }`}
            />
            <ChevronDown
              className={`w-3 h-3 -mt-1 ${
                isSorted && sortDirection === 'desc'
                  ? 'text-primary-600'
                  : 'text-neutral-300 group-hover:text-neutral-400'
              }`}
            />
          </span>
        </button>

        {/* Tooltip for complex metrics */}
        {tooltip && (
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
              className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              {...ARIA.button(`Help for ${label}`)}
              aria-describedby={showTooltip ? `tooltip-${sortKey}` : undefined}
            >
              <HelpCircle className="w-3 h-3" aria-hidden="true" />
            </button>
            
            {showTooltip && (
              <div
                id={`tooltip-${sortKey}`}
                role="tooltip"
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-neutral-900 rounded-lg shadow-lg whitespace-nowrap z-10 max-w-xs"
                style={{ minWidth: 'max-content' }}
              >
                {tooltip}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-neutral-900"></div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Screen reader only sort status */}
      {isSorted && (
        <span className="sr-only">
          , sorted {sortDirection === 'asc' ? 'ascending' : 'descending'}
        </span>
      )}
    </th>
  );
};

// Reusable table component with full accessibility
interface AccessibleTableProps {
  caption: string;
  children: React.ReactNode;
  className?: string;
  stickyHeader?: boolean;
}

export const AccessibleTable: React.FC<AccessibleTableProps> = ({
  caption,
  children,
  className = '',
  stickyHeader = false,
}) => {
  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <table
        className={`min-w-full divide-y divide-neutral-200 ${className}`}
        role="table"
        aria-label={caption}
      >
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
};

// Table body row with accessibility support
interface AccessibleTableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  isClickable?: boolean;
  className?: string;
  'aria-label'?: string;
}

export const AccessibleTableRow: React.FC<AccessibleTableRowProps> = ({
  children,
  onClick,
  isClickable = false,
  className = '',
  'aria-label': ariaLabel,
}) => {
  const handleKeyDown = onClick ? KeyboardHandlers.activation(onClick) : undefined;
  
  return (
    <tr
      className={`
        ${isClickable ? 'cursor-pointer hover:bg-neutral-50 focus-within:bg-neutral-50' : ''}
        ${className}
      `}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={isClickable ? 0 : undefined}
      role={isClickable ? 'button' : undefined}
      aria-label={ariaLabel}
    >
      {children}
    </tr>
  );
};

// Table cell with proper accessibility
interface AccessibleTableCellProps {
  children: React.ReactNode;
  isNumeric?: boolean;
  className?: string;
  scope?: 'row' | 'col';
}

export const AccessibleTableCell: React.FC<AccessibleTableCellProps> = ({
  children,
  isNumeric = false,
  className = '',
  scope,
}) => {
  const Tag = scope ? 'th' : 'td';
  
  return (
    <Tag
      className={`
        px-4 py-3 text-sm
        ${isNumeric ? 'text-right' : 'text-left'}
        ${scope ? 'font-medium text-neutral-900' : 'text-neutral-700'}
        ${className}
      `}
      scope={scope}
    >
      {children}
    </Tag>
  );
};