import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Taro, { usePullDownRefresh, useShareAppMessage } from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import { AtButton, AtListItem, AtActivityIndicator } from 'taro-ui';
import { fetchQuestionnaires } from '../../actions/questionnaires';
import './index.scss';

export default function Index() {
  const dispatch = useDispatch();
  const questionnaires = useSelector(state => state.questionnaires.list);
  const loading = useSelector(state => state.questionnaires.loading);

  const checkToken = async () => {
    const token = Taro.getStorageSync('token');
    if (!token) {
      Taro.redirectTo({ url: '/pages/login/index' });
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
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      Taro.showToast({
        title: error.message || '获取用户信息失败',
        icon: 'none'
      });
      Taro.redirectTo({ url: '/pages/login/index' });
    }
  };

  const fetchData = async () => {
    Taro.showNavigationBarLoading();
    await dispatch(fetchQuestionnaires());
    Taro.hideNavigationBarLoading();
  };

  const fetchDataCallback = useCallback(fetchData, []);

  useEffect(() => {
    checkToken();
    fetchDataCallback();
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

  return (
    <View className='page'>
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
    </View>
  )
}