import React, { Component } from 'react';
import { connect } from 'react-redux';
import Taro, { getCurrentInstance } from '@tarojs/taro';
import { View } from '@tarojs/components';
import { AtProgress, AtButton } from 'taro-ui';
import { Radio } from "@taroify/core";
import { answer, complete, startAssessment } from '../../actions/questionnaires';
import './index.scss';

@connect(({ questionnaires }) => ({
  questionnaires: questionnaires.list,
}))
class Questionnaire extends Component {
  state = {
    questionnaireId: '',
    currentIndex: 0,
    assessmentId: '',
    questions: []
  }

  componentDidMount() {
    const { router } = getCurrentInstance();
    const { questionnaireId } = router.params;
    const { dispatch } = this.props;
    const id = parseInt(questionnaireId);
    this.setState({ questionnaireId: id });
    dispatch(startAssessment(id)).then(({ payload }) => {
      this.setState({
        assessmentId: payload.id,
        questions: payload.questions
      });
    });
  }

  getQuestions = () => {
    const { questions } = this.state;
    return questions || [];
  }

  handleRadioSelect = selectedKey => {
    const { currentIndex, questionnaireId } = this.state;
    const questions = this.getQuestions();
    const question = questions[currentIndex] || {};
    if (question.single) {
      const { dispatch } = this.props;
      dispatch(answer(this.state.assessmentId, question.id, [selectedKey]));
      if (currentIndex === questions.length - 1) {
        Taro.showLoading();
        dispatch(complete(this.state.assessmentId))
          .then(() => Taro.hideLoading())
          .then(() => Taro.redirectTo({ url: '/pages/result/index' }));
      } else {
        setTimeout(() => this.setState({ currentIndex: currentIndex + 1 }), 200);
      }
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
    const { currentIndex } = this.state;
    const questions = this.getQuestions();
    const question = questions[currentIndex] || {};
    const { title, options, single } = question;
    const selectedIds = question.selectedIds || [];
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
                      color: '#333',
                      marginLeft: '20rpx',
                    }}>{`${currentIndex + 1}/${questions.length}`}</View>
                  </View>
                </View>
                <View className='title'>
                  {`${currentIndex + 1}、 ${title}`}
                </View>
                <View className='question'>
                  <Radio.Group value={selectedIds[0]} onChange={this.handleRadioSelect}>
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
