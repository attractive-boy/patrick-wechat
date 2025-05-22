import React, { useEffect, useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { getCurrentInstance } from '@tarojs/runtime';
import './index.scss';
import echarts from '../../assets/js/echarts.min.js';
import Echarts from 'taro-react-echarts';
import { Navbar } from "@taroify/core"

export default function Result() {
  const resultData = Taro.getStorageSync('resultData');
  const userInfo = Taro.getStorageSync('userInfo');

  const calculateAge = (birthday) => {
    if (!birthday) return '未知';
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleBackToHome = () => {
    Taro.reLaunch({ url: '/pages/index/index' });
  };

  return (
    <View style={{
      backgroundColor: '#F6F8FB',
    }}>
      <View className='login-page' style={{ background: `url(${Taro.imageUrl}/login_head_background.png) no-repeat`, backgroundSize: 'contain', backgroundPosition: 'top center', width: '100vw' }}>
        <Navbar nativeSafeTop={true} placeholder={true} safeArea="top" fixed={true}>
          <Navbar.NavLeft onClick={handleBackToHome}>返回</Navbar.NavLeft>
          <Navbar.Title>测评报告</Navbar.Title>
        </Navbar>
        
        <View style={{
          width: '100%',
          padding: '20rpx 20rpx',
          boxSizing: 'border-box',
        }}>
          {/* 报告封面 */}
          <View style={{
            backgroundColor: '#fff',
            borderRadius: '28rpx',
            padding: '60rpx 20rpx',
            marginBottom: '20rpx',
            textAlign: 'center'
          }}>
            <Text style={{
              fontSize: '40rpx',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '50rpx',
              display: 'block'
            }}>星跃孤独症儿童干预进阶测评报告</Text>
            <Image 
              src={`${Taro.imageUrl}/report_icon.png`}
              style={{
                width: '300rpx',
                height: '300rpx',
                marginBottom: '50rpx'
              }}
            />
            <View style={{
              margin: '0 auto',
              width: 'fit-content'
            }}>
              <View style={{
                fontSize: '32rpx',
                color: '#666',
                marginBottom: '30rpx',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Text style={{ width: '150rpx' }}>姓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;名</Text>
                <Text style={{ width: '40rpx', textAlign: 'center' }}>:</Text>
                <Text>{userInfo?.name || '--'}</Text>
              </View>
              <View style={{
                fontSize: '32rpx',
                color: '#666',
                marginBottom: '30rpx',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Text style={{ width: '150rpx' }}>性&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;别</Text>
                <Text style={{ width: '40rpx', textAlign: 'center' }}>:</Text>
                <Text>{userInfo?.sex || '--'}</Text>
              </View>
              <View style={{
                fontSize: '32rpx',
                color: '#666',
                marginBottom: '30rpx',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Text style={{ width: '150rpx' }}>年&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;龄</Text>
                <Text style={{ width: '40rpx', textAlign: 'center' }}>:</Text>
                <Text>{calculateAge(userInfo?.birthday)}岁</Text>
              </View>
              <View style={{
                fontSize: '32rpx',
                color: '#666',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Text style={{ width: '150rpx' }}>测评日期</Text>
                <Text style={{ width: '40rpx', textAlign: 'center' }}>:</Text>
                <Text>{resultData?.lastTestDate || '--'}</Text>
              </View>
            </View>
          </View>

          {/* 报告导语 */}
          <View style={{
            backgroundColor: '#fff',
            borderRadius: '28rpx',
            marginBottom: '20rpx'
          }}>
            <View style={{
              backgroundColor: '#09A3FF',
              borderRadius: '28rpx 28rpx 0 0',
              padding: '20rpx 20rpx',
              fontSize: '30rpx',
              color: '#fff',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>报告导语</View>
            
            <View style={{
              padding: '40rpx 30rpx'
            }}>
              <View style={{
                fontSize: '32rpx',
                color: '#333',
                lineHeight: '1.8',
                marginBottom: '30rpx'
              }}>
                <View style={{ fontWeight: 'bold', marginBottom: '20rpx' }}>一、测评简介</View>
                <View style={{ marginBottom: '20rpx' }}>
                  本报告有助于家长、教师、研究者了解儿童的核心症状、情绪、学习、自理和运动能力，为制定个别化进阶干预计划和评估干预效果提供依据。
                </View>
                <View>
                  本测评系统主要面向3-12岁孤独症学生，请最熟悉孩子的养育者填写。测评结果的准确性和可靠性取决于参与者是否在无打扰情况下，遵循要求认真如实作答及完成所有作答。
                </View>
              </View>

              <View style={{
                fontSize: '32rpx',
                color: '#333',
                lineHeight: '1.8'
              }}>
                <View style={{ fontWeight: 'bold', marginBottom: '20rpx' }}>二、测评目的与应用</View>
                <View style={{ marginBottom: '20rpx' }}>
                  （一）了解症状：快速发现儿童孤独症症状严重程度和短板。根据总报告和分告量表均分宏观了解儿童优势和不足，发挥优势、补偿缺陷。
                </View>
                <View style={{ marginBottom: '20rpx' }}>
                  （二）发现潜力：发现儿童优势、最近发展区，抓住干预契机。根据分报告量表等级了解儿童的萌芽等级和达到等级，制定个性化的进阶干预计划。
                </View>
                <View style={{ marginBottom: '20rpx' }}>
                  （三）补偿缺陷：根据通用性的干预原则、针对性建议，改善孤独症状，提高基本能力。
                </View>
                <View style={{ marginBottom: '20rpx' }}>
                  （四）评估变化：通过干预前后均分比较评价儿童的量变；根据干预前后等级比较评价儿童的质变。
                </View>
                <View>
                  （五）注意事项：
                  <View style={{ marginTop: '10rpx', paddingLeft: '20rpx' }}>
                    （1）人的心理具有复杂性，在实际使用中，应综合日常的细致观察，在结合儿童其他方面的表现（如兴趣、个性特点、需要）等基础上，充分发挥测评的导向、激励和评价功能。
                  </View>
                  <View style={{ marginTop: '10rpx', paddingLeft: '20rpx' }}>
                    （2）报告内容属于个人隐私，原则上只供测试者及其授权的相关人员阅读和使用。
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* 均分图 */}
          <View style={{
            backgroundColor: '#fff',
            borderRadius: '28rpx',
            marginBottom: '20rpx'
          }}>
            <View style={{
              backgroundColor: '#09A3FF',
              borderRadius: '28rpx 28rpx 0 0',
              padding: '20rpx 20rpx',
              fontSize: '30rpx',
              color: '#fff',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>测评结果</View>
            <View style={{ padding: '40rpx 30rpx' }}>
              <View style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Echarts
                  echarts={echarts}
                  option={{
                    color: ['#09A3FF'],
                    title: {},
                    legend: {},
                    radar: [{
                      indicator: resultData ? resultData.list.map(item => ({
                        text: item.name,
                        max: 2
                      })) : [],
                      center: ['50%', '50%'],
                      radius: 60,
                      axisName: {
                        color: '#fff',
                        backgroundColor: '#666',
                        borderRadius: 3,
                        padding: [2, 3],
                        fontSize: 10
                      }
                    }],
                    series: [{
                      type: 'radar',
                      radarIndex: 0,
                      data: [{
                        value: resultData != null ? resultData.list.map(item => item.value) : [],
                        areaStyle: {
                          color: new echarts.graphic.RadialGradient(0.1, 0.6, 1, [
                            {
                              color: 'rgba(9, 163, 255, 0.50)',
                              offset: 0
                            },
                            {
                              color: 'rgba(9, 163, 255, 1)',
                              offset: 1
                            }
                          ])
                        }
                      }]
                    }]
                  }}
                  style={{ width: '100%', height: '500rpx' }}
                />
              </View>
            </View>
          </View>


          {/* 温馨提示 */}
          <View style={{
            border: '1px dashed #09A3FF',
            borderRadius: '8rpx',
            padding: '20rpx',
            marginBottom: '20rpx',
            backgroundColor: '#F3FEFF'
          }}>
            <View style={{
              fontSize: '34rpx',
              color: '#09A3FF',
              fontWeight: 'bold'
            }}>注：</View>
            <View style={{
              fontSize: '30rpx',
              color: '#666',
              marginTop: '10rpx'
            }}>如果形状比较规则，表示数据在各个维度上相对均衡；如果形状不规则，表示某些维度较为突出或薄弱。突出部分为优势，凹进去部分为劣势。得分越高越好，均分≤1的维度是孩子的薄弱点，需要关注。</View>
          </View>


          <View style={{
            border: '1px dashed #09A3FF',
            borderRadius: '8rpx',
            padding: '20rpx',
            marginTop: '20rpx',
            backgroundColor: '#F3FEFF',
            marginBottom: '20rpx'
          }}>
            <View style={{
              fontSize: '34rpx',
              color: '#09A3FF',
              fontWeight: 'bold'
            }}>温馨提示：</View>
            <View style={{
              fontSize: '30rpx',
              color: '#666',
              marginTop: '10rpx'
            }}>变化的是支持或干预策略，不变的是通用的干预原则。
              </View>
          </View>

          {/* 干预原则 */}
          <View style={{
            backgroundColor: '#fff',
            borderRadius: '28rpx',
            marginBottom: '20rpx'
          }}>
            <View style={{
              backgroundColor: '#09A3FF',
              borderRadius: '28rpx 28rpx 0 0',
              padding: '20rpx 20rpx',
              fontSize: '30rpx',
              color: '#fff',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>干预原则</View>
            {resultData ? <View
              style={{
                padding: '20rpx 20rpx',
              }}>
                <View style={{
                  marginBottom: '20rpx'
                }}>
                  <View style={{
                    fontSize: '28rpx',
                    color: '#666',
                    lineHeight: '1.6'
                  }}>{resultData.textThree}</View>
                </View>
            </View> : null}
          </View>
        </View>
      </View>
    </View>
  );
}

