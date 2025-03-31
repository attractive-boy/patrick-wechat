import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input, Image } from '@tarojs/components';
import { AtInput, AtButton, AtForm } from 'taro-ui';
import './index.scss';
import { BASE_API_URL } from '../../constants/common'

export default function Login() {
    const [formData, setFormData] = useState({
        username: '',
        phone: '',
        verifyCode: '',
        agreement: false
    });

    const [menuButtonInfo, setMenuButtonInfo] = useState({
        top: 0,
        height: 0
    });

    const [windowInfo, setWindowInfo] = useState({
        windowHeight: 0
    });

    useEffect(() => {
        const menuButton = Taro.getMenuButtonBoundingClientRect();
        const windowInfo = Taro.getWindowInfo();
        setMenuButtonInfo({
            top: menuButton.top,
            height: menuButton.height
        });
        setWindowInfo({
            windowHeight: windowInfo.windowHeight
        });
    }, []);

    const contentHeight = windowInfo.windowHeight - (menuButtonInfo.top + menuButtonInfo.height + 40);

    const handleChange = (value, field) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        return value;
    };

    const [countdown, setCountdown] = useState(0);

    const login = async ({ phone, code, name }) => {
        try {
            const response = await Taro.request({
                url: `${BASE_API_URL}/user/login`,
                method: 'POST',
                header: {
                    'Content-Type': 'application/json'
                },
                data: { phone, code, name }
            });
            const { data } = response;
            if (!data.success) {
                throw new Error(data.message || '登录失败');
            }
            // 存储token和用户信息
            if (data.data.token) {
                console.log('登录成功:', data.data.token);
                Taro.setStorageSync('token', data.data.token);
                Taro.setStorageSync('userInfo', data.data);
            }
            return data;
        } catch (error) {
            console.error('登录失败:', error);
            throw error;
        }
    }
    const phone_code = async (phone) => {
        try {
            const response = await Taro.request({
                url: `${BASE_API_URL}/verification/verification/code/send`,
                method: 'POST',
                header: {
                    'Content-Type': 'application/json'
                },
                data: { phone }
            });
            const data = response.data;
            if (!data.success) {
                throw new Error(data.message || '发送验证码失败');
            }
            return data;
        } catch (error) {
            console.error('发送验证码失败:', error);
            throw error;
        }
    }

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const handleGetVerifyCode = () => {
        if (!formData.phone) {
            Taro.showToast({
                title: '请输入手机号',
                icon: 'none'
            });
            return;
        }
        // 验证手机号格式
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(formData.phone)) {
            Taro.showToast({
                title: '请输入正确的手机号',
                icon: 'none'
            });
            return;
        }
        // 调用获取验证码接口
        phone_code(formData.phone).then(() => {
            Taro.showToast({
                title: '验证码已发送',
                icon: 'success'
            });
            setCountdown(60);
        }).catch(error => {
            Taro.showToast({
                title: error.message || '获取验证码失败，请重试',
                icon: 'none'
            });
        });
    };

    const handleLogin = () => {
        if (!formData.username || !formData.phone || !formData.verifyCode) {
            Taro.showToast({
                title: '请填写完整信息',
                icon: 'none'
            });
            return;
        }
        if (!formData.agreement) {
            Taro.showToast({
                title: '请阅读并同意用户协议和隐私政策',
                icon: 'none'
            });
            return;
        }
        // 调用登录接口
        login({
            name: formData.username,
            phone: formData.phone,
            code: formData.verifyCode
        }).then(res => {
            Taro.showToast({
                title: '登录成功',
                icon: 'success',
                duration: 1500
            });
            setTimeout(() => {
                const userInfo = Taro.getStorageSync('userInfo');
                if (!userInfo.profilePath) {
                    Taro.navigateTo({
                        url: '/pages/upload/index',
                        success: () => {
                            console.log('导航成功');
                        },
                        fail: (err) => {
                            console.error('导航失败:', err);
                            Taro.showToast({
                                title: '页面跳转失败，请重试',
                                icon: 'none',
                                duration: 2000
                            });
                        }
                    });
                } else {
                    Taro.navigateTo({
                        url: '/pages/index/index',
                        success: () => {
                            console.log('导航成功');
                        },
                        fail: (err) => {
                            console.error('导航失败:', err);
                            Taro.showToast({
                                title: '页面跳转失败，请重试',
                                icon: 'none',
                                duration: 2000
                            });
                        }
                    });
                }

            }, 1500);
        }).catch(error => {
            Taro.showToast({
                title: error.message || '登录失败，请重试',
                icon: 'none'
            });
        });

    };

    return (
        <View className='login-page' style={{ background: `url(${Taro.imageUrl}/login_head_background.png) no-repeat`, backgroundSize: 'contain', backgroundPosition: 'top center', width: '100%' }}>
            <View>

            </View>
        </View>
    );
}