require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';

//获取图片相关数据
var imgDates = require('../data/imgData.json');

//利用自执行函数将图片数据转化成URL
imgDates = (function genImgUrl(imgDatasArr) {
  for(var i = 0, j = imgDatasArr.length; i < j;i++){
    var singleImagData = imgDatasArr[i];

    singleImagData.imgUrl = require('../images/' + singleImagData.fileName);

    imgDatasArr[i] = singleImagData;
  }

  return imgDatasArr;
})(imgDates);

/*
 * 获取区间内的一个随机值
*/
function getRangeRadom(low, high) {
  return Math.ceil((Math.random() * (high - low)) + low);
}

function get30DegRandom() {
  return ((Math.random() > 0.5 ? '' : '-') + Math.ceil(Math.random() * 30));
}
//设计图片标签
var ImgFigure = React.createClass({
  /*
  * imgFigure的点击函数
  * */
  handleClick: function (e) {
    if(this.props.arrange.isCenter){
      this.props.inverse();
    } else {
      this.props.center();
    }

    e.stopPropagation();
    e.preventDefault();
  },
  render: function () {
    //如果这张图片存在位置信息，则使用它
    var styleObj = {};
    if(this.props.arrange.pos){
      styleObj = this.props.arrange.pos;
    }

    if(this.props.arrange.isCenter){
      styleObj.zIndex = 11;
    }
    //如果图片的旋转角度有值，且不为0，那么添加旋转角度
    if(this.props.arrange.rotate){
      (['moz','ms','webkit','']).forEach(function (value) {
        styleObj[value + 'transform'] = 'rotate(' + this.props.arrange.rotate +'deg)';
      }.bind(this));
    }

    var imgFigureClassName = 'img-figure';
    imgFigureClassName += this.props.arrange.isInverse ? ' is-Inverse' : '';

    return (
      <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
        <img src={this.props.data.imgUrl} alt={this.props.data.title}/>
        <figcaption>
          <h2 className="img-title">{this.props.data.title}</h2>
          <div className="img-back" onClick={this.handleClick}>
            <p>
              {this.props.data.desc}
            </p>
          </div>
        </figcaption>
      </figure>
    );
  }

});

//控制组件
var ControllerUnit = React.createClass({
  handleClick: function (e) {

    if(this.props.arrange.isCenter){
      this.props.inverse();
    }else {
      this.props.center();
    }
    e.stopPropagation();
    e.preventDefault();
  },
  render: function () {
    var controllerUnitClassName = 'controller-unit';

    //如果图片是居中状态，则加上居中样式
    if(this.props.arrange.isCenter){
      controllerUnitClassName += ' is-center';

      //如果图片是翻转状态，则加上翻转样式
      if(this.props.arrange.isInverse){
        controllerUnitClassName += ' is-inverse';
      }
    }
    return (
      <span className={controllerUnitClassName} onClick={this.handleClick}></span>
    );
  }
});

//舞台组件
var AppComponent = React.createClass({
  Constant: {
    centerPos: {
      left: 0,
      top: 0
    },
    hPosRange: { //水平方向取值范围
      leftSecX: [0,0],
      rightSecX: [0,0],
      y: [0,0]
    },
    vPosRange: { //垂直方向取值范围
      x: [0,0],
      topY: [0,0]
    }
  },
  /*
  * 翻转图片
  * @Param index输入图片的标号
  * Return {Function} 这是一个闭包函数
  */
  inverse: function (index) {
    return function () {
      var imgsArrangeArr = this.state.imgsArrangeArr;

      imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;

      this.setState({
        imgsArrangeArr: imgsArrangeArr
      })
    }.bind(this);
  },
  /*
   * 图片居中函数
   * @Param index 要居中的图片所在数组的下标
   * Return {Function} 返回一个闭包函数
   * */
  center: function (index) {
    return function () {
      this.reArrange(index);
    }.bind(this);
  },
  /*
   *排布图片的位置
   *@Paran centerPosIndex 图片中心点的位置
  */
  reArrange: function (centerPosIndex) {
    var imgsArrangeArr = this.state.imgsArrangeArr,
      Constant = this.Constant,
      centerPos = Constant.centerPos,
      vPosRange = Constant.vPosRange,
      hPosRange = Constant.hPosRange,
      hPosRangeLeftSecX = hPosRange.leftSecX,
      hPosRangeRightSecX = hPosRange.rightSecX,
      hPosRangeY = hPosRange.y,
      vPosRangeTopY = vPosRange.topY,
      vPosRangeX = vPosRange.x,

      imgsArrangeTopArr = [],
      topImgNum = Math.floor(Math.random() * 2), //上部区域取一个或者不取
      topImgSpliceIndex = 0, //标记上部图片在图片数组中的位置

      imgArrangeCenterArr = imgsArrangeArr.splice(centerPosIndex,1); //居中图片的状态信息

    //首先确定居中 centerIndex 的图片的位置,居中的图片你不需要旋转
    imgArrangeCenterArr[0] = {
      pos: centerPos,
      rotate: 0,
      isCenter: true,
      isInverse: false
    }

    //取出要布局上侧图片的状态信息
    topImgSpliceIndex = Math.ceil(Math.random() * (imgsArrangeArr.length - topImgNum));
    imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex, topImgNum);

    //布局位于上侧的图片
    imgsArrangeTopArr.forEach(function (value,index) {
      imgsArrangeTopArr[index] = {
        pos: {
          left: getRangeRadom(vPosRangeX[0], vPosRangeX[1]),
          top: getRangeRadom(vPosRangeTopY[0], vPosRangeTopY[1])
        },
        rotate: get30DegRandom(),
        isCenter: false,
        isInverse: false
      }
    });

    //布局左右两侧图片的位置信息
    for(var i = 0, j = imgsArrangeArr.length, k = j / 2; i < j;i++){
      //判断照片布局在左边或右边
      var hPosRangeLORX = null;

      if(i < k){
        hPosRangeLORX = hPosRangeLeftSecX;
      }else {
        hPosRangeLORX = hPosRangeRightSecX;
      }

      imgsArrangeArr[i] = {
        pos: {
          left: getRangeRadom(hPosRangeLORX[0], hPosRangeLORX[1]),
          top: getRangeRadom(hPosRangeY[0], hPosRangeY[1])
        },
        rotate: get30DegRandom(),
        isCenter: false,
        isInverse: false
      }
    }

    if(imgsArrangeTopArr && imgsArrangeTopArr[0]){
      imgsArrangeArr.splice(topImgSpliceIndex, 0,imgsArrangeTopArr[0]);
    }

    imgsArrangeArr.splice(centerPosIndex, 0,imgArrangeCenterArr[0]);

    this.setState({
      imgsArrangeArr: imgsArrangeArr
    });
  },
  //获取状态值
  getInitialState: function () {
    return {
      imgsArrangeArr: [
        /*{
          pos: {
            left: '0',
            top: '0'
          },
          rotate: 0,//旋转角度
          isInverse: false //图片正反面
        }*/
      ]
    }
  },
  componentDidMount: function () {
    //拿到舞台大小
    var stageDom = ReactDOM.findDOMNode(this.refs.stage),
      stageW = stageDom.scrollWidth,
      stageH = stageDom.scrollHeight,
      halfStageW = Math.ceil(stageW / 2),
      halfStageH = Math.ceil(stageH / 2);

    //拿到一个ImgFigure大小
    var imgFigureDom = ReactDOM.findDOMNode(this.refs.imgFigure0),
      imgFigureW = imgFigureDom.scrollWidth,
      imgFigureH = imgFigureDom.scrollHeight,
      halfImgFigureW = Math.ceil(imgFigureW / 2),
      halfImgFigureH = Math.ceil(imgFigureH / 2);

    //计算中心图片的位置点
    this.Constant.centerPos = {
      left: halfStageW - halfImgFigureW,
      top: halfStageH - halfImgFigureH
    };

    //计算左右区域图片位置点的范围
    this.Constant.hPosRange.leftSecX[0] = 0;
    this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgFigureW * 3;
    this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgFigureW;
    this.Constant.hPosRange.rightSecX[1] = stageW - imgFigureW;
    this.Constant.hPosRange.y[0] = 0;
    this.Constant.hPosRange.y[1] = stageH - imgFigureH;

    //计算上侧区域图片位置点的范围
    this.Constant.vPosRange.topY[0] = 0;
    this.Constant.vPosRange.topY[1] = halfStageH - halfImgFigureH * 3;
    this.Constant.vPosRange.x[0] = halfStageW - imgFigureW;
    this.Constant.vPosRange.x[1] = halfStageW + imgFigureW;

    this.reArrange(0);
  },
  render() {
    var controllorUnits = [],
      imgFigures = [];

    imgDates.forEach(function (value,index) {
      if(!this.state.imgsArrangeArr[index]){
        this.state.imgsArrangeArr[index] = {
          pos: {
            left: 0,
            top: 0
          },
          rotate: 0,
          isInverse: false,
          idCenter: false
        }
      }
      imgFigures.push(<ImgFigure data={value} key={'imgFigure' + index} ref={'imgFigure' + index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)}
      center={this.center(index)}/>);
      controllorUnits.push(<ControllerUnit key={'ctlUnit' + index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>)
    }.bind(this));

    return (
      <section className="stage" ref="stage">
        <section className="img-sec">
          {imgFigures}
        </section>
        <nav className="controllor-nav">
          {controllorUnits}
        </nav>
      </section>
    );
  }
});

AppComponent.defaultProps = {
};

export default AppComponent;
