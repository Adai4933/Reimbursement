import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import Table from '../components/Table';
import Button from '../components/Button';
import Alert from '../components/Alert';
import type { TableColumn, User } from "../types/entity";
import {url_prefix} from "../common/const.tsx";

interface EmployeeListResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

const EmployeeList: React.FC = () => {
    const [cookies] = useCookies(['Authorization']);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    // 组件加载时获取用户列表
    useEffect(() => {
        fetchUsers();
    }, []);

    // 获取用户列表
    const fetchUsers = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${url_prefix}/user/list`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${cookies.Authorization}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`获取用户列表失败: ${response.status}`);
            }

            const result: EmployeeListResponse<User[]> = await response.json();

            if (result.success && result.data) {
                setUsers(result.data);
            } else {
                throw new Error(result.message || '获取用户列表失败');
            }
        } catch (error) {
            console.error('获取用户列表失败:', error);
            setError(error instanceof Error ? error.message : '网络错误，请检查连接');
        } finally {
            setIsLoading(false);
        }
    };

    // 切换用户暂停状态
    const toggleSuspendUser = async (userId: string, currentSuspended: boolean) => {
        setProcessingId(userId);

        try {
            const response = await fetch(`${url_prefix}/user/suspend`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cookies.Authorization}`,
                },
                body: JSON.stringify({
                    user_id: userId,
                    suspended: !currentSuspended
                }),
            });

            if (!response.ok) {
                throw new Error('操作失败');
            }

            const result: EmployeeListResponse<User> = await response.json();

            if (result.success && result.data) {
                // 更新本地用户状态
                fetchUsers();

                alert(`用户已${!currentSuspended ? '暂停' : '恢复'}`);
            } else {
                throw new Error(result.message || '操作失败');
            }
        } catch (error) {
            console.error('操作失败:', error);
            alert('操作失败，请重试');
        } finally {
            setProcessingId(null);
        }
    };

    const columns: TableColumn<User>[] = [
        { key: 'id', label: 'ID' },
        { key: 'username', label: '姓名' },
        {
            key: 'role',
            label: '类型',
            render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    value === 'EMPLOYER'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                }`}>
          {value === 'EMPLOYER' ? '雇主' : '员工'}
        </span>
            )
        },
        { key: 'email', label: '邮箱' },
        {
            key: 'suspended',
            label: '状态',
            render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    value
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                }`}>
          {value ? '已暂停' : '正常'}
        </span>
            )
        },
        {
            key: 'createdAt',
            label: '创建时间',
            render: (value) => value ? new Date(value).toLocaleDateString() : '-'
        },
        {
            key: 'id',
            label: '操作',
            render: (value, item) => (
                <div className="flex space-x-2">
                    {item.role === 'EMPLOYEE' && ( // 只有员工可以被suspend或恢复
                        <button
                            onClick={() => toggleSuspendUser(value, item.suspended || false)}
                            disabled={processingId === value}
                            className={`px-3 py-1 text-xs rounded transition-colors ${
                                item.suspended
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                            } ${processingId === value ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {processingId === value
                                ? '处理中...'
                                : item.suspended ? '恢复' : '暂停'
                            }
                        </button>
                    )}
                    {item.role === 'EMPLOYER' && (
                        <span className="text-gray-400 text-xs">不可操作</span>
                    )}
                </div>
            )
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">用户列表</h1>
            </div>

            {/* 错误提示 */}
            {error && (
                <Alert type="error" message={error} className="mb-4" />
            )}

            {/* 加载状态 */}
            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <Table
                    data={users}
                    columns={columns}
                    keyExtractor={(item) => item.id}
                />
            )}
        </div>
    );
};

export default EmployeeList;