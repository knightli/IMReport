IMReport 可定制的上报组件
================

## 一 特性
 - 使用UMD方式定义, 兼容AMD/CMD及非模块规范
 - 调用统一的上报cgi
 - 上报节流(合并短时间内的连续上报,减少上报请求数)
 - 可根据项目情况使用工厂方法定制自己的上报器(可定制不同的mid和默认行为)
 - 定制上报器支持字符串MAP(与上报需求一一对应, 简化上报点, 方便后续维护)

## 二 如何引入和使用:

### 1. AMD/CMD环境下
例2.1.1
```javascript
require('bower_components/IMReport/src/IMReport',function(IMReport){
    //1. 进行全局配置
    IMReport.config({
        //...
    });
    
    //2. 创建上报器实例, 定制上报器参数和map列表
    var reportInstance = IMReport.ReportFactory({
        config: { //一个map表, key为上报项, value为上报参数
            'REPORT_POINT_A':{'aId':1,'mId':100}
        }
    });
    
    //3. 在业务代码中使用实例的report方法上报
    function doSth(){
        //bussiness code
        reportInstance.report('REPORT_POINT_A');
        //...
    }
});
```

### 2. 非模块化环境下
例2.1.2
html内
```html
<!-- 引入核心js -->
<script src="bower_components/IMReport/src/IMReport.js"></script>
<script>
(function(){
    //核心js在找不到define方法时会选择暴露IMReport方法在window下
    //所以下面的代码直接用IMReport即可
    
    IMReport.config({
        //...
    });
    
    var reportInstance = IMReport.ReportFactory({
        //...
    });
    
    function doSth(){
        //bussiness code
        reportInstance.report('XXX');
        //...
    }
})();    
</script>
```

## 三 关于上报参数的说明
### 1. 背景
通常, 我们会调用统一的jsreport cgi进行数据上报  
统一的上报cgi支持传一系列参数, 可上报到不同的系统( monitor imdata ads...)  

但这个cgi的上报参数是靠约定进行字符串拼接的  
`
actionId-value-monitorId-flag1-flag2-flag3-ver-rev
`

用起来非常麻烦!

本组件就是为了前端上报方便而诞生的  
core是amd写的, knight在core的基础上封装了一层factory以及map的逻辑.

### 2. 参数说明
下面按照js里使用时的形式列一下有哪些参数:  

*前面是js里使用时的参数字符串,  
后面是完整的字符串(可对应上面的拼接顺序看)以及说明  
带方括号的是可选参数  
不带方括号的参数在上报时至少要有一个*

     - `mId`      monitorId  monitor系统的上报id
     - `aId`      actionId   数分:行为id
     - `v`        [value]    数分:行为value
     - `flag1`    [flag1]    数分:行为的标志位1
     - `flag2`    [flag2]    数分:行为的标志位2
     - `flag3`    [flag3]    数分:行为的标志位3
     - `ver`      [ver]      数分:版本
     - `rev`      [rev]      数分:附加参数

## 四 接口说明

###core: config(object)   
####配置上报的全局默认参数

例4.1.1:
```javascript
IMReport.config({//
	'bId': 192, //qqm分配的jsreport的msgQ ID
	'aId': function (mId){ return '0';}, //@amd补充下这个参数的注释?
	'ctype': 2 //上报cgi类型，默认是需要登录态，type=2，是不需要登录态
});
```

###core: ReportFactory(object)
####创建一个定制的上报器
例4.2.1:
```javascript
var isVisitor = $.bom.getHash('visitor') ? 1:0;
var from = $.bom.getHash('from');

var reportInstance = IMReport.ReportFactory({
    config: {
        'PAGE_ENTER': 800001, //注:仅传一个数字时该数字表示mId
        'DOWNLOAD_BTN_CLICK':{'aId':9002,'mId':800002},
        'DOWNLOAD_BTN_CLICK#SUCC':{'aId':9003,'mId':800003}
    },
    getDefaultOptFn:function(usrParam){
        //定制上报器特有的上报行为(如果不传此函数, 意味着本上报器没有定制的特殊上报行为)
        var opt = {};
        
        opt.bId = 193; //定制上报器默认bId,该bId优先级高于全局的bId
        
        opt.flag1 = isVisitor; //如果产品要求区分一些上报情景, 可能会要求aId上报时带上flag,用约定的不同的值来做统计用
        
        //统一在aId上报时, 对v进行处理(from create: 1, else: 0)
        if( (typeof usrParam==='object')
            && ('aId' in usrParam)
            && !('v' in usrParam)){
            opt.v = (from && from==='create') ? 1 : 0;
        }
    }
});
```

###instance: report(string[, object])
####在具体上报点调用的上报方法
注意: 必须先调用上面的`IMReport.ReportFactory()`来得到一个上报器实例, 然后再调用该方法

例4.3.1:(最简单也是最常用的上报调用)
```javascript
...
reportInstance.report('PAGE_ENTER');
...
```

例4.3.1:(指定上报点参数的上报调用)
```javascript
reportInstance.report('DOWNLOAD_BTN_CLICK',{
    bId: 194, //上报点指定的bId, 优先级最高
    v: getRoleType=='owner' ? 1:0 //上报点指定的v, 优先级最高
});
```


## TODO
 - 和grunt task整合, 做到自动维护上报MAP表
 - 完善测试用例和demo
