import React from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    error?: boolean;
    errorMessage?: string;
    required?: boolean;
    className?: string;
    labelWidth?: string; // 新增：控制label宽度
}

const Select: React.FC<SelectProps> = ({
                                           label,
                                           value,
                                           onChange,
                                           options,
                                           placeholder,
                                           error = false,
                                           errorMessage,
                                           required = false,
                                           className = '',
                                           labelWidth = '80px', // 默认label宽度
                                       }) => {
    return (
        <div className="w-full">
            <div className="flex items-center">
                {label && (
                    <label
                        className="text-sm font-medium text-gray-700 mr-3 whitespace-nowrap"
                        style={{ width: labelWidth }}
                    >
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <div className="flex-1">
                    <select
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            error
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300'
                        } ${className}`}
                    >
                        {placeholder && (
                            <option value="">{placeholder}</option>
                        )}
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            {error && errorMessage && (
                <div className="mt-1 flex">
                    <div style={{ width: labelWidth }} className="mr-3"></div>
                    <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
            )}
        </div>
    );
};

export default Select;