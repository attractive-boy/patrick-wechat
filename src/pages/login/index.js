import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input, Image } from '@tarojs/components';
import { AtInput, AtButton, AtForm } from 'taro-ui';
import './index.scss';
import api from '../../api/questionnaires';

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
        api.phone_code(formData.phone).then(() => {
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
        api.login({
            username: formData.username,
            phone: formData.phone,
            code: formData.verifyCode
        }).then(res => {
            // 保存token
            Taro.setStorageSync('token', res.token);
            Taro.showToast({
                title: '登录成功',
                icon: 'success',
                duration: 1500
            });
            setTimeout(() => {
                Taro.redirectTo({
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
            <View className='login-header' style={{
                paddingTop: `${menuButtonInfo.top}px`,
                height: `${menuButtonInfo.height}px`,
                lineHeight: `${menuButtonInfo.height}px`
            }}>
                <Text className='login-title'>登录</Text>
            </View>
            <View style={{
                display: 'flex',
                alignItems: 'center',
                height: `${contentHeight}px`
            }}>

                <View style={{ width: '100%' }}>
                    <View>
                        <View className='logo-container' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Image
                                className='logo'
                                style={{
                                    width: '280rpx',
                                    height: '280rpx',
                                    borderRadius: '50%',
                                }}
                                src={`${Taro.imageUrl}/logo.png`}
                                mode='aspectFit'
                            />
                        </View>
                        <Input></Input>
                        <View style={{position:'relative'}}>
                            <View style={{
                                width: '40rpx',
                                height: '40rpx',
                                marginRight: '10rpx',
                                float: 'left'
                            }}>
                                <Image
                                    style={{
                                        width: '30rpx',
                                        height: '30rpx',
                                        position: 'absolute',
                                        top: '50%',
                                        left: '30rpx',
                                        transform: 'translateY(-50%)',
                                        zIndex: '1000'
                                    }}
                                    src={`${Taro.imageUrl}/login_childname.png`}
                                    mode='aspectFit'
                                />
                            </View>
                            <AtInput
                                name='username'
                                title='用户名'
                                type='text'
                                cursor={-1}
                                placeholder='请输入幼儿姓名'
                                value={formData.username}
                                onChange={value => handleChange(value, 'username')}
                            />
                        </View>
                        <View style={{position:'relative'}}>
                            <View style={{
                                width: '40rpx',
                                height: '40rpx',
                                marginRight: '10rpx',
                                float: 'left'
                            }}>
                                <Image
                                    style={{
                                        width: '30rpx',
                                        height: '30rpx',
                                        position: 'absolute',
                                        top: '50%',
                                        left: '30rpx',
                                        transform: 'translateY(-50%)',
                                        zIndex: '1000'
                                    }}
                                    src={`${Taro.imageUrl}/login_phonenumber.png`}
                                    mode='aspectFit'
                                />
                            </View>
                            <AtInput
                                name='phone'
                                title='手机号'
                                type='phone'
                                cursor={-1}
                                placeholder='请输入手机号码'
                                value={formData.phone}
                                onChange={value => handleChange(value, 'phone')}
                            />
                        </View>
                        <View className='verify-code-container' style={{position:'relative'}}>
                            <View style={{
                                width: '40rpx',
                                height: '40rpx',
                                marginRight: '10rpx',
                                float: 'left'
                            }}>
                                <Image
                                    style={{
                                        width: '30rpx',
                                        height: '30rpx',
                                        position: 'absolute',
                                        top: '50%',
                                        left: '30rpx',
                                        transform: 'translateY(-50%)',
                                        zIndex: '1000'
                                    }}
                                    src={`${Taro.imageUrl}/login_authcode.png`}
                                    mode='aspectFit'
                                />
                            </View>
                            <AtInput
                                name='verifyCode'
                                title='验证码'
                                cursor={-1}
                                type='text'
                                placeholder='请输入验证码'
                                value={formData.verifyCode}
                                onChange={value => handleChange(value, 'verifyCode')}
                            />
                            <AtButton 
                                className='verify-code-btn' 
                                onClick={handleGetVerifyCode} 
                                disabled={countdown > 0}
                                style={{
                                    backgroundColor: countdown > 0 ? '#80D1FF' : '#09A3FF',
                                    borderRadius: '30px',
                                    border: 'none',
                                    color: '#fff'
                                }}
                            >
                                {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
                            </AtButton>
                        </View>
                        <View className='login-btn-container'>
                            
                            <AtButton type='primary' className='login-btn' onClick={handleLogin}>一键登录</AtButton>
                        </View>
                        <View className='agreement-container' style={{ width:'100%', padding: '20rpx 30rpx', display: 'flex', alignItems: 'center',justifyContent:'center' }}>
                                <View 
                                    style={{ 
                                        width: '40rpx', 
                                        height: '40rpx', 
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        backgroundColor: formData.agreement ? '#09A3FF' : '#fff',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: '10rpx'
                                    }}
                                    onClick={() => handleChange(!formData.agreement, 'agreement')}
                                >
                                    {formData.agreement && (
                                        <Text style={{ color: '#fff', fontSize: '24rpx' }}>✓</Text>
                                    )}
                                </View>
                                <Text style={{ fontSize: '24rpx', color: '#666' }}>
                                    我已阅读并同意
                                    <Text style={{ color: '#09A3FF' }}>《用户服务协议》</Text>
                                    和
                                    <Text style={{ color: '#09A3FF' }}>《隐私政策》</Text>
                                </Text>
                            </View>
                    </View>
                </View>
            </View>
        </View>
    );
}