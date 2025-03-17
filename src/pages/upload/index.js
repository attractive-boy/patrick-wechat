import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
import { AtInput, AtButton, AtRadio, AtImagePicker } from 'taro-ui';
import './index.scss';

export default function Upload() {
    const [formData, setFormData] = useState({
        childName: '',
        ageGroup: '3-7',
        diagnosisImage: []
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

    const handleUploadImage = () => {
        Taro.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: function (res) {
                const tempFilePath = res.tempFilePaths[0];
                setFormData(prev => ({
                    ...prev,
                    diagnosisImage: tempFilePath
                }));
            },
            fail: function () {
                Taro.showToast({
                    title: '选择图片失败',
                    icon: 'none'
                });
            }
        });
    };

    const handleSubmit = () => {
        if (!formData.username) {
            Taro.showToast({
                title: '请输入幼儿姓名',
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

        // 创建上传任务队列
        const uploadTasks = formData.diagnosisImage.map(image => {
            return new Promise((resolve, reject) => {
                const token = Taro.getStorageSync('token');
                if (!token) {
                    reject(new Error('未登录，请先登录'));
                    return;
                }
                Taro.uploadFile({
                    url: `${Taro.requestUrl}/user/profile-file-upload`,
                    filePath: image,
                    name: 'file',
                    header: {
                        'token': token
                    },
                    success: (res) => {
                        try {
                            const data = JSON.parse(res.data);
                            if (data.success) {
                                resolve(data);
                            } else {
                                reject(new Error(data.message || '上传失败'));
                            }
                        } catch (e) {
                            reject(new Error('服务器响应格式错误'));
                        }
                    },
                    fail: (error) => {
                        reject(new Error(error.errMsg || '上传失败'));
                    }
                });
            });
        });

        // 执行所有上传任务
        Promise.all(uploadTasks)
            .then((results) => {
                // 获取上传成功后的文件名
                const profileFileName = results[0].data;
                
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
                        profileFileName: profileFileName,
                        ageGroup: formData.ageGroup
                    },
                    success: (res) => {
                        if (res.data.success) {
                            Taro.showToast({
                                title: '提交成功',
                                icon: 'success',
                                duration: 1500
                            });
                            setTimeout(() => {
                                Taro.redirectTo({
                                    url: '/pages/index/index'
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
            })
            .catch(() => {
                Taro.showToast({
                    title: '上传失败，请重试',
                    icon: 'none'
                });
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
                                    files={formData.diagnosisImage.map(url => ({ url }))}
                                    onChange={(files) => {
                                        handleChange(files.map(file => file.url), 'diagnosisImage');
                                    }}
                                    multiple={true}
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
                                    name='username'
                                    title='用户名'
                                    type='text'
                                    cursor={-1}
                                    placeholder='请输入家长姓名'
                                    value={formData.username}
                                    onChange={value => handleChange(value, 'username')}
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