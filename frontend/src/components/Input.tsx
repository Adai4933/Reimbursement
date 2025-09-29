import React from 'react';

interface InputProps {
    label?: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'datetime-local';
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    error?: boolean;
    errorMessage?: string;
    className?: string;
    helperText?: string;
    labelWidth?: string; // 新增：控制label宽度
}

const Input: React.FC<InputProps> = ({
                                         label,
                                         type = 'text',
                                         placeholder,
                                         value,
                                         onChange,
                                         required = false,
                                         error = false,
                                         errorMessage,
                                         className = '',
                                         helperText,
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
                    <input
                        type={type}
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        required={required}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            error
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300'
                        } ${className}`}
                    />
                </div>
            </div>
            {error && errorMessage && (
                <div className="mt-1 flex">
                    <div style={{ width: labelWidth }} className="mr-3"></div>
                    <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
            )}
            {helperText && !error && (
                <div className="mt-1 flex">
                    <div style={{ width: labelWidth }} className="mr-3"></div>
                    <p className="text-xs text-gray-500">{helperText}</p>
                </div>
            )}
        </div>
    );
};

export default Input;