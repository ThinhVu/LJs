
var l = (function (setting) {
    // common stuffs
    var _directAttrNames = {'value':null};
    var _setAttr = function (dom, name, val) {
        if (_directAttrNames.hasOwnProperty(name))
            dom[name] = val;
        else
            dom.setAttribute(name, val);
    }
    var _setEvent = function (dom, evName, evVal) {
        if (dom.addEventListener)
            dom.addEventListener(evName, evVal);
        else
            dom.attachEvent(evName, evVal);
    }
    var _dNoChange = 0;
    var _dAdd = 1;
    var _dUpdate = 2;
    var _dRemove = 3;
    var _diff = function (now, next) {        
        var ps = {};       
        for (var p in now) {
            ps[p] = (!next.hasOwnProperty(p)) ? _dRemove: 
                    (next[p] == now[p]) ? _dNoChange : _dUpdate;
        }
        for (var p in next) {
            if (!now.hasOwnProperty(p))
                ps[p] = _dAdd;
        }
        return ps;
    }

    var _deepCopy = function(origin) {
        if (Array.isArray(origin)) {
            var arr = [];
            for (var i = 0; i < origin.length; ++i)
                arr[i] = _deepCopy(origin[i]);
            return arr;
        }
        else if (typeof origin === 'object') {
            var clone = {};
            for (var i in obj)
                clone[i] = _deepCopy(origin[i]);
            return clone;
        }
        else
            return origin;
    }
    // Lelement
    function Lelement(data) { 
        this._data = data;
        this.setData = function(nData){
            var change = false;
            for(var p in nData) {
                if (this._data[p] != nData[p]) {
                    this._data[p] = nData[p];
                    change = true;
                }
            }
            if (change)
                this.prototype.redraw();
        }
    }
    Lelement.prototype.template = function () { throw "Not implemented exception"; }
    Lelement.prototype.redraw = function () {
        if (this._VDOM == null) {
            this._VDOM = this.template(_deepCopy(this._data));
            this._VDOM.component = this;
        }
        else {
            this._VDOM.update(this.template(_deepCopy(this._data)));
        }
    }    
    Object.defineProperty(Lelement.prototype, "VDOM", {
        get: function () {
            if (this._VDOM == null) {
                this._VDOM = this.template(this.data);
                this._VDOM.component = this;
            }
            return this._VDOM;
        },
        set: function (vdom) {
            this._VDOM = vdom;
        },
        configurable: true,
        enumerable: false,
    });

    // VDOM
    function VDOM(tag, attrs, events, childs) {
        var m = this;
        if (tag != null) m.tag = tag;
        if (attrs != null) m.attrs = attrs;
        if (events != null) m.events = events;
        m.childs = [];
        // flatten child array
        function addChild(cs) {
            if (cs != null && cs.length != 0) {
                for (var i = 0; i < cs.length; ++i) {
                    var vd = cs[i];
                    if (Array.isArray(vd)) {
                        addChild(vd);
                    }
                    else {
                        if (!(typeof vd === 'object' && vd.update !== undefined)) {
                            vd = {
                                DOM: document.createTextNode(cs[i]),
                                text: cs[i],
                                update: function (next) {
                                    this.DOM.data = next.text;
                                    this.text = next.text;
                                }
                            }
                        }
                        vd.parent = m;
                        m.childs.push(vd);
                    }
                }
            }
        }
        addChild(childs);
    }
    VDOM.prototype.update = function (nextVDOM) {
        if (this.tag != nextVDOM.tag) {
            this.parent.DOM.replaceChild(nextVDOM.DOM, this.DOM);            
            this.parent.childs[this.parent.childs.indexOf(this)] = nextVDOM;
        } else {
            var adif = _diff(this.attrs, nextVDOM.attrs);
            for (var a in adif) {
                switch (adif[a]) {
                    case _dAdd:
                    case _dUpdate:
                        _setAttr(this.DOM, a, nextVDOM.attrs[a]);
                        this.attrs[a] = nextVDOM.attrs[a];
                        break;
                    case _dRemove:
                        this.DOM.removeAttribute(a);
                        this.attrs[a] = undefined;
                        break;
                }
            }

            var edif = _diff(this.events, nextVDOM.events);
            for (var p in edif) {
                switch (edif[p]) {
                    case _dAdd:
                    case _dUpdate:
                        if (this.events[p].toString() != nextVDOM.events[p].toString()) {
                            this.DOM.removeEventListener(p, this.events[p]);
                            _setEvent(this.DOM, p, nextVDOM.events[p]);
                            this.events[p] = nextVDOM.events[p];
                        }
                        break;
                    case _dRemove:
                        this.DOM.removeEventListener(p, this.events[p]);
                        this.events[p] = undefined;
                        break;
                }
            }

            // TODO: apply keyed diff to reduce DOM changes
            var oChildLen = this.childs != undefined ? this.childs.length : 0;
            var nChildLen = nextVDOM.childs != undefined ? nextVDOM.childs.length : 0;
            var min = oChildLen > nChildLen ? nChildLen: oChildLen;
            var maxChildLen = oChildLen > nChildLen ? oChildLen : nChildLen;
            // remove child
            if (oChildLen > nChildLen)
            {                
                for(var i=nChildLen; i<oChildLen; ++i){
                    this.DOM.removeChild(this.childs[nChildLen-1].DOM);                    
                }
                this.childs.splice(nChildLen-1, oChildLen - nChildLen);
            } 
            else if (oChildLen < nChildLen) {
                // add
                for(var i=oChildLen; i<nChildLen; ++i) {
                    this.DOM.appendChild(nextVDOM.childs[i].DOM);
                    this.childs.push(nextVDOM.childs[i]);
                }                
            }
            // update
            for(var i=0; i<min;++i) {                
                this.childs[i].update(nextVDOM.childs[i]);
            }
        }
    }
    Object.defineProperty(VDOM.prototype, "DOM", {
        get: function () {
            if (this._DOM == undefined) {
                var dom = document.createElement(this.tag || '');                             
                for (var a in this.attrs) {
                    _setAttr(dom, a, this.attrs[a]);
                }
                for (var e in this.events) {
                    _setEvent(dom, e, this.events[e]);
                }                
                for (var c in this.childs) {
                    dom.appendChild(this.childs[c].DOM);
                }
                this._DOM = dom;          
            }       
            return this._DOM;
        },
        set: function (dom) {
            this._DOM = dom;
        },
        enumerable: false,
        configurable: true
    });


    // l stuffs
    var _defaults = 'a,address,applet,area,b,base,basefont,bgsound,big,blink,blockquote,body,br,button,caption,center,cite,code,colgroup,dd,del,div,dl,dt,em,embed,fieldset,font,form,frame,frameset,h1,h2,h3,h4,h5,h6,head,hr,html,i,iframe,img,input,ins,label,legend,li,link,map,marquee,meta,nobr,noembed,noframes,noscript,object,ol,option,p,param,pre,q,rb,rp,rt,ruby,s,samp,script,select,small,span,strike,strong,style,sub,sup,table,tbody,td,textarea,tfoot,th,thead,title,tr,tt,u,ul,var'.split(',');
    var _customs = {};

    // element
    var m = function (tag) {
        if (_defaults.includes(tag)) {
            return new VDOM(tag, arguments[1], arguments[2], arguments[3]);
        }
        else if (_customs.hasOwnProperty(tag)) {
            return m.c(tag, arguments[1]).VDOM;
        }
        else {
            throw "VDOM " + tag + " missing.";
        }
    };

    // component
    m.c = function (tag, data) {
        if (_customs.hasOwnProperty(tag)) {
            var o = new _customs[tag]();
            o.data = data;
            return o;
        }
        else {
            throw "Missing " + tag + " component";
        }
    }
    m.c.register = function (tag, ctor) {
        if (_customs.hasOwnProperty(tag) && !m.setting.overwrite)
            throw "Component " + tag + " already exist.";
        ctor.prototype = Object.create(Lelement.prototype);
        ctor.prototype.constructor = ctor;
        _customs[tag] = ctor;
    }

    // ...
    m.setting = setting;
    m.attach = function (dom, cpn) {
        cpn.VDOM.parent = { DOM: dom, childs: [cpn.VDOM] };
        dom.appendChild(cpn.VDOM.DOM);
    }    
    return m;
})({ overwrite: false });