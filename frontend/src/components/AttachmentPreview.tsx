// components/AttachmentPreview.tsx
import React, { useState } from 'react';
import Modal from './Modal';

interface AttachmentPreviewProps {
    attachmentUrls: string[] | string;
    urlPrefix: string;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
                                                                 attachmentUrls,
                                                                 urlPrefix
                                                             }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAttachmentIndex, setCurrentAttachmentIndex] = useState(0);

    // 移除可能的前导逗号或空格
    const getCleanUrl = (url: string): string => {
        const cleanUrl = url.replace(/^[, ]+/, '');
        return `${urlPrefix}${cleanUrl}`;
    };

    // 解析逗号分隔的URL字符串
    const parseAttachmentUrls = (): string[] => {
        if (Array.isArray(attachmentUrls)) {
            return attachmentUrls.map(url => getCleanUrl(url));
        }

        if (typeof attachmentUrls === 'string') {
            return attachmentUrls
                .split(',')
                .map(url => url.trim())
                .filter(url => url.length > 0)
                .map(url => getCleanUrl(url));
        }

        return [];
    };

    const allAttachmentUrls = parseAttachmentUrls();

    if (allAttachmentUrls.length === 0) {
        return <span className="text-gray-400 text-sm">无附件</span>;
    }

    const handlePreview = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    const handlePrevious = () => {
        setCurrentAttachmentIndex(prev =>
            prev === 0 ? allAttachmentUrls.length - 1 : prev - 1
        );
    };

    const handleNext = () => {
        setCurrentAttachmentIndex(prev =>
            prev === allAttachmentUrls.length - 1 ? 0 : prev + 1
        );
    };

    const currentUrl = allAttachmentUrls[currentAttachmentIndex];
    const isImage = currentUrl.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i);
    const isPdf = currentUrl.match(/\.pdf$/i);

    return (
        <>
            <button
                onClick={handlePreview}
                className="text-blue-600 hover:text-blue-800 text-sm"
            >
                查看附件({allAttachmentUrls.length})
            </button>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`附件预览 (${currentAttachmentIndex + 1}/${allAttachmentUrls.length})`}
                size="xl"
            >
                <div className="flex flex-col h-96">
                    {/* 预览区域 */}
                    <div className="flex-1 bg-gray-100 rounded-lg flex items-center justify-center p-4">
                        {isImage ? (
                            <img
                                src={currentUrl}
                                alt={`附件 ${currentAttachmentIndex + 1}`}
                                className="max-h-full max-w-full object-contain"
                                onError={(e) => {
                                    // 图片加载失败时显示错误信息
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                }}
                            />
                        ) : isPdf ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <iframe
                                    src={currentUrl}
                                    className="w-full h-full border-0"
                                    title={`PDF 附件 ${currentAttachmentIndex + 1}`}
                                />
                                <p className="mt-2 text-sm text-gray-600">
                                    如果PDF无法显示，请{' '}
                                    <a
                                        href={currentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        点击这里下载
                                    </a>
                                </p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <p className="text-gray-600 mb-4">无法预览此文件类型</p>
                                <a
                                    href={currentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    下载文件
                                </a>
                            </div>
                        )}
                    </div>

                    {/* 控制区域 */}
                    <div className="flex justify-between items-center mt-4">
                        <div className="flex space-x-2">
                            {allAttachmentUrls.map((url, index) => (
                                <a
                                    key={index}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`px-3 py-1 text-xs rounded border ${
                                        index === currentAttachmentIndex
                                            ? 'bg-blue-100 border-blue-500 text-blue-700'
                                            : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                                    }`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    附件{index + 1}
                                </a>
                            ))}
                        </div>

                        {allAttachmentUrls.length > 1 && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={handlePrevious}
                                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                                >
                                    上一个
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                                >
                                    下一个
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 下载全部按钮 */}
                    <div className="mt-4 flex justify-center">
                        <div className="flex space-x-2">
                            {allAttachmentUrls.map((url, index) => (
                                <a
                                    key={index}
                                    href={url}
                                    download
                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    下载附件{index + 1}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default AttachmentPreview;