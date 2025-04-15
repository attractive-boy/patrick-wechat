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
          <View style={{
            fontSize: '28rpx',
            color: '#222'
          }}>您的测评结果如下：</View>
          <View style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Echarts
              echarts={echarts}
              option={{
                color: ['#09A3FF'],
                title: {},
                legend: {},
                radar: [{
                  indicator: resultData ? resultData.radarMapData.map(item => ({
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
                    value: resultData != null ? resultData.radarMapData.map(item => item.value) : [],
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
              }
              }
              style={{ width: '100%', height: '500rpx' }}
            />
          </View>
          <View style={{
            border: '1px dashed #09A3FF',
            borderRadius: '8rpx',
            padding: '20rpx',
            marginTop: '20rpx',
            backgroundColor: '#F3FEFF'
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
              建议您在阅读分量表报告前先阅读以下原则。</View>
          </View>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: '28rpx',
            marginTop: '20rpx'
          }}>
            <View style={{
              backgroundColor: '#09A3FF',
              borderRadius: '28rpx 28rpx 0 0',
              padding: '20rpx 20rpx',
              fontSize: '30rpx',
              color: '#fff',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>干预建议</View>
            {resultData ? <View
              style={{
                padding: '20rpx 20rpx',
              }}>
              {resultData.interventionSuggestion.filter(item => item.value).map((item, index) => (
                <View key={index} style={{
                  marginBottom: '20rpx'
                }}>
                  <View style={{
                    fontSize: '32rpx',
                    color: 'black',
                    fontWeight: 'bold',
                    marginBottom: '10rpx'
                  }}>({index + 1}){item.name}</View>
                  <View style={{
                    fontSize: '28rpx',
                    color: '#666',
                    lineHeight: '1.6'
                  }}>{item.value}</View>
                </View>
              ))}
            </View> : null}
          </View>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: '28rpx',
            marginTop: '20rpx'
          }}>
            <View style={{
              backgroundColor: '#23B262',
              borderRadius: '28rpx 28rpx 0 0',
              padding: '20rpx 20rpx',
              fontSize: '30rpx',
              color: '#fff',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>发展等级可视化和测评报告</View>
            <View style={{ width: '100%', height: '800rpx',  display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Echarts
                echarts={echarts}
                option={{
                  tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                      type: 'shadow'
                    }
                  },
                  legend: {},
                  grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                  },
                  xAxis: [
                    {
                      type: 'category',
                      data: resultData ? resultData.levelData.map(item => item.name) : [],
                      axisLabel: {
                        rotate: 90,
                        padding: [0, 0, 10, 0]
                      }
                    }
                  ],
                  yAxis: [
                    {
                      type: 'value'
                    }
                  ],
                  series: [
                    {
                      name: '达到等级',
                      type: 'bar',
                      stack: 'Ad',
                      emphasis: {
                        focus: 'series'
                      },
                      // 颜色#09A3FF 
                      color: '#09A3FF',
                      data: resultData ? resultData.levelData.map(item => item.acheiveLevel) : []
                    },
                    {
                      name: '萌芽等级',
                      type: 'bar',
                      stack: 'Ad',
                      //颜色 #9EE7FF
                      color: '#9EE7FF',
                      emphasis: {
                        focus: 'series'
                      },
                      data: resultData ? resultData.levelData.map(item => {
                        const potentialLevel = item.potentialLevel.split(',');
                        const max = Math.max(...potentialLevel);
                        const acheiveLevel = item.acheiveLevel;
                        if (acheiveLevel < max) {
                          return max;
                        } else {
                          return 0;
                        }
                      }) : []
                    }
                  ]
                }}
                style={{ width: '100%', height: '800rpx' }}
              />
            </View>
            <View style={{
              backgroundColor: '#fff',
              borderRadius: '28rpx',
              marginTop: '20rpx'
            }}>
              <View style={{
                backgroundColor: '#09A3FF',
                borderRadius: '28rpx 28rpx 0 0',
                padding: '20rpx 20rpx',
                fontSize: '30rpx',
                color: '#fff',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>干预建议</View>
              {resultData ? <View
                style={{
                  padding: '20rpx 20rpx',
                }}>
                {resultData.interventionSuggestionLevel.filter(item => item.value).map((item, index) => (
                  <View key={index} style={{
                    marginBottom: '20rpx'
                  }}>
                    <View style={{
                      fontSize: '32rpx',
                      color: 'black',
                      fontWeight: 'bold',
                      marginBottom: '10rpx'
                    }}>({index + 1}){item.name}</View>
                    <View style={{
                      fontSize: '28rpx',
                      color: '#666',
                      lineHeight: '1.6'
                    }}>{item.value}</View>
                  </View>
                ))}
              </View> : null}
            </View>
            <View style={{
              backgroundColor: '#fff',
              borderRadius: '28rpx',
              marginTop: '20rpx'
            }}>
              <View style={{
                backgroundColor: '#09A3FF',
                borderRadius: '28rpx 28rpx 0 0',
                padding: '20rpx 20rpx',
                fontSize: '30rpx',
                color: '#fff',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>干预建议</View>
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
                    }}>{resultData.concernReverseInterventionSuggestion}</View>
                  </View>

              </View> : null}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

