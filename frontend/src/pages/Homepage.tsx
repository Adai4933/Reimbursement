import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import Button from '../components/Button';
import TicketList from './TicketList';
import EmployeeList from './EmployeeList';

type ActiveTab = 'tickets' | 'employees';

const Home: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('tickets');
    const [cookies, , removeCookie] = useCookies(['Authorization', 'role']);
    const navigate = useNavigate();

    // 菜单配置
    const menuItems = [
        { id: 'tickets', label: '报销单列表', visible: true },
        { id: 'employees', label: '用户列表', visible: cookies.role === 'EMPLOYER' },
    ];

    const handleLogout = () => {
        // 移除cookie
        removeCookie('Authorization');
        // 跳转到登录页面
        navigate('/login');
    };

    const visibleMenuItems = menuItems.filter(item => item.visible);

    // 渲染当前活动的内容
    const renderContent = () => {
        switch (activeTab) {
            case 'tickets':
                return <TicketList />;
            case 'employees':
                return <EmployeeList />;
            default:
                return <TicketList />;
        }
    };

    return (
        <div className="h-[92vh] bg-gray-50 flex overflow-hidden">
            {/* 侧边栏 */}
            <div className={`bg-white shadow-lg flex flex-col transition-all duration-300 w-64`}>
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold text-gray-800">管理系统</h1>
                    </div>
                </div>

                {/* 菜单区域 - 占据剩余空间 */}
                <div className="flex-1 p-4">
                    <ul className="space-y-2">
                        {visibleMenuItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => setActiveTab(item.id as ActiveTab)}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                        activeTab === item.id
                                            ? 'bg-blue-100 text-blue-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    { item.label }
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 退出登录按钮 - 固定在侧边栏底部 */}
                <div className="p-4 border-t border-gray-200">
                    <Button
                        onClick={handleLogout}
                        variant="secondary"
                        className="w-full"
                    >
                        {'退出登录'}
                    </Button>
                </div>
            </div>

            {/* 主内容区域 */}
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Home;