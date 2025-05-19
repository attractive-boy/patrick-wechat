import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Taro, { usePullDownRefresh, useShareAppMessage } from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import { AtButton, AtListItem, AtActivityIndicator, AtCurtain } from 'taro-ui';
import { fetchQuestionnaires } from '../../actions/questionnaires';
import './index.scss';
import { Navbar,ActionSheet } from "@taroify/core"
import { SettingOutlined } from "@taroify/icons"
import { BASE_API_URL } from '../../constants/common'

export default function Index() {
  const [isOpened, setIsOpened] = useState(true);
  const dispatch = useDispatch();
  const questionnaires = useSelector(state => state.questionnaires.list);
  const loading = useSelector(state => state.questionnaires.loading);
  const [showInfoPutBtn, setShowInfoPutBtn] = useState(true);

  const handleClose = () => {
    setIsOpened(false);
  };

  const checkToken = async () => {
    const token = Taro.getStorageSync('token');
    if (!token) {
      setShowInfoPutBtn(false);
      fetchDataCallback();
      return;
    }

    try {
      const response = await Taro.request({
        url: `${Taro.requestUrl}/user/query-user-info`,
        method: 'GET',
        header: {
          'token': token
        }
      });

      const { data } = response;
      if (!data.success) {
        throw new Error(data.message || '获取用户信息失败');
      }

      const userInfo = data.data;
      Taro.setStorageSync('userInfo', userInfo);

      if(userInfo.ageDiagnosis && userInfo.birthday && userInfo.diagnosis && userInfo.diagnosisResult && userInfo.sex){
        setShowInfoPutBtn(false);
      }else{
        setShowInfoPutBtn(true);
      }

      // 检查用户状态
      if (userInfo.processStatus === '1' || !userInfo.profilePath) {
        Taro.redirectTo({ url: '/pages/upload/index' });
        return;
      } else if (userInfo.processStatus === '3') {
        Taro.showToast({
          title: '资料审核不通过，请重新提交',
          icon: 'none',
          duration: 2000
        });
        setTimeout(() => {
          Taro.redirectTo({ url: '/pages/upload/index' });
        }, 2000);
        return;
      } else if (userInfo.processStatus === '4') {
        Taro.showToast({
          title: '账号已被封禁',
          icon: 'none',
          duration: 2000
        });
        setTimeout(() => {
          Taro.redirectTo({ url: '/pages/login/index' });
        }, 2000);
        return;
      }else if (userInfo.processStatus === '2') {
        Taro.showToast({
          title: '资料审核中',
          icon: 'none',
          duration: 2000
        });
        setTimeout(() => {
          Taro.redirectTo({ url: '/pages/upload/index' });
        }, 2000);
        return;
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      Taro.showToast({
        title: error.message || '获取用户信息失败',
        icon: 'none'
      });
      Taro.redirectTo({ url: '/pages/login/index' });
    }
    fetchDataCallback();
  };

  const fetchData = async () => {
    Taro.showNavigationBarLoading();
    await dispatch(fetchQuestionnaires());
    Taro.hideNavigationBarLoading();
  };

  const fetchDataCallback = useCallback(fetchData, []);

  useEffect(() => {
    checkToken();
    
  }, [fetchDataCallback]);

  usePullDownRefresh(async () => {
    await fetchData();
    Taro.stopPullDownRefresh();
  });

  useShareAppMessage(() => ({
    title: '测评列表',
    path: '/pages/index/index',
  }));

  const handleClick = item => Taro.navigateTo({ url: `/pages/questionnaire/index?questionnaireId=${item.id}` });

  const questionnaireList = questionnaires.map(item => (
    <View key={item.id} className='questionnaire-card'>
      <View className='card-content'>
        <View className='card-image'>
          <Image src={item.imageUrl || 'https://test.djjp.cn/default-questionnaire.png'} />
        </View>
        <View className='card-info'>
          <View className='card-title'>{item.title}</View>
          <View className='card-desc'>{item.description}</View>
        </View>
      </View>
      <View className='card-meta'>
        <View className='card-meta__item time-notice-container'>
          <Text className='time-notice'>请根据孩子近<Text className='highlight-month'>1个月</Text>的情况选择</Text>
        </View>
        <View className='card-meta__item button-container'>
          <AtButton type='primary' className='start-btn' onClick={() => handleClick(item)}>开始测评</AtButton>
        </View>
      </View>
    </View>
  ));
  const [open, setOpen] = useState(false)
  const handleOption = () => {
    setOpen(true)
  };

  const selectActionSheet = (action) => {
    if (!action) {
      setOpen(false);
      return;
    }
    
    if (action.value === 'totalreport') {
      // 获取token
      const token = Taro.getStorageSync('token');
      if (!token) {
        Taro.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      
      // 显示加载提示
      Taro.showLoading({
        title: '加载中...',
        mask: true
      });
      
      // 发起请求获取用户总报告数据
      Taro.request({
        url: `${BASE_API_URL}/accessment/query-user-radar-map-data`,
        method: 'GET',
        header: {
          'token': token
        },
        success: (res) => {
          if (res.data.success) {
            // 将数据存储到本地
            Taro.setStorageSync('resultData', res.data.data);
            // 跳转到总报告页面
            Taro.navigateTo({ url: '/pages/totalreport/index' });
          } else {
            Taro.showToast({
              title: res.data.message || '获取报告失败',
              icon: 'none',
              duration: 2000
            });
          }
        },
        fail: (err) => {
          console.error('获取总报告失败:', err);
          Taro.showToast({
            title: '网络异常，请稍后再试',
            icon: 'none',
            duration: 2000
          });
        },
        complete: () => {
          Taro.hideLoading();
        }
      });
    } else if (action.value === 'logout') {
      // 清除用户登录信息
      Taro.clearStorageSync();
      Taro.showToast({
        title: '已退出登录',
        icon: 'success',
        duration: 1500
      });
      // 跳转到登录页面
      setTimeout(() => {
        Taro.redirectTo({ url: '/pages/login/index' });
      }, 1500);
    }
    setOpen(false);
  };

  const handleTotalReport = () => {
    // 获取token
    const token = Taro.getStorageSync('token');
    if (!token) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 显示加载提示
    Taro.showLoading({
      title: '加载中...',
      mask: true
    });
    
    // 发起请求获取用户总报告数据
    Taro.request({
      url: `${BASE_API_URL}/accessment/query-user-radar-map-data`,
      method: 'GET',
      header: {
        'token': token
      },
      success: (res) => {
        if (res.data.success) {
          // 将数据存储到本地
          Taro.setStorageSync('resultData', res.data.data);
          // 跳转到总报告页面
          Taro.navigateTo({ url: '/pages/totalreport/index' });
        } else {
          Taro.showToast({
            title: res.data.message || '获取报告失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        console.error('获取总报告失败:', err);
        Taro.showToast({
          title: '网络异常，请稍后再试',
          icon: 'none',
          duration: 2000
        });
      },
      complete: () => {
        Taro.hideLoading();
      }
    });
  };

  return (
    <View className='page'>
      <Navbar nativeSafeTop={true} placeholder={true} safeArea="top" fixed={true}>
        
        <Navbar.Title>测评列表</Navbar.Title>
        <Navbar.NavLeft icon={<SettingOutlined />} onClick={handleOption} />
      </Navbar>
      <View className='doc-body bg'>
        <View className='panel'>
          {/* <View className='panel__title'>测评列表</View> */}
          <View className='panel__content'>
            <View className='questionnaire-list'>
              {loading ? (
                <AtActivityIndicator mode='center' />
              ) : (
                questionnaireList
              )}
            </View>
          </View>
        </View>
      </View>
      <AtCurtain
        isOpened={isOpened}
        onClose={handleClose}
        className={ showInfoPutBtn || !Taro.getStorageSync('token') ? 'myAtCurtain' : null}
      >
        <>
          <View
            style={{
              backgroundImage: 'url(https://test.djjp.cn/index_xin.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              margin: '0 auto',
              width: '90vw',
              height: '140vw',
              lineHeight: '1.6',
              textAlign: 'justify',
              fontSize: '30rpx',
              color: 'rgba(34, 34, 34, 0.8)',
              padding: '7vw',
              paddingTop: '10vw',
              position: 'relative',
            }}
          >
            <View style={{fontSize:'large',fontWeight:'bolder',width:'calc(90vw - 14vw)',textAlign:'center'}}> 家长/教师答前须知 </View>

            <View style={{ marginBottom: '5rpx' }}>亲爱的家长/教师：</View>
            
            <View style={{ textIndent: '2em' }}>
              非常感谢您参加孤独症谱系儿童症状和基本能力的调查！该调查可以帮助您了解孩子的目前症状或干预改善的进阶情况。您如实、认真地回答有助于全面了解孩子社交力、受限与重复行为、学习力、情绪力、生活自理力和运动力。
            </View>
            
            <View style={{ textIndent: '2em', marginTop: '10rpx' }}>
              该测评可以反映孩子的优势和不足，测评后的干预建议可为您后续针对性干预提供重点参考。测评结果的准确性和可靠性取决于<Text style={{ fontWeight: 'bold' }}>您（最熟悉孩子的家长/教师填写）</Text>是否遵循要求认真如实完成所有作答。
            </View>

            
          </View>
          <View className='button-container' style={{
            margin:"15vw",
            marginTop:"30rpx",
          }}>
            {showInfoPutBtn ? (
              <AtButton type='primary' className='start-btn' onClick={handleInfoPut}>维护基本信息</AtButton>
            ) : !Taro.getStorageSync('token') ? (
              <AtButton type='primary' className='start-btn' onClick={() => Taro.redirectTo({ url: '/pages/login/index' })}>登录系统</AtButton>
            ) : null}
          </View>
        </>
      </AtCurtain> 

      <ActionSheet
          actions={[
            { name: "总报告", value: "totalreport" },
            { name: "退出登录", value: "logout" },
          ]}
          cancelText="取消"
          open={open}
          onSelect={selectActionSheet}
          onCancel={() => setOpen(false)}
          onClose={() => setOpen(false)}
        />
      <View className='total-report-btn'>
        <AtButton type='primary' onClick={handleTotalReport}>查看总报告</AtButton>
      </View>
    </View>
  )
}

const handleClose = () => {
  setIsOpened(false);
};

const handleInfoPut = () => {
  Taro.navigateTo({ url: '/pages/baseInfo/index' });
};