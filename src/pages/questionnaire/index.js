import React, { Component } from 'react';
import { connect } from 'react-redux';
import Taro, { getCurrentInstance } from '@tarojs/taro';
import { View } from '@tarojs/components';
import { AtProgress, AtButton } from 'taro-ui';
import { Radio } from "@taroify/core";
import { answer, complete, startAssessment } from '../../actions/questionnaires';
import questionnairesApi from '../../api/questionnaires';
import './index.scss';

@connect(({ questionnaires }) => ({
  questionnaires: questionnaires.list,
}))
class Questionnaire extends Component {
  state = {
    questionnaireId: '',
    currentIndex: 0,
    assessmentId: '',
    questions: [],
    selectedIds: []
  }

  componentDidMount() {
    const { router } = getCurrentInstance();
    const { questionnaireId } = router.params;
    const { dispatch } = this.props;
    const id = parseInt(questionnaireId);
    this.setState({ questionnaireId: id });
    dispatch(startAssessment(id)).then(({ payload }) => {
      // 初始化selectedIds，将字母选项转换为对应的数字
      const selectedIds = payload.questions.map(question => {
        if (question.selectedIds && question.selectedIds.length > 0) {
          const letter = question.selectedIds[0].toString();
          console.log("letter=>", letter);
          return parseInt(letter.charCodeAt(0) - 64); // A->1, B->2, C->3
        }
        return '';
      });
      console.log("selectedIds=>", selectedIds);
      const selctindex= selectedIds.findIndex(id => id == '');
      console.log("seelctindex=>", selctindex);
      this.setState({
        assessmentId: payload.id,
        questions: payload.questions,
        currentIndex: selctindex>=0? selctindex:0,
        selectedIds
      });
    });
  }

  getQuestions = () => {
    const { questions } = this.state;
    return questions || [];
  }

  handleRadioSelect = selectedKey => {
    console.log("selectedKey=>", selectedKey);
    const { currentIndex, questionnaireId, selectedIds } = this.state;
    const convertToLetter = (num) => String.fromCharCode(64 + parseInt(num)); // 1->A, 2->B, 3->C
    const letterKey = convertToLetter(selectedKey);
    //设置选中的答案
    selectedIds[currentIndex] = selectedKey;
    this.setState({ selectedIds });
    const questions = this.getQuestions();
    const question = questions[currentIndex] || {};
    if (question.single) {
      const { dispatch } = this.props;
      questionnairesApi.submitAnswer(this.state.assessmentId, question.id, letterKey).then(() => {
        if (currentIndex === questions.length - 1) {
          Taro.showLoading();
          dispatch(complete(this.state.assessmentId))
            .then(async () => {
              Taro.hideLoading();
              const fetchResultData = async () => {
                try {
                  const { router } = getCurrentInstance();
                  const token = Taro.getStorageSync('token');
                  const response = await Taro.request({
                    url: `${Taro.requestUrl}/accessment/query-assessment-results?assessmentId=${this.state.assessmentId}`,
                    method: 'GET',
                    header: { 'token': token }
                  });
            
                  if (response.data.success) {
                    Taro.setStorageSync('resultData', response.data.data);
                    console.log("response.data.data=>", response.data.data);

                    // 只传递assessmentId到结果页面
                    Taro.redirectTo({ url: `/pages/result/index` });

                    
                  } else {
                    Taro.showToast({
                      title: response.data.message || '获取结果失败',
                      icon: 'none'
                    });
                  }
                } catch (error) {
                  console.error('获取结果失败:', error);
                  Taro.showToast({
                    title: '获取结果失败',
                    icon: 'none'
                  });
                }
              };
              fetchResultData();    
          });
        } else {
          setTimeout(() => this.setState({ 
            currentIndex: currentIndex + 1,
          }), 200);
        }
      });
    }
  }

  handlePrev = () => {
    const { currentIndex } = this.state;
    if (currentIndex === 0) {
      return;
    }
    this.setState({
      currentIndex: currentIndex - 1,
    });
  }

  handleNext = () => {
    const { currentIndex, questions } = this.state;
    if (currentIndex === questions.length - 1) {
      return;
    }
    this.setState({
      currentIndex: currentIndex + 1,
    });
  }

  render() {
    const { currentIndex, selectedIds } = this.state;
    const questions = this.getQuestions();
    const question = questions[currentIndex] || {};
    const { title, options, single } = question;
    const radioOptions = (options || []).map(item => ({
      ...item,
      key: item.id,
      index: item.key,
    }));
    const percent = Math.round(currentIndex / questions.length * 100);
    return (
      <View className='page'>
        <View className='doc-body bg' style={{
          background: `url(${Taro.imageUrl}/login_head_background.png) no-repeat`, backgroundSize: 'contain', backgroundPosition: 'top center', width: '100%'
        }}>

          <View className='panel'>
            <View className='panel__content'>
              <View className='card'>
                <View className='panel'>
                  <View className='panel__content' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ width: '80vw' }}>
                      <AtProgress percent={percent} status='progress' isHidePercent={true}  />
                    </View>

                    <View className='progress-text' style={{
                      fontSize: '24rpx',
                      color: '#0078D4',
                      marginLeft: '20rpx',
                      
                    }}>{`${currentIndex + 1}`}<View style={{color:'#333',display:'inline'}}>{`/${questions.length}`}</View></View>
                  </View>
                </View>
                <View className='title'>
                  {`${currentIndex + 1}、 ${title}`}
                </View>
                <View className='question'>
                  <Radio.Group value={selectedIds[currentIndex]} onChange={this.handleRadioSelect}>
                    {radioOptions.map((item) => (
                      <Radio key={item.key} name={item.key}>{item.value}</Radio>
                    ))}
                  </Radio.Group>
                </View>
              </View>
            </View>
          </View>
          <View className='panel'>
            <View className='panel__content button'>
              {
                currentIndex > 0 && (
                  <AtButton className={'halflinebtn'} type='primary' onClick={this.handlePrev}>上一题</AtButton>
                )
              }
              {
                (currentIndex < questions.length) && (
                  <AtButton type='primary' className={ currentIndex == 0 ? 'onelinebtn': 'halflinebtn' } onClick={this.handleNext}>{currentIndex ==  questions.length - 1 ? '提交' :'下一题'}</AtButton>
                )
              }
            </View>
          </View>
        </View>
      </View>
    )
  }
}

export default Questionnaire
