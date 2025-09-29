import React from 'react';

interface CheckboxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
                                               label,
                                               checked,
                                               onChange,
                                               className = '',
                                           }) => {
    return (
        <div className={`flex items-center ${className}`}>
            <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                {label}
            </label>
        </div>
    );
};

export default Checkbox;