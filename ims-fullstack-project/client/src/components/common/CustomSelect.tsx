// client/src/components/Common/CustomSelect.tsx
import React from 'react';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import './CustomSelect.scss';
import { Select, type SelectChangeEvent } from '@mui/material';

interface Option {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  label: string;
  value: string | number;
  onChange: (event: SelectChangeEvent<string | number>) => void;
  options: Option[];
  width?: string | number;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  onChange,
  options,
  width = '100%',
  placeholder = "Select...",
  disabled = false,
  required = false
}) => {

  return (
    <Box className="custom-select-container" sx={{ width: width }}>

      <label className="custom-label">
        {label}
        {required && <span className="required">*</span>}
      </label>

      <FormControl fullWidth size="small" disabled={disabled}>
        <Select
          value={value}
          onChange={onChange}
          displayEmpty
          renderValue={(selected) => {
            if (!selected || selected === "") {
              return <span className="placeholder-text">{placeholder}</span>;
            }
            const selectedOption = options.find(opt => opt.value === selected);
            return selectedOption ? selectedOption.label : selected;
          }}
          MenuProps={{
            disableScrollLock: true,
            PaperProps: {
              className: 'custom-select-menu-paper'
            }
          }}
        >
          {/* Placeholder Option */}
          <MenuItem value="" disabled style={{ display: 'none' }}>
            {placeholder}
          </MenuItem>

          {/* Actual Options */}
          {options.length > 0 ? (
            options.map((option, index) => (
              <MenuItem key={index} value={option.value}>
                {option.label}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No options available</MenuItem>
          )}
        </Select>
      </FormControl>
    </Box>
  );
}

export default CustomSelect;