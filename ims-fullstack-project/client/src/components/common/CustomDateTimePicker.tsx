// client/src/components/Common/CustomDateTimePicker.tsx
import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'; 
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { Box } from '@mui/material';
import './CustomDatePicker.scss';

interface CustomDateTimePickerProps {
  label: string;
  value: Date | null;
  onChange: (newValue: Date | null) => void;
  type?: 'date' | 'time' | 'datetime'; 
  width?: string | number;
  disabled?: boolean; 
  required?: boolean;
}

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
  label,
  value,
  onChange,
  type = 'date',
  width = '100%',
  disabled = false,
  required = false
}) => {
  
  const renderPicker = () => {
    const commonProps = {
      value: value,
      onChange: onChange,
      disabled: disabled,
      slotProps: {
        textField: {
          size: 'small' as const,
          fullWidth: true,
          placeholder: type === 'date' ? 'mm/dd/yyyy' : 'Select time...', 
          required: required,
        },
        popper: {
            sx: {
                // This ensures the popup attaches to the right theme classes
                '& .MuiPaper-root': {
                    backgroundColor: 'var(--dropdown-content-bg)',
                    color: 'var(--font-color)',
                }
            }
        }
      },
      className: "custom-picker-input"
    };

    if (type === 'time') {
      return <TimePicker {...commonProps} />;
    } else if (type === 'datetime') {
      return <DateTimePicker {...commonProps} />;
    } else {
      return <DatePicker {...commonProps} />;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box className="custom-picker-container" sx={{ width: width }}>
        
        <label className="custom-label">
          {label} 
          {required && <span className="required">*</span>}
        </label>

        {renderPicker()}
        
      </Box>
    </LocalizationProvider>
  );
};

export default CustomDateTimePicker;