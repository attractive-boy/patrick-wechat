import React, { Component } from 'react';
import { Provider } from 'react-redux';
import 'taro-ui/dist/style/index.scss';
import configStore from './store';
import './app.scss';
import Taro from'@tarojs/taro';

const store = configStore();

class App extends Component {
  componentDidMount () {
     Taro.imageUrl = "https://test.djjp.cn"
     Taro.requestUrl = "https://hearttestback.djjp.cn"
  }

  componentDidShow () {}

  componentDidHide () {}

  componentDidCatchError () {}

 


  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render () {
    return (
      <Provider store={store}>
        {this.props.children}
      </Provider>
    )
  }
}

export default App;
