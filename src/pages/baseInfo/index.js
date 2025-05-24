import React, { useState, useEffect, useMemo  } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input, Image } from '@tarojs/components';
import { AtInput, AtButton, AtForm } from 'taro-ui';
import { Radio } from "@taroify/core";
import './index.scss';
import { BASE_API_URL } from '../../constants/common'
import { DatetimePicker } from "@taroify/core"
import { Picker } from "@taroify/core"

export default function Login() {
    const [formData, setFormData] = useState({
        birthDate: '',
        gender: '',
        diagnosisResult: '',
        diagnosisLevel: '',
        diagnosisAge: '',
        organizationName: '',
        organizationType: '',
        agreement: false
    });

    
    const [visible, setVisible] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleDateChange = (event) => {
        console.log(event);
        const date = new Date(event);
        console.log(date);
        if (!isNaN(date.getTime())) {
            setCurrentDate(date);
        }
    };

    const handleDateConfirm = () => {
        const formattedDate = formatDate(currentDate);
        console.log(formattedDate);
        if (formattedDate) {
            handleChange(formattedDate, 'birthDate');
            setVisible(false);
        }
    };

    const handleDateCancel = () => {
        setVisible(false);
    };

    const [agePickerVisible, setAgePickerVisible] = useState(false);
    const ageColumns = useMemo(
        () => Array.from({length: 12}, (_, i) => ({
            label: `${i + 1}岁`,
            value: (i + 1).toString()
        })),
        []
    );

    const handleAgeConfirm = (value) => {
        handleChange(value, 'diagnosisAge');
        setAgePickerVisible(false);
    };

    const handleAgeCancel = () => {
        setAgePickerVisible(false);
    };

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
        // 验证必填字段
        if (!formData.birthDate || !formData.gender || !formData.diagnosisResult || !formData.diagnosisLevel || !formData.diagnosisAge) {
            Taro.showToast({
                title: '请填写完整信息',
                icon: 'none'
            });
            return;
        }



        // 验证诊断年龄
        const age = parseInt(formData.diagnosisAge);
        if (isNaN(age) || age < 0 || age > 100) {
            Taro.showToast({
                title: '请输入有效的诊断年龄',
                icon: 'none'
            });
            return;
        }

        // 准备提交的数据
        const submitData = {
            birthday: formData.birthDate,
            sex: formData.gender,
            diagnosisResult: formData.diagnosisResult,
            diagnosis: formData.diagnosisLevel,
            ageDiagnosis: parseInt(formData.diagnosisAge),
            organizationName: formData.organizationName || '',
            organizationType: formData.organizationType || ''
        };

        // 调用提交接口
        Taro.request({
            url: `${BASE_API_URL}/user/submit-user-info`,
            method: 'POST',
            header: {
                'Content-Type': 'application/json',
                'token': Taro.getStorageSync('token')
            },
            data: submitData
        }).then(res => {
            const { data } = res;
            if (data.success) {
                Taro.showToast({
                    title: '提交成功',
                    icon: 'success',
                    duration: 1500
                });
                setTimeout(() => {
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
                }, 1500);
            } else {
                throw new Error(data.message || '提交失败');
            }
        }).catch(error => {
            Taro.showToast({
                title: error.message || '提交失败，请重试',
                icon: 'none'
            });
        });
    };


    return (
        <View className='login-page' style={{ background: `url(${Taro.imageUrl}/login_head_background.png) no-repeat`, backgroundSize: 'contain', backgroundPosition: 'top center', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
            <View style={{
                borderRadius: '16rpx',
                backgroundColor: '#fff',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                padding: '30rpx',
                margin: '20rpx',
                fontSize: '28rpx',
            }}>
                <View style={{ marginBottom: '20rpx', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                    <Text style={{ fontSize: '30rpx', fontWeight: '500' }}>1、您孩子的出生日期</Text>
                </View>
                <View onClick={() => setVisible(true)} style={{ background: '#FBFBFB', borderRadius: '2rpx', padding: '15rpx' }}>
                    <Text style={{ color: formData.birthDate ? '#333' : '#999' }}>
                        {formData.birthDate || '请选择孩子的出生日期'}
                    </Text>
                </View>
                
            </View>
            <View style={{
                borderRadius: '16rpx',
                backgroundColor: '#fff',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                padding: '30rpx',
                margin: '20rpx',
                fontSize: '28rpx',
            }}>
                <View style={{ marginBottom: '20rpx' }}>
                    <Text style={{ fontSize: '30rpx', fontWeight: '500' }}>2、您孩子的性别</Text>
                </View>
                <Radio.Group value={formData.gender} onChange={(value) => handleChange(value, 'gender')} direction="horizontal">
                    <Radio name="男">男</Radio>
                    <Radio name="女">女</Radio>
                </Radio.Group>
            </View>

            <View style={{
                borderRadius: '16rpx',
                backgroundColor: '#fff',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                padding: '30rpx',
                margin: '20rpx',
                fontSize: '28rpx',
            }}>
                <View style={{ marginBottom: '20rpx' }}>
                    <Text style={{ fontSize: '30rpx', fontWeight: '500' }}>3、您孩子孤独症(自闭症)谱系诊断结果</Text>
                </View>
                <Radio.Group value={formData.diagnosisResult} onChange={(value) => handleChange(value, 'diagnosisResult')}>
                    <Radio name="A">A. 孤独症谱系障碍(或自闭症)</Radio>
                    <Radio name="B">B. 疑似孤独症</Radio>
                    <Radio name="C">C. 非孤独症 </Radio>
                    <Radio name="D">D. 未进行过专业诊断</Radio>
                </Radio.Group>
            </View>

            <View style={{
                borderRadius: '16rpx',
                backgroundColor: '#fff',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                padding: '30rpx',
                margin: '20rpx',
                fontSize: '28rpx',
            }}>
                <View style={{ marginBottom: '20rpx' }}>
                    <Text style={{ fontSize: '30rpx', fontWeight: '500' }}>4、您孩子孤独症(自闭症)程度的诊断情况</Text>
                </View>
                <Radio.Group value={formData.diagnosisLevel} onChange={(value) => handleChange(value, 'diagnosisLevel')}>
                    <Radio name="A">A. 疑似</Radio>
                    <Radio name="B">B. 轻度</Radio>
                    <Radio name="C">C. 中度</Radio>
                    <Radio name="D">D. 重度</Radio>
                    <Radio name="E">E. 不清楚</Radio>
                </Radio.Group>
            </View>

            <View style={{
                borderRadius: '16rpx',
                backgroundColor: '#fff',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                padding: '30rpx',
                margin: '20rpx',
                fontSize: '28rpx',
            }}>
                <View style={{ marginBottom: '20rpx', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                    <Text style={{ fontSize: '30rpx', fontWeight: '500' }}>5、您孩子诊断出孤独症的年龄</Text>
                    {/* <Text style={{ color: '#999999', fontSize: '24rpx', marginLeft: '10rpx' }}>（请输入数字，单位：岁）</Text> */}
                </View>
                <View onClick={() => setAgePickerVisible(true)} style={{ background: '#FBFBFB', borderRadius: '2rpx', padding: '15rpx' }}>
                    <Text style={{ color: formData.diagnosisAge ? '#333' : '#999' }}>
                        {formData.diagnosisAge ? `${formData.diagnosisAge}岁` : '请选择诊断年龄'}
                    </Text>
                </View>
                <Picker
                    title="选择诊断年龄"
                    columns={ageColumns}
                    open={agePickerVisible}
                    onCancel={handleAgeCancel}
                    onConfirm={handleAgeConfirm}
                    closeOnOverlayClick
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        width: '100%',
                        backgroundColor: '#fff',
                        borderTopLeftRadius: '16rpx',
                        borderTopRightRadius: '16rpx',
                        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000,
                        transition: 'transform 0.3s ease-in-out',
                        transform: agePickerVisible ? 'translateY(0)' : 'translateY(100%)'
                    }}
                />
            </View>

            <View style={{
                borderRadius: '16rpx',
                backgroundColor: '#fff',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                padding: '30rpx',
                margin: '20rpx',
                fontSize: '28rpx',
            }}>
                <View style={{ marginBottom: '20rpx' }}>
                    <Text style={{ fontSize: '30rpx', fontWeight: '500' }}>6、机构/学校/医院/幼儿园的名称</Text>
                </View>
                <AtInput
                    name='organizationName'
                    cursor={-1}
                    type='text'
                    placeholder='请输入机构名称'
                    value={formData.organizationName}
                    onChange={(value) => handleChange(value, 'organizationName')}
                />
            </View>

            <View style={{
                borderRadius: '16rpx',
                backgroundColor: '#fff',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                padding: '30rpx',
                margin: '20rpx',
                fontSize: '28rpx',
            }}>
                <View style={{ marginBottom: '20rpx' }}>
                    <Text style={{ fontSize: '30rpx', fontWeight: '500' }}>7、机构类型</Text>
                </View>
                <Radio.Group value={formData.organizationType} onChange={(value) => handleChange(value, 'organizationType')}>
                    <Radio name="机构">机构</Radio>
                    <Radio name="小学">小学</Radio>
                    <Radio name="幼儿园">幼儿园</Radio>
                    <Radio name="医院">医院</Radio>
                </Radio.Group>
            </View>

            <View className='login-btn-container'>
                <AtButton type='primary' className='login-btn' onClick={handleLogin}>确定</AtButton>
            </View>
            <View style={{
                height: '50rpx',
            }}>
                
            </View>
            <DatetimePicker
                type="date"
                value={currentDate}
                open={visible}
                onCancel={handleDateCancel}
                onConfirm={handleDateConfirm}
                onChange={handleDateChange}
                min={new Date(1990, 0, 1)}
                max={new Date()}
                closeOnOverlayClick
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    width: '100%',
                    backgroundColor: '#fff',
                    borderTopLeftRadius: '16rpx',
                    borderTopRightRadius: '16rpx',
                    boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000,
                    transition: 'transform 0.3s ease-in-out',
                    transform: visible ? 'translateY(0)' : 'translateY(100%)'
                }}
            />
        </View>
    );
}


