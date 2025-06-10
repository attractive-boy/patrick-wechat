import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
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
          
          <View style={{
            background: 'linear-gradient(90deg, #4DB8FF 0%, #3399FF 100%)',
            borderRadius: '28rpx',
            padding: '30rpx 20rpx',
            marginTop: '20rpx',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <View style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '20rpx'
            }}>
              <Text style={{ color: '#fff', fontSize: '32rpx' }}>{userInfo?.name || '用户'}</Text>
              <Text style={{ color: '#fff', fontSize: '32rpx' }}>{userInfo?.sex || '未知'}</Text>
            </View>
            <Text style={{ color: '#fff', fontSize: '32rpx' }}>{calculateAge(userInfo?.birthday)}岁</Text>
          </View>

          {resultData && resultData.showSymptom ? <View style={{
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
            }}>症状</View>
                      { resultData.concernReverseInterventionSuggestion?.toString().length > 0 ? <View style={{
              backgroundColor: '#fff',
              borderRadius: '28rpx',
              marginTop: '20rpx'
            }}>
            
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
            </View> : null}
          </View> : null}


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
            }}>均分可视化</View>
            <View style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent', }}>
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
                }}
                style={{ width: '100%', height: '500rpx' }}
              />
            </View>
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
            }}>注：</View>
            <View style={{
              fontSize: '30rpx',
              color: '#666',
              marginTop: '10rpx'
            }}>如果形状比较规则，表示数据在各个维度上相对均衡；如果形状不规则，表示某些维度较为突出或薄弱。突出部分为优势，凹进去部分为劣势。得分越高越好，均分≤1的维度是孩子的薄弱点，需要关注。
</View>
          </View>
          {resultData.interventionSuggestion.filter(item => item.value).length > 0 ? <View style={{
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
            }}>弱项干预建议</View>
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
          </View> : null}
          {resultData.levelData?.filter(item => item.maxLevel > 0).length > 0 ? 
          <>
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
            }}>发展等级可视化</View>
            <View style={{ width: '100%', height: '800rpx',  display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Echarts
                echarts={echarts}
                option={{
                  tooltip: {
                    show: false
                  },
                  silent: true,
                  legend: {
                    orient: 'horizontal',
                    itemWidth: 15,
                    itemGap: 10,
                    selectedMode: false,
                    textStyle: {
                      fontSize: 10
                    },
                    data: [
                      {
                        name: '达到最高',
                        icon: 'rect',
                        itemStyle: {
                          color: '#0066CC'
                        }
                      },
                      {
                        name: '达到等级',
                        icon: 'rect',
                        itemStyle: {
                          color: '#09A3FF'
                        }
                      },
                      {
                        name: '萌芽等级',
                        icon: 'rect',
                        itemStyle: {
                          color: '#9EE7FF'
                        }
                      },
                      {
                        name: '未达等级',
                        icon: 'rect',
                        itemStyle: {
                          borderColor: '#CCCCCC',
                          borderWidth: 2,
                          borderType: 'dashed',
                          color: 'transparent'
                        }
                      }
                    ]
                  },
                  grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                  },
                  xAxis: [{
                    type: 'category',
                    data: resultData ? resultData.levelData
                      .filter(item => !['不能社交', '情绪障碍', '学习障碍'].includes(item.name))
                      .map(item => item.name) : [],
                    axisLabel: {
                      //  让x轴文字方向为竖向
                      interval: 0,
                      formatter: function(value) {
                        return value.split('').join('\n')
                      },
                      padding: [0, 0, 10, 0]
                    },
                    name: '(维度)',
                    nameLocation: 'end',
                    nameTextStyle: {
                      padding: [30, 0, 0, 0]
                    }
                  }],
                  yAxis: [{
                    type: 'value',
                    name: '(等级)',
                    nameLocation: 'end',
                    nameTextStyle: {
                      padding: [0, 0, 10, 0]
                    },
                    axisLine: {
                      show: true
                    },
                    axisTick: {
                      show: true,
                      alignWithLabel: true
                    },
                    splitLine: {
                      show: true,
                      lineStyle: {
                        type: 'solid',
                        color: '#E5E5E5'
                      }
                    },
                    axisLabel: {
                      formatter: function(value) {
                        return Math.floor(value);
                      }
                    }
                  }],
                  series: [
                    {
                      name: '达到最高',
                      type: 'bar',
                      stack: 'Ad',
                      barMaxWidth: '40%',
                      emphasis: {
                        focus: 'series'
                      },
                      itemStyle: {
                        color: '#0066CC'
                      },
                      data: resultData ? resultData.levelData
                        .filter(item => !['不能社交', '情绪障碍', '学习障碍'].includes(item.name))
                        .map(item => item.acheiveLevel === item.maxLevel ? item.acheiveLevel : 0) : []
                    },
                    {
                      name: '达到等级',
                      type: 'bar',
                      stack: 'Ad',
                      barMaxWidth: '40%',
                      emphasis: {
                        focus: 'series'
                      },
                      itemStyle: {
                        color: '#09A3FF'
                      },
                      data: resultData ? resultData.levelData
                        .filter(item => !['不能社交', '情绪障碍', '学习障碍'].includes(item.name))
                        .map(item => item.acheiveLevel === item.maxLevel ? 0 : item.acheiveLevel) : []
                    },
                    {
                      name: '萌芽等级',
                      type: 'bar',
                      stack: 'Ad',
                      barMaxWidth: '40%',
                      color: '#9EE7FF',
                      emphasis: {
                        focus: 'series'
                      },
                      data: resultData ? resultData.levelData
                        .filter(item => !['不能社交', '情绪障碍', '学习障碍'].includes(item.name))
                        .map(item => {
                          const potentialLevel = item.potentialLevel.split(',');
                          const max = Math.max(...potentialLevel);
                          const acheiveLevel = item.acheiveLevel;
                          if (acheiveLevel < max) {
                            return max - acheiveLevel;
                          } else {
                            return 0;
                          }
                        }) : []
                    },
                    {
                      name: '未达等级',
                      type: 'bar',
                      stack: 'Ad',
                      barMaxWidth: '40%',
                      itemStyle: {
                        borderColor: '#CCCCCC',
                        borderWidth: 2,
                        borderType: 'dashed',
                        color: 'transparent',
                        borderTopWidth: 0
                      },
                      legendIcon: 'rect',
                      legendItemStyle: {
                        borderColor: '#CCCCCC',
                        borderWidth: 2,
                        borderType: 'dashed',
                        color: 'transparent'
                      },
                      data: resultData ? resultData.levelData
                        .filter(item => !['不能社交', '情绪障碍', '学习障碍'].includes(item.name))
                        .map(item => {
                          const potentialLevel = item.potentialLevel.split(',');
                          const max = Math.max(...potentialLevel);
                          const acheiveLevel = item.acheiveLevel;
                          const totalLevel = Math.max(acheiveLevel, max);
                          const value = item.maxLevel - totalLevel;
                          return value > 0 ? value : null;
                        }) : []
                    }
                  ]
                }}
                style={{ width: '100%', height: '800rpx' }}
              />
            </View> 
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
              }}>注：</View>
              <View style={{
                fontSize: '30rpx',
                color: '#666',
                marginTop: '10rpx'
              }}>深蓝色为达到最高等级，表明孩子目前已达到最高水平。浅蓝色为达到等级，表明孩子目前达到的等级。淡蓝色为萌芽等级，指能力萌芽。萌芽等级是干预的契机，应作为目前重点干预内容，将萌芽变成经常性行为。虚框为未达等级，是未来努力方向。
  </View>
            </View>
            </> : null}
            {resultData.interventionSuggestionLevel?.filter(item => item.value).length > 0 ? <View style={{
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
              }}>努力目标建议</View>
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
            </View> : null}
            
          </View>
        </View>
      </View>

  );
}

