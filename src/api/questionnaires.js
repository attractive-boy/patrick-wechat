import Taro from '@tarojs/taro';

export default {
  startAssessment: async (id) => {
    try {
      const response = await Taro.request({
        url: `${Taro.requestUrl}/accessment/start`,
        method: 'GET',
        header: {
          'token': `${Taro.getStorageSync('token')}`
        },
        data: { id }
      });

      const { data } = response;
      if (!data.success) {
        throw new Error(data.message || '开始答题失败');
      }

      return {
        id: data.data.assessmentId,
        formId: data.data.formId,
        status: data.data.status,
        questions: data.data.questions.map(q => ({
          id: q.id,
          title: q.questionTest,
          options: Object.entries(JSON.parse(q.options)).map(([key, value], index) => ({
            id: index + 1,
            key: key,
            value: value
          })),
          selectedIds: q.selectOption ? [parseInt(q.selectOption)] : [],
          single: true
        }))
      };
    } catch (error) {
      console.error('开始答题失败:', error);
      throw error;
    }
  },

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

  submitAnswer: async (assessmentId, questionId, answer) => {
    try {
      const response = await Taro.request({
        url: `${Taro.requestUrl}/accessment/submit-answer`,
        method: 'POST',
        header: {
          'token': `${Taro.getStorageSync('token')}`
        },
        data: {
          assessmentId,
          questionId,
          answer
        }
      });

      const { data } = response;
      if (!data.success) {
        throw new Error(data.message || '提交答案失败');
      }

      return data.data;
    } catch (error) {
      console.error('提交答案失败:', error);
      throw error;
    }
  },

  completeQuestionnaire: async (assessmentId) => {
    try {
      const response = await Taro.request({
        url: `${Taro.requestUrl}/accessment/complete`,
        method: 'POST',
        header: {
          'token': `${Taro.getStorageSync('token')}`
        },
        data: { assessmentId }
      });

      const { data } = response;
      if (!data.success) {
        throw new Error(data.message || '完成问卷失败');
      }

      return data.data;
    } catch (error) {
      console.error('完成问卷失败:', error);
      throw error;
    }
  }
}
