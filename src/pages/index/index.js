import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Taro, { usePullDownRefresh, useShareAppMessage } from '@tarojs/taro';
import { View } from '@tarojs/components';
import { AtList, AtListItem, AtActivityIndicator } from 'taro-ui';
import { fetchQuestionnaires } from '../../actions/questionnaires';
import './index.scss';

export default function Index() {
  const dispatch = useDispatch();
  const questionnaires = useSelector(state => state.questionnaires.list);
  const loading = useSelector(state => state.questionnaires.loading);

  const checkToken = () => {
    const token = Taro.getStorageSync('token');
    if (!token) {
      Taro.redirectTo({ url: '/pages/login/index' });
    }

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
    title: '问卷宝典',
    path: '/pages/index/index',
  }));

  const handleClick = item => Taro.navigateTo({ url: `/pages/questionnaire/index?questionnaireId=${item.id}` });

  const questionnaireList = questionnaires.map(item => (
    <AtListItem
      key={item.id}
      title={item.title}
      extraText={`${item.duration} 分钟`}
      arrow='right'
      onClick={() => handleClick(item)}
    />
  ));

  return (
    <View className='page'>
      <View className='doc-body bg'>
        <View className='panel'>
          <View className=''>问卷列表</View>
          <View className='panel__content no-padding'>
            <View className='example-item list'>
              {loading ? (
                <AtActivityIndicator mode='center' />
              ) : (
                <AtList>
                  {questionnaireList}
                </AtList>
              )
              }
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}