import React, { useRef } from 'react';

interface FileUploadProps {
    label?: string;
    accept?: string;
    onFilesSelect: (files: File[]) => void; // 改为接收文件数组
    error?: boolean;
    errorMessage?: string;
    className?: string;
    value?: File[]; // 改为文件数组
    maxFiles?: number; // 最大文件数量
}

const FileUpload: React.FC<FileUploadProps> = ({
                                                   label = '上传文件',
                                                   accept = '.pdf,.jpg,.jpeg,.png,.gif',
                                                   onFilesSelect,
                                                   error = false,
                                                   errorMessage,
                                                   className = '',
                                                   value = [],
                                                   maxFiles = 6 // 默认最多6个文件
                                               }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (files.length === 0) return;

        // 检查文件数量
        const totalFiles = value.length + files.length;
        if (totalFiles > maxFiles) {
            alert(`最多只能上传 ${maxFiles} 个文件，当前已选择 ${value.length} 个文件`);
            return;
        }

        const validFiles: File[] = [];
        const invalidFiles: string[] = [];

        files.forEach(file => {
            // 检查文件类型
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                invalidFiles.push(`${file.name} (类型不支持)`);
                return;
            }

            // 检查文件大小 (5MB限制)
            if (file.size > 5 * 1024 * 1024) {
                invalidFiles.push(`${file.name} (文件过大)`);
                return;
            }

            // 检查是否重复
            const isDuplicate = value.some(existingFile =>
                existingFile.name === file.name && existingFile.size === file.size
            );

            if (isDuplicate) {
                invalidFiles.push(`${file.name} (文件重复)`);
                return;
            }

            validFiles.push(file);
        });

        // 显示无效文件提示
        if (invalidFiles.length > 0) {
            alert(`以下文件无法上传：\n${invalidFiles.join('\n')}`);
        }

        // 如果有有效文件，调用回调
        if (validFiles.length > 0) {
            const allFiles = [...value, ...validFiles];
            onFilesSelect(allFiles);
        }

        // 重置input值，允许重复选择相同文件
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const removeFile = (index: number) => {
        const newFiles = value.filter((_, i) => i !== index);
        onFilesSelect(newFiles);
    };

    const getFileIcon = (file: File) => {
        if (file.type.includes('pdf')) {
            return (
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
            );
        } else if (file.type.includes('image')) {
            return (
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            );
        } else {
            return (
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            );
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    <span className="text-gray-500 text-xs ml-2">
            (最多 {maxFiles} 个文件)
          </span>
                </label>
            )}

            <div className="flex items-center">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={accept}
                    className="hidden"
                    multiple // 支持多选
                />

                <button
                    type="button"
                    onClick={handleClick}
                    disabled={value.length >= maxFiles}
                    className={`flex-1 px-4 py-3 border-2 border-dashed rounded-lg text-center transition-colors ${
                        error
                            ? 'border-red-300 bg-red-50 hover:bg-red-100'
                            : value.length >= maxFiles
                                ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }`}
                >
                    <div className="flex flex-col items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                        <span className="text-sm text-gray-600">
              {value.length > 0
                  ? `已选择 ${value.length} 个文件 (还可选择 ${maxFiles - value.length} 个)`
                  : '点击选择文件'
              }
            </span>
                        <span className="text-xs text-gray-500 mt-1">
              支持PDF、JPG、PNG、GIF格式，单个文件最大5MB
            </span>
                    </div>
                </button>
            </div>

            {error && errorMessage && (
                <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
            )}

            {/* 已选择文件列表 */}
            {value.length > 0 && (
                <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">已选择文件:</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {value.map((file, index) => (
                            <div
                                key={`${file.name}-${file.size}-${index}`}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    {getFileIcon(file)}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload;