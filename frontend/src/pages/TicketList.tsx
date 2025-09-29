import React, {useEffect, useState} from 'react';
import { useCookies } from 'react-cookie';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import FileUpload from '../components/FileUpload';
import type {TableColumn, CreateTicketForm, Ticket} from "../types/entity";
import AttachmentPreview from "../components/AttachmentPreview.tsx";
import {file_prefix, url_prefix} from "../common/const.tsx";

interface TicketListResponse {
    success: boolean;
    data?: [];
}

const TicketList: React.FC = () => {
    const [cookies] = useCookies(['Authorization', 'role']);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState<CreateTicketForm>({
        amount: 0,
        paymentTime: '',
        attachment_link: '',
    });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // 改为文件数组

    const [tickets, setTickets] = useState<Ticket[]>([]);

    useEffect(() => {
        initTickets();
    }, []);

    // 初始化ticket列表
    const initTickets = async () => {
        try {
            const data = await fetchTickets(cookies.Authorization);
            setTickets(data);
        } catch (error) {
            console.error('获取ticket数据失败:', error);
        }
    };

    const fetchTickets = async (token: string): Promise<Ticket[]> => {
        const response = await fetch(`${url_prefix}/tickets`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
        throw new Error(`获取数据失败: ${response.status}`);
    }

    const result: TicketListResponse = await response.json();

    if (result.success && result.data) {
        return result.data;
    } else {
        throw new Error('获取数据失败');
    }
}

    // 上传文件到服务器
    const uploadFiles = async (files: File[]): Promise<string[]> => {
        setIsUploading(true);
        try {
            // 创建FormData对象
            const formData = new FormData();

            // 将所有文件添加到FormData中，使用相同的字段名"files"
            files.forEach(file => {
                formData.append('files', file);
            });

            // 一次性上传所有文件
            const response = await fetch(`${url_prefix}/files/tickets/attachment`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${cookies.Authorization}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`文件上传失败: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.data && result.data.urls) {
                return result.data.urls;
            } else {
                throw new Error(result.message || '文件上传失败');
            }
        } catch (error) {
            console.error('文件上传失败:', error);
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    // 处理审批
    const handleApprove = async (ticketId: string, newStatus: 'APPROVED' | 'REJECTED') => {
        try {
            const response = await fetch(`${url_prefix}/tickets/${ticketId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cookies.Authorization}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('审批操作失败');
            }

            await fetchTickets(cookies.Authorization).then(data => setTickets(data));

            // 刷新数据或更新本地状态
            alert(`工单 ${ticketId} 已${newStatus === 'APPROVED' ? '批准' : '拒绝'}`);
        } catch (error) {
            console.error('审批操作失败:', error);
            alert('操作失败，请重试');
        }
    };

    // 创建新工单
    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let attachmentUrls: string[] = [];

            // 如果有文件，先上传所有文件
            if (selectedFiles.length > 0) {
                attachmentUrls = await uploadFiles(selectedFiles);
            }

            // 提交工单数据
            const ticketData = {
                ...formData,
                "attachment_link" : attachmentUrls,
            };

            const response = await fetch(`${url_prefix}/tickets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cookies.Authorization}`,
                },
                body: JSON.stringify(ticketData),
            });

            if (!response.ok) {
                throw new Error('创建工单失败');
            }

            const result = await response.json();

            if (result.success && result.data) {
                // 将新工单添加到列表
                setTickets(prevTickets => [result.data, ...prevTickets]);
                alert('工单创建成功');
                setIsModalOpen(false);
                resetForm();
            } else {
                throw new Error(result.message || '创建工单失败');
            }
        } catch (error) {
            console.error('创建工单失败:', error);
            alert('创建工单失败，请重试');
        }
    };

    const resetForm = () => {
        setFormData({
            amount: 0,
            paymentTime: '',
            attachment_link: '',
        });
        setSelectedFiles([]);
    };

    const handleInputChange = (field: keyof CreateTicketForm) => (value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleFilesSelect = (files: File[]) => {
        setSelectedFiles(files);
    };

    const columns: TableColumn<Ticket>[] = [
        { key: 'id', label: 'ID' },
        { key: 'username', label: '提交用户' },
        { key: 'userEmail', label: '用户邮箱' },
        { key: 'amount', label: '金额', render: (value) => `¥${value}` },
        { key: 'paymentTime', label: '支付时间' },
        {
            key: 'status',
            label: '状态',
            render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    value === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        value === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                            value === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                value === 'PAID' ? 'bg-green-100 text-green-800' : 
                                    'bg-gray-100 text-gray-800'
                }`}>
          {value === 'PENDING' ? '待审批' :
              value === 'APPROVED' ? '已批准' :
                  value === 'REJECTED' ? '已拒绝' :
                      value === 'PAID' ? '已支付' :
                          '未知状态'}
        </span>
            )
        },
        {
            key: 'attachmentUrl',
            label: '附件',
            render: (value) => (
                <AttachmentPreview
                    attachmentUrls={value}
                    urlPrefix={file_prefix}
                />
            )
        },
    ];

    // 如果是EMPLOYER角色，添加操作列
    if (cookies.role === 'EMPLOYER') {
        columns.push({
            key: 'id',
            label: '操作',
            render: (value, item) => (
                <div className="flex space-x-2">
                    {item.status === 'PENDING' && (
                        <>
                            <button
                                onClick={() => handleApprove(value, 'APPROVED')}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                            >
                                批准
                            </button>
                            <button
                                onClick={() => handleApprove(value, 'REJECTED')}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                            >
                                拒绝
                            </button>
                        </>
                    )}
                    {item.status !== 'PENDING' && (
                        <span className="text-gray-400 text-xs">已处理</span>
                    )}
                </div>
            ),
        });
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">工单列表</h1>
                <Button onClick={() => setIsModalOpen(true)}>新建工单</Button>
            </div>

            <Table
                data={tickets}
                columns={columns}
                keyExtractor={(item) => item.id}
            />

            {/* 新建工单Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="新建工单"
                size="lg"
            >
                <form onSubmit={handleCreateTicket} className="space-y-4">
                    <Input
                        label="金额"
                        type="number"
                        placeholder="请输入金额"
                        value={formData.amount.toString()}
                        onChange={(value) => handleInputChange('amount')(Number(value))}
                        required
                        labelWidth="100px"
                    />

                    <Input
                        label="支付时间"
                        type="datetime-local"
                        placeholder="请选择支付时间"
                        value={formData.paymentTime}
                        onChange={handleInputChange('paymentTime')}
                        required
                        labelWidth="100px"
                    />

                    <FileUpload
                        label="上传附件"
                        onFilesSelect={handleFilesSelect} // 更新为onFilesSelect
                        value={selectedFiles} // 传递文件数组
                        maxFiles={6} // 设置最大文件数
                        className="mt-4"
                    />


                    <div className="flex justify-end space-x-3 mt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsModalOpen(false)}
                            disabled={isUploading}
                        >
                            取消
                        </Button>
                        <Button
                            type="submit"
                            disabled={isUploading}
                        >
                            {isUploading ? '上传中...' : '创建工单'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default TicketList;