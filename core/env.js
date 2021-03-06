"use strict"

var _lodeCtors = {};
var _tags = ',a,address,applet,area,article,aside,b,base,basefont,bdi,bgsound,big,blink,blockquote,body,br,button,caption,center,cite,code,colgroup,dd,del,details,dialog,div,dl,dt,em,embed,fieldset,figcaption,figure,font,footer,form,frame,frameset,h1,h2,h3,h4,h5,h6,head,header,hr,html,i,iframe,img,input,ins,label,legend,li,link,main,map,mark,marquee,menuitem,meta,meter,nav,nobr,noembed,noframes,noscript,object,ol,option,p,param,pre,progress,q,rb,rp,rt,ruby,s,samp,script,select,section,small,span,strike,strong,style,sub,summary,sup,table,tbody,td,time,textarea,tfoot,th,thead,title,tr,tt,u,ul,var,wbr'.split(',');

var _isTextNode = function(name) {
    return name == '';
}
// detect whether an element is native or custom
var _isNativeElement = function(name) {
    return _tags.indexOf(name) >= 0;
}
var _isCustomElement = function(name) {
    return !_isNativeElement(name) && _lodeCtors.hasOwnProperty(name);
}

var _flatten = function(arr) {
    return arr.reduce(function (flat, toFlatten) {
      return flat.concat(Array.isArray(toFlatten) ? _flatten(toFlatten) : toFlatten);
    }, []);
}