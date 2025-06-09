import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input, Image, Button } from '@tarojs/components';
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

    const [isWeapp, setIsWeapp] = useState(false);

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

        // 判断是否在微信小程序环境
        const env = Taro.getEnv();
        setIsWeapp(env === 'WEAPP');
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
            console.log(phone, code, name);
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

    const handleGetPhoneNumber = async (e) => {
        if (!e.detail.code) {
            Taro.showToast({
                title: '获取手机号失败',
                icon: 'none'
            });
            return;
        }

        if (!formData.username) {
            Taro.showToast({
                title: '请输入幼儿姓名',
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

        try {
            const response = await Taro.request({
                url: `${BASE_API_URL}/user/wx-login?code=${e.detail.code}&name=${formData.username}`,
                method: 'POST',
                header: {
                    'Content-Type': 'application/json',
                    'token': Taro.getStorageSync('token') || ''
                },
            });

            const { data } = response;
            if (!data.success) {
                throw new Error(data.message || '登录失败');
            }

            // 存储用户信息
            if (data.data) {
                const userInfo = data.data;
                if (userInfo.token) {
                    Taro.setStorageSync('token', userInfo.token);
                }
                Taro.setStorageSync('userInfo', userInfo);
                Taro.showNote = true
                
                Taro.showToast({
                    title: '登录成功',
                    icon: 'success',
                    duration: 1500
                });

                // 根据用户状态进行跳转
                setTimeout(() => {
                    if (userInfo.processStatus === '1' || !userInfo.profilePath) {
                        Taro.navigateTo({ url: '/pages/upload/index' });
                    } else if (userInfo.processStatus === '2') {
                        Taro.showToast({
                            title: '资料审核中',
                            icon: 'none',
                            duration: 2000
                        });
                        setTimeout(() => {
                            Taro.navigateTo({ url: '/pages/upload/index' });
                        }, 2000);
                    } else if (userInfo.processStatus === '3') {
                        Taro.showToast({
                            title: '资料审核不通过，请重新提交',
                            icon: 'none',
                            duration: 2000
                        });
                        setTimeout(() => {
                            Taro.navigateTo({ url: '/pages/upload/index' });
                        }, 2000);
                    } else if (userInfo.processStatus === '4') {
                        Taro.showToast({
                            title: '账号已被封禁',
                            icon: 'none',
                            duration: 2000
                        });
                    } else {
                        Taro.navigateTo({ url: '/pages/index/index' });
                    }
                }, 1500);
            }
        } catch (error) {
            console.error('登录失败:', error);
            Taro.showToast({
                title: error.message || '登录失败，请重试',
                icon: 'none'
            });
        }
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
                        <View style={{ 
                            textAlign: 'center', 
                            marginBottom: '40rpx',
                            padding: '0 40rpx'
                        }}>
                            <Text style={{
                                fontSize: '36rpx',
                                fontWeight: 'bold',
                                color: '#333',
                                lineHeight: '1.5'
                            }}>星跃孤独症儿童干预进阶测评</Text>
                        </View>
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
                        <View style={{ position: 'relative' }}>
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
                        
                        {!isWeapp && (
                            <>
                                <View style={{ position: 'relative' }}>
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
                                <View className='verify-code-container' style={{ position: 'relative' }}>
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
                            </>
                        )}

                        <View className='login-btn-container'>
                            {isWeapp ? (
                                <Button
                                    className='login-btn'
                                    openType='getPhoneNumber'
                                    onGetPhoneNumber={handleGetPhoneNumber}
                                    style={{
                                        width: '100%',
                                        height: '88rpx',
                                        lineHeight: '88rpx',
                                        fontSize: '32rpx',
                                        borderRadius: '44rpx',
                                        background: 'linear-gradient(to right, #B2E5FB, #09A3FF)',
                                        border: 'none',
                                        color: '#fff'
                                    }}
                                >
                                    手机号快捷登录
                                </Button>
                            ) : (
                                <AtButton type='primary' className='login-btn' onClick={handleLogin}>一键登录</AtButton>
                            )}
                        </View>
                        <View className='agreement-container' style={{ width: '100%', padding: '20rpx 30rpx', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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