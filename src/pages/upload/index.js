import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
import { AtInput, AtButton, AtRadio, AtImagePicker } from 'taro-ui';
import './index.scss';

export default function Upload() {
    const [formData, setFormData] = useState({
        parentName: '',
        ageGroup: '3-7',
        diagnosisImage: '',
        fileName: ''
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

        // 获取用户信息
        const token = Taro.getStorageSync('token');
        if (token) {
            Taro.request({
                url: `${Taro.requestUrl}/user/query-user-info`,
                method: 'GET',
                header: {
                    'token': token
                },
                success: (res) => {
                    if (res.data.success && res.data.data) {
                        const userInfo = res.data.data;
                        // 生成临时编码用于图片签名
                        Taro.request({
                            url: `${Taro.requestUrl}/user/generateTempCode`,
                            method: 'GET',
                            header: {
                                'token': token
                            },
                            success: (codeRes) => {
                                if (codeRes.data.success && codeRes.data.data) {
                                    const tempCode = codeRes.data.data;
                                    // 处理图片路径，添加临时编码签名
                                    const profilePath = userInfo.profilePath ? 
                                        `${Taro.requestUrl}/user/diagnosisBook/${tempCode}` : null;
                                    
                                    setFormData(prev => ({
                                        fileName: userInfo.profilePath || '',
                                        ageGroup: userInfo.ageGroup === '1' ? '3-7' : '7-12',
                                        parentName: userInfo.parentName || '',
                                        diagnosisImage: profilePath ? [profilePath] : []
                                    }));
                                }
                            },
                            fail: (error) => {
                                console.error('获取临时编码失败:', error);
                                // 即使获取临时编码失败，也设置基本信息
                                setFormData(prev => ({
                                    fileName: userInfo.profilePath || '',
                                    ageGroup: userInfo.ageGroup === '1' ? '3-7' : '7-12',
                                    parentName: userInfo.parentName || '',
                                    diagnosisImage: userInfo.profilePath ? [userInfo.profilePath] : []
                                }));
                            }
                        });
                    }
                },
                fail: (error) => {
                    console.error('获取用户信息失败:', error);
                }
            });
        }
    }, []);

    const contentHeight = windowInfo.windowHeight - (menuButtonInfo.top + menuButtonInfo.height + 40);

    const handleChange = (value, field) => {
        if (field === 'diagnosisImage' && value) {
            console.log('diagnosisImage changed:', value);
            // 立即处理图片上传
            const token = Taro.getStorageSync('token');
            if (!token) {
                Taro.showToast({
                    title: '未登录，请先登录',
                    icon: 'none'
                });
                return;
            }

            Taro.showLoading({
                title: '正在上传...',
                mask: true
            });

            Taro.uploadFile({
                url: `${Taro.requestUrl}/user/profile-file-upload`,
                filePath: value.path,
                name: 'file',
                header: {
                    'token': token
                },
                success: (res) => {
                    try {
                        const data = JSON.parse(res.data);
                        console.log('Upload response:', data);
                        if (data.success) {
                            setFormData(prev => ({
                                ...prev,
                                diagnosisImage: value.path,
                                fileName: data.data
                            }));
                            Taro.showToast({
                                title: '上传成功',
                                icon: 'success'
                            });
                        } else {
                            Taro.showToast({
                                title: data.message || '上传失败',
                                icon: 'none'
                            });
                        }
                    } catch (e) {
                        Taro.showToast({
                            title: '服务器响应格式错误',
                            icon: 'none'
                        });
                    }
                },
                fail: (error) => {
                    Taro.showToast({
                        title: error.errMsg || '上传失败',
                        icon: 'none'
                    });
                },
                complete: () => {
                    Taro.hideLoading();
                }
            });
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
        return value;
    };

    const handleSubmit = () => {
        if (!formData.parentName) {
            Taro.showToast({
                title: '请输入家长姓名',
                icon: 'none'
            });
            return;
        }

        if (formData.diagnosisImage.length === 0) {
            Taro.showToast({
                title: '请上传诊断书',
                icon: 'none'
            });
            return;
        }

       
        
        // 提交个人信息和年龄段
        const token = Taro.getStorageSync('token');
        Taro.request({
            url: `${Taro.requestUrl}/user/submit-profile-and-agegroup`,
            method: 'POST',
            header: {
                'Content-Type': 'application/json',
                'token': token
            },
            data: {
                profileFileName: formData.fileName,
                ageGroup: formData.ageGroup === '3-7'? 1 : 2,
                parentName: formData.parentName
            },
            success: (res) => {
                if (res.data.success) {
                    Taro.showToast({
                        title: '提交成功',
                        icon: 'success',
                        duration: 1500
                    });
                    setTimeout(() => {
                        // Taro.redirectTo({
                        //     url: '/pages/index/index'
                        // });
                        //提示审核中，不要跳转页面
                        Taro.showToast({
                            title: '审核中',
                            icon:'none',
                            duration: 1500
                        });
                    }, 1500);
                } else {
                    Taro.showToast({
                        title: res.data.message || '提交失败',
                        icon: 'none'
                    });
                }
            },
            fail: () => {
                Taro.showToast({
                    title: '提交失败，请重试',
                    icon: 'none'
                });
            }
        });
    };

    return (
        <View className='upload-page' style={{ background: `url(${Taro.imageUrl}/login_head_background.png) no-repeat`, backgroundSize: 'contain', backgroundPosition: 'top center', width: '100%' }}>
            <View className='upload-header' style={{
                paddingTop: `${menuButtonInfo.top}px`,
                height: `${menuButtonInfo.height}px`,
                lineHeight: `${menuButtonInfo.height}px`
            }}>
                <Text className='upload-title'>上传诊断书</Text>
            </View>
            <View style={{
                display: 'flex',
                alignItems: 'left',
                height: `${contentHeight}px`
            }}>
                <View style={{ width: '100%', padding: '0 10rpx' }}>
                    <View>
                        <View style={{ position: 'relative', marginBottom: '80rpx' }}>

                        </View>

                        <View style={{ marginBottom: '30rpx' }}>

                            <View className='age-group-selector'>
                                <View className='panel desc' style={{
                                    marginBottom: '0rpx'
                                }}>
                                    <View className='panel__title title'>请选择年龄段</View>
                                </View>
                                <View className='age-group-options'>
                                    <View
                                        className={`age-option ${formData.ageGroup === '3-7' ? 'active' : ''}`}
                                        onClick={() => handleChange('3-7', 'ageGroup')}
                                    >
                                        3-7岁
                                    </View>
                                    <View
                                        className={`age-option ${formData.ageGroup === '7-12' ? 'active' : ''}`}
                                        onClick={() => handleChange('7-12', 'ageGroup')}
                                    >
                                        7-12岁
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={{ marginBottom: '30rpx' }}>
                            <View className='panel desc' style={{
                                marginBottom: '0rpx'
                            }}>
                                <View className='panel__title title'>上传诊断书</View>
                            </View>
                            <View>
                                <AtImagePicker
                                    files={formData.diagnosisImage ? [{ url: formData.diagnosisImage }] : []}
                                    count={1}
                                    showAddBtn={formData.diagnosisImage.length < 1}
                                    onChange={(files) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            diagnosisImage: ''
                                        }));
                                        console.log(files);
                                        const isAddOperation = files.length > 0;
                                        console.log(isAddOperation ? '新增图片' : '删除图片');
                                        if (isAddOperation) {
                                            setTimeout(() => {
                                                handleChange(files[files.length - 1].file, 'diagnosisImage');
                                            }, 0);
                                        }
                                    }}
                                    multiple={false}
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        minHeight: '300rpx',
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '10rpx'
                                    }}
                                    imageStyle={{
                                        width: '220rpx',
                                        height: '220rpx'
                                    }}
                                />
                            </View>

                        </View>
                        <View style={{ marginBottom: '30rpx' }}>
                            <View className='panel desc' style={{
                                marginBottom: '0rpx'
                            }}>
                                <View className='panel__title title'>联系人姓名</View>
                            </View>
                            <View style={{ position: 'relative' }}>
                                <AtInput
                                    name='parentName'
                                    title='用户名'
                                    type='text'
                                    cursor={-1}
                                    placeholder='请输入家长姓名'
                                    value={formData.parentName}
                                    onChange={value => handleChange(value, 'parentName')}
                                />
                            </View>

                        </View>
                        <View className='upload-btn-container'>
                            
                            <AtButton type='primary' className='upload-btn' onClick={handleSubmit}>确认上传</AtButton>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}