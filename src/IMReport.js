/**
 * @description IMReport report封装 
 * @author amadeusguo/knightli
 * readme: XXXX
 * sample: XXXX
 */
 
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals
        root['IMReport'] = factory();
    }
}(this, function () {
    
    //=======  AMD module inner code ========
    
    //==== handbar functions begin  ==== (或许来自其他库,但为了消除依赖,这里适度重复了)  TODO:这里要考虑重复代码的同步更新机制!!
    function indexOf(array,elem) {
        //IE不支持这个方法
        if(Array.prototype.indexOf){
            return Array.prototype.indexOf.call( array, elem );
        }
        for ( var i = 0, length = array.length; i < length; i++ ) {
            if ( array[ i ] === elem ) {
                return i;
            }
        }

        return -1;
    }
    //==== handbar functions end  ====
    
    
    /*
     * 使用jsreport cgi上报monitor和数分，可以合并上报多个
     * 
     * A) 配置上报, bId: 业务Id，找qqm领
     *              aId: 函数通过mID算出数分的上报id，不配也可以
                    ctype: 上报cgi类型，默认是需要登录态，type=2，目前是不需要登录态
     * $.report.config({
     *     'bId': 150,
     *     'aId': function (mId){
     *         // 这个100个上报行为ID给数分
     *         if (mId>=279685 && mId<279785)
     *             return mId - 279684;
     *         else
     *             return 0;
     *     },
        'ctype' : 2
     * });
     * 
     * B) 上报示例
     *
     * 1. 上报1次到monitor:  $.report(mId)
     * 2. 只上报一次，例如UV: $.report(mId, 'once')
     * 3. 不延迟合，立即上报: $.report(mId, 'now')
     * 4. 上报两次: $.report(mId, 2)
     * 5. $.report(mId, 2, 'once')
     * 6. $.report(mId, 2, 'now')
     * 7. 上报monitorId, 群号, 客户端版本号: $.report({mId:123, flag1:gc, ver:5093})
     * 8. 上报更多的内容: $.report({mId:1203, aId: 12, v:1, flag1:333, flag2:333, flag3:333, ver:5093, rev:})
     * 
     * cgi上报顺序
     * actionId-value-monitorId-flag1-flag2-flag3-ver-rev
     */
    
    
    //==== module code begin ====
    var _bId, _url;
    var _aId = function (){
        return 0;
    };
    
    var config = function (conf){
        
        _bId = conf['bId'];
        _url = 'http://jsreport.qq.com/cgi-bin/report'+(conf['ctype']?conf['ctype']:"")+'?id='+_bId+'&rs=';

        if (conf['aId']){
            _aId = conf['aId'];
        }
    };

    var timer, // 用于延迟上报的timer
        cache = [],
        done = []; // 只上报一次的队列

    var doReport = function () {
        var img = new Image();
        img.src = _url + cache.join('|_|') + '&r=' + Math.random();
        img = null;

        // clear report cache
        cache = [];
    };

    var keys = ['aId', 'v', 'mId', 'flag1', 'flag2', 'flag3', 'ver', 'rev'];
    var report = function (mId, value, type) {
        // 参数适配
        var args = {};
        var msg;

        var t = typeof mId;
        if (t=='number'){

            t = typeof value;
            if ( t=='undefined' || t=='string' ){
                args.v = 1;
                type = value;

                msg = _aId(mId)+'-1-'+mId;

            }else if (t == 'number'){
                args.v = value;

                msg = _aId(mId)+'-1-'+mId;
            }

        }else if (t=='object'){
            args = mId;
            mId = args.mId;
            type = value;

            if (!('v' in args)) args.v = 1;
            if (!('aId' in args)) args.aId = _aId(mId);

            var msg_arr = [];
            for (var key in args){
                var idx = indexOf(keys, key);
                if (idx != -1){
                    msg_arr[idx] = args[key];
                }
            }
            msg = msg_arr.join('-').replace(/-(?=-)/g, '-0');
        }

        if (type == 'once') {
            // once 只上报一次
            if (indexOf(done, mId) != -1) return;
            done.push(mId);
        }

        if (msg) cache.push(msg);

        clearTimeout(timer);
        if (type == 'now' || mId == 'now') {
            // now立马上报
            doReport();
        } else {
            timer = setTimeout(doReport, 500);
        }
    };

    report.ReportFactory = (function(){

        var keys = {'aId':1, 'v':1, 'mId':1, 'flag1':1, 'flag2':1, 'flag3':1, 'ver':1, 'rev':1};

        var commonReport = function(param, fn){
            if(!param) return;

            var p = {};
            if(typeof fn==='function') p = fn(param);


            if(typeof param === 'number'){
                p.mId = param;
            }
            else if(typeof param === 'object'){
                for (var key in param){
                    if(key in keys){
                        p[key] = param[key];
                    }
                }
            }

            report(p);
        };

        var factory = function(opt){
            opt = opt || {};
            var _config = opt.config || {};
            var _fn = opt.getDefaultOptFn;

            return function(key,param){
                var p = _config[key];
                if(!p) return;

                if(typeof param==='object'){
                    for(var i in param){
                        p[i] = param[i];
                    }
                }

                commonReport(p,_fn);
            };
        };

        return factory;
    })();

    report.config = config;
    
    //==== module code end ====
    
    return report;
    
    //=======  AMD module inner code ========

}));