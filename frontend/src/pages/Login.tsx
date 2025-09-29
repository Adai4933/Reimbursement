import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import Alert from '../components/Alert';
import Checkbox from '../components/Checkbox';
import {url_prefix} from "../common/const.tsx";

interface LoginForm {
    email: string;
    password: string;
}

interface FormErrors {
    email?: string;
    password?: string;
    general?: string;
}

interface LoginResponse {
    success: boolean;
    data?: {
        group: string;
        email: string;
        username: string;
        token: string;
    };
    detail?: {
        error: string;
        success: boolean;
        error_code: number;
    }
}

const Login: React.FC = () => {
    // 状态管理
    const [formData, setFormData] = useState<LoginForm>({
        email: '',
        password: '',
    });
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const [, setCookie] = useCookies(['Authorization', 'role']);

    // 处理输入变化
    const handleInputChange = (field: keyof LoginForm) => (value: string) => {
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

        // 密码验证
        if (!formData.password) {
            newErrors.password = '密码是必填项';
        } else if (formData.password.length < 6) {
            newErrors.password = '密码至少需要6个字符';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 提交表单到/login API
    const submitLogin = async (loginData: LoginForm): Promise<LoginResponse> => {
        try {
            const response = await fetch(`${url_prefix}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            });

            if (!response.ok) {
                return { success: false, detail: { error: '登录失败，请检查邮箱与密码是否正确', success: false, error_code: response.status } };
            }

            const data: LoginResponse = await response.json();
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
        setErrors({}); // 清除之前的错误

        try {
            const result = await submitLogin(formData);

            if (result.success) {
                // 登录成功处理
                console.log('登录成功:');

                setCookie('Authorization', result.data?.token, {
                    path: '/',
                    maxAge: (rememberMe ? 7 * 24 : 12) * 60 * 60, // 如果记住我，设置7天有效期，否则有效期12小时
                });

                setCookie('role', result.data?.group, {
                    path: '/',
                    maxAge: (rememberMe ? 7 * 24 : 12) * 60 * 60, // 如果记住我，设置7天有效期，否则有效期12小时
                });

                // 跳转到主页
                navigate('/');
            } else {
                // 登录失败处理
                setErrors({
                    general: '登录失败，请检查您的凭据',
                });
            }
        } catch (error) {
            console.error('登录失败:', error);
            setErrors({
                general: '网络错误，请检查您的连接后重试',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[90vh] from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">欢迎回来</h1>
                    <p className="text-gray-600 mt-2">
                        或{' '}
                        <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                            注册新账户
                        </Link>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* general error message */}
                    {errors.general && (
                        <Alert type="error" message={errors.general} />
                    )}

                    <div className="space-y-4">
                        <Input
                            type="email"
                            placeholder="请输入邮箱地址"
                            value={formData.email}
                            onChange={handleInputChange('email')}
                            required
                            error={!!errors.email}
                            errorMessage={errors.email}
                            labelWidth="80px"
                        />

                        <Input
                            type="password"
                            placeholder="请输入密码"
                            value={formData.password}
                            onChange={handleInputChange('password')}
                            required
                            error={!!errors.password}
                            errorMessage={errors.password}
                            labelWidth="80px"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Checkbox
                            label="记住我"
                            checked={rememberMe}
                            onChange={setRememberMe}
                        />

                        {/* to display TODO forget password function */}
                        <div className="text-sm">
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-700">
                                忘记密码?
                            </a>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? '登录中...' : '登录'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default Login;