import Taro from '@tarojs/taro';

export default {
  fetchQuestionnaires: async () => {
    try {
      const response = await Taro.request({
        url: `${Taro.requestUrl}/accessment-forms/list`,
        method: 'GET',
        header: {
          'token': `${Taro.getStorageSync('token')}`
        }
      });

      const { data } = response;
      if (!data.success) {
        throw new Error(data.message || '获取问卷列表失败');
      }

      // 将接口返回的数据结构转换为前端需要的格式
      return data.data.map(item => ({
        id: item.id,
        title: item.name || '',
        description: item.description || '',
        duration: item.duration || 0,
        imageUrl: item.imgBase64Str || '',
        questions: item.questions || []
      }));
    } catch (error) {
      console.error('获取问卷列表失败:', error);
      throw error;
    }
  },

  completeQuestionnaire: async (questionnaireId) => {
    // 保持原有的问卷完成逻辑
    return {
      score: 85,
      level: 'B',
      evaluation: '您的孩子表现良好',
      suggestion: '建议继续保持',
    };
  }
}
