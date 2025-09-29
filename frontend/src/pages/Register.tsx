import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import Select from '../components/Select';
import Alert from '../components/Alert';
import {url_prefix, USER_GROUPS} from "../common/const.tsx";

// 定义表单数据类型
interface RegisterForm {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    group: 'employee' | 'employer';
}

// 定义错误类型
interface FormErrors {
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
    group?: string;
    general?: string;
}

// 定义API响应类型
interface RegisterResponse {
    success: boolean;
    user?: {
        email: string;
        username: string;
        group: string;
    };
}

const Register: React.FC = () => {
    // 状态管理
    const [formData, setFormData] = useState<RegisterForm>({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        group: 'employee', // 默认值
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [, setCookie] = useCookies(['Authorization']);
    const navigate = useNavigate();

    // 处理输入变化
    const handleInputChange = (field: keyof RegisterForm) => (value: string) => {
        setFormData({
            ...formData,
            [field]: value,
        });

        // 清除对应字段的错误信息
        if (errors[field]) {
            setErrors({
                ...errors,
                [field]: undefined,
            });
        }

        // 清除通用错误信息
        if (errors.general) {
            setErrors({
                ...errors,
                general: undefined,
            });
        }
    };

    // 表单验证
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // 邮箱验证
        if (!formData.email) {
            newErrors.email = '邮箱地址是必填项';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = '邮箱地址格式不正确';
        }

        // 用户名验证
        if (!formData.username) {
            newErrors.username = '用户名是必填项';
        } else if (formData.username.length < 3) {
            newErrors.username = '用户名至少需要3个字符';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = '用户名只能包含字母、数字和下划线';
        }

        // 密码验证
        if (!formData.password) {
            newErrors.password = '密码是必填项';
        } else if (formData.password.length < 6) {
            newErrors.password = '密码至少需要6个字符';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = '密码必须包含大小写字母和数字';
        }

        // 确认密码验证
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = '请确认密码';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = '两次输入的密码不一致';
        }

        // 用户组验证
        if (!formData.group) {
            newErrors.group = '请选择用户类型';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 提交表单到/register API
    const submitRegister = async (registerData: Omit<RegisterForm, 'confirmPassword'>): Promise<RegisterResponse> => {
        try {
            const response = await fetch(`${url_prefix}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data: RegisterResponse = await response.json();
            return data;
        } catch (error) {
            console.error('API调用失败:', error);
            throw error;
        }
    };

    // 提交登录表单
    const submitLogin = async (loginData: { email: string; password: string }) => {
        try {
            const response = await fetch(url_prefix + '/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API调用失败:', error);
            throw error;
        }
    };

    // 处理表单提交
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            // 移除确认密码字段后再提交
            const { confirmPassword, ...submitData } = formData;

            const result = await submitRegister(submitData);

            if (result.success) {
                // 注册成功，尝试自动登录
                try {
                    const loginResult = await submitLogin({
                        email: formData.email,
                        password: formData.password,
                    });

                    if (loginResult.success && loginResult.token) {
                        // 保存token到cookie
                        setCookie('Authorization', loginResult.token, { path: '/' });
                        // 跳转到主页
                        navigate('/');
                        return;
                    }
                } catch (loginError) {
                    console.error('自动登录失败:', loginError);
                }

                // 如果自动登录失败，显示注册成功页面
                setIsRegistered(true);
            } else {
                setErrors({
                    general: '注册失败，请重试',
                });
            }
        } catch (error) {
            console.error('注册失败:', error);
            setErrors({
                general: error instanceof Error ? error.message : '网络错误，请检查您的连接后重试',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // 注册成功显示
    if (isRegistered) {
        return (
            <div className="h-[90vh] from-green-50 to-blue-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-green-900 mb-2">注册成功！</h3>
                    <p className="text-green-700 mb-6">您的账户已创建成功，请前往登录页面登录。</p>
                    <div className="space-y-3">
                        <Button
                            onClick={() => navigate('/login')}
                            className="w-full"
                        >
                            立即登录
                        </Button>
                        <Button
                            onClick={() => setIsRegistered(false)}
                            variant="secondary"
                            className="w-full"
                        >
                            继续注册
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="h-[90vh] from-green-50 to-blue-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">创建您的账户</h1>
                    <p className="text-gray-600 mt-2">
                        或{' '}
                        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                            登录现有账户
                        </Link>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 通用错误提示 */}
                    {errors.general && (
                        <Alert type="error" message={errors.general} />
                    )}

                    <div className="space-y-4">
                        {/* 邮箱输入 */}
                        <Input
                            label="邮箱地址"
                            type="email"
                            placeholder="请输入邮箱地址"
                            value={formData.email}
                            onChange={handleInputChange('email')}
                            required
                            error={!!errors.email}
                            errorMessage={errors.email}
                            labelWidth="80px"
                        />

                        {/* 用户名输入 */}
                        <Input
                            label="用户名"
                            type="text"
                            placeholder="请输入用户名"
                            value={formData.username}
                            onChange={handleInputChange('username')}
                            required
                            error={!!errors.username}
                            errorMessage={errors.username}
                            labelWidth="80px"
                        />

                        {/* 用户组选择 */}
                        <Select
                            label="用户类型"
                            value={formData.group}
                            onChange={handleInputChange('group')}
                            options={USER_GROUPS}
                            placeholder="请选择用户类型"
                            required
                            error={!!errors.group}
                            errorMessage={errors.group}
                            labelWidth="80px"
                        />

                        {/* 密码输入 */}
                        <Input
                            label="密码"
                            type="password"
                            placeholder="请输入密码"
                            value={formData.password}
                            onChange={handleInputChange('password')}
                            required
                            error={!!errors.password}
                            errorMessage={errors.password}
                            helperText="密码必须包含大小写字母和数字，且长度不少于6位"
                            labelWidth="80px"
                        />

                        {/* 确认密码输入 */}
                        <Input
                            label="确认密码"
                            type="password"
                            placeholder="请再次输入密码"
                            value={formData.confirmPassword}
                            onChange={handleInputChange('confirmPassword')}
                            required
                            error={!!errors.confirmPassword}
                            errorMessage={errors.confirmPassword}
                            labelWidth="80px"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? '注册中...' : '注册账户'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default Register;