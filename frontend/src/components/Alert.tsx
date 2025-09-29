import React from 'react';

interface AlertProps {
    type: 'error' | 'success' | 'warning' | 'info';
    message: string;
    className?: string;
}

const Alert: React.FC<AlertProps> = ({ type, message, className = '' }) => {
    const baseClasses = 'rounded-md p-4';

    const typeClasses = {
        error: 'bg-red-50 border border-red-200',
        success: 'bg-green-50 border border-green-200',
        warning: 'bg-yellow-50 border border-yellow-200',
        info: 'bg-blue-50 border border-blue-200',
    };

    const iconClasses = {
        error: 'text-red-400',
        success: 'text-green-400',
        warning: 'text-yellow-400',
        info: 'text-blue-400',
    };

    const textClasses = {
        error: 'text-red-800',
        success: 'text-green-800',
        warning: 'text-yellow-800',
        info: 'text-blue-800',
    };

    const icons = {
        error: (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
        ),
        success: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
        ),
        warning: (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
        ),
        info: (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
        ),
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type]} ${className}`}>
            <div className="flex">
                <div className={`flex-shrink-0 ${iconClasses[type]}`}>
                    {icons[type]}
                </div>
                <div className="ml-3">
                    <p className={`text-sm font-medium ${textClasses[type]}`}>
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Alert;