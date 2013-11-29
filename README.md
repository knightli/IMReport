IMReport �ɶ��Ƶ��ϱ����
================

## һ ����
 - ʹ��UMD��ʽ����, ����AMD/CMD����ģ��淶
 - ����ͳһ���ϱ�cgi
 - �ϱ�����(�ϲ���ʱ���ڵ������ϱ�,�����ϱ�������)
 - �ɸ�����Ŀ���ʹ�ù������������Լ����ϱ���(�ɶ��Ʋ�ͬ��mid��Ĭ����Ϊ)
 - �����ϱ���֧���ַ���MAP(���ϱ�����һһ��Ӧ, ���ϱ���, �������ά��)

## �� ��������ʹ��:

### 1. AMD/CMD������
��2.1.1
```javascript
require('bower_components/IMReport/IMReport',function(IMReport){
    //1. ����ȫ������
    IMReport.config({
        //...
    });
    
    //2. �����ϱ���ʵ��, �����ϱ���������map�б�
    var reportInstance = IMReport.ReportFactory({
        config: { //һ��map��, keyΪ�ϱ���, valueΪ�ϱ�����
            'REPORT_POINT_A':{'aId':1,'mId':100}
        }
    });
    
    //3. ��ҵ�������ʹ��ʵ����report�����ϱ�
    function doSth(){
        //bussiness code
        reportInstance.report('REPORT_POINT_A');
        //...
    }
});
```

### 2. ��ģ�黯������
��2.1.2
html��
```html
<!-- �������js -->
<script src="bower_components/IMReport/IMReport"></script>
<script>
(function(){
    //����js���Ҳ���define����ʱ��ѡ��¶IMReport������window��
    //��������Ĵ���ֱ����IMReport����
    
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

## �� �����ϱ�������˵��
### 1. ����
ͨ��, ���ǻ����ͳһ��jsreport cgi���������ϱ�  
ͳһ���ϱ�cgi֧�ִ�һϵ�в���, ���ϱ�����ͬ��ϵͳ( monitor imdata ads...)  

�����cgi���ϱ������ǿ�Լ�������ַ���ƴ�ӵ�  
`
actionId-value-monitorId-flag1-flag2-flag3-ver-rev
`

�������ǳ��鷳!

���������Ϊ��ǰ���ϱ������������  
core��amdд��, knight��core�Ļ����Ϸ�װ��һ��factory�Լ�map���߼�.

### 2. ����˵��
���水��js��ʹ��ʱ����ʽ��һ������Щ����:  

*ǰ����js��ʹ��ʱ�Ĳ����ַ���,  
�������������ַ���(�ɶ�Ӧ�����ƴ��˳��)�Լ�˵��  
�������ŵ��ǿ�ѡ����  
���������ŵĲ������ϱ�ʱ����Ҫ��һ��*

     - `mId`      monitorId  monitorϵͳ���ϱ�id
     - `aId`      actionId   ����:��Ϊid
     - `v`        [value]    ����:��Ϊvalue
     - `flag1`    [flag1]    ����:��Ϊ�ı�־λ1
     - `flag2`    [flag2]    ����:��Ϊ�ı�־λ2
     - `flag3`    [flag3]    ����:��Ϊ�ı�־λ3
     - `ver`      [ver]      ����:�汾
     - `rev`      [rev]      ����:���Ӳ���

## �� �ӿ�˵��

###core: config(object)   
####�����ϱ���ȫ��Ĭ�ϲ���

��4.1.1:
```javascript
IMReport.config({//
	'bId': 192, //qqm�����jsreport��msgQ ID
	'aId': function (mId){ return '0';}, //@amd���������������ע��?
	'ctype': 2 //�ϱ�cgi���ͣ�Ĭ������Ҫ��¼̬��type=2���ǲ���Ҫ��¼̬
});
```

###core: ReportFactory(object)
####����һ�����Ƶ��ϱ���
��4.2.1:
```javascript
var isVisitor = $.bom.getHash('visitor') ? 1:0;
var from = $.bom.getHash('from');

var reportInstance = IMReport.ReportFactory({
    config: {
        'PAGE_ENTER': 800001, //ע:����һ������ʱ�����ֱ�ʾmId
        'DOWNLOAD_BTN_CLICK':{'aId':9002,'mId':800002},
        'DOWNLOAD_BTN_CLICK#SUCC':{'aId':9003,'mId':800003}
    },
    getDefaultOptFn:function(usrParam){
        //�����ϱ������е��ϱ���Ϊ(��������˺���, ��ζ�ű��ϱ���û�ж��Ƶ������ϱ���Ϊ)
        var opt = {};
        
        opt.bId = 193; //�����ϱ���Ĭ��bId,��bId���ȼ�����ȫ�ֵ�bId
        
        opt.flag1 = isVisitor; //�����ƷҪ������һЩ�ϱ��龰, ���ܻ�Ҫ��aId�ϱ�ʱ����flag,��Լ���Ĳ�ͬ��ֵ����ͳ����
        
        //ͳһ��aId�ϱ�ʱ, ��v���д���(from create: 1, else: 0)
        if( (typeof usrParam==='object')
            && ('aId' in usrParam)
            && !('v' in usrParam)){
            opt.v = (from && from==='create') ? 1 : 0;
        }
    }
});
```

###instance: report(string[, object])
####�ھ����ϱ�����õ��ϱ�����
ע��: �����ȵ��������`IMReport.ReportFactory()`���õ�һ���ϱ���ʵ��, Ȼ���ٵ��ø÷���

��4.3.1:(���Ҳ����õ��ϱ�����)
```javascript
...
reportInstance.report('PAGE_ENTER');
...
```

��4.3.1:(ָ���ϱ���������ϱ�����)
```javascript
reportInstance.report('DOWNLOAD_BTN_CLICK',{
    bId: 194, //�ϱ���ָ����bId, ���ȼ����
    v: getRoleType=='owner' ? 1:0 //�ϱ���ָ����v, ���ȼ����
});
```


## TODO
 - ��grunt task����, �����Զ�ά���ϱ�MAP��
 - ���Ʋ���������demo