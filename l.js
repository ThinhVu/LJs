
var l = (function (setting) {
    // common stuffs
    var _directAttrNames = [];
    var _setAttr = function (dom, name, val) {
        if (_directAttrNames.includes(name))
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

    var _diffs = { nochange: 0, add: 1, remove: 2, update: 3 }
    var _diff = function (now, next) {
        var ps = {};
        for (var p in now)
            ps[p] = _diffs.nochange;
        for (var p in next)
            ps[p] = _diffs.nochange;
        for (var p in ps) {
            if (!now.hasOwnProperty(p))
                ps[p] = _diffs.add;
            else if (!next.hasOwnProperty(p))
                ps[p] = _diffs.remove;
            else if (now[p] !== next[p])
                ps[p] = _diffs.update;
        }
        return ps;
    }

    // Lelement
    function Lelement() { }
    Lelement.prototype.template = function () { throw "Not implemented exception"; }
    Lelement.prototype.redraw = function () {
        if (this._VDOM == null) {
            this._VDOM = this.template(this.data);
            this._VDOM.component = this;
        }
        else {
            this._VDOM.update(this.template(this.data));
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
        enumerable: true,
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
            this.parent.DOM.insertBefore(nextVDOM.DOM, this.DOM.nextSibling || undefined);
            this.parent.DOM.removeChild(this.DOM);
            this.parent.childs[this.parent.childs.indexOf(this)] = nextVDOM;
        } else {

            // HTMLElement                
            var adif = _diff(this.attrs, nextVDOM.attrs);
            for (var a in adif) {
                switch (adif[a]) {
                    case _diffs.add:
                    case _diffs.update:
                        if (a == 'value')
                            this.DOM['value'] = nextVDOM.attrs[a];
                        else
                            this.DOM.setAttribute(a, nextVDOM.attrs[a]);
                        this.attrs[a] = nextVDOM.attrs[a];
                        break;
                    case _diffs.remove:
                        this.DOM.removeAttribute(a);
                        this.attrs[a] = undefined;
                        break;
                }
            }

            var edif = _diff(this.events, nextVDOM.events);
            for (var p in edif) {
                switch (edif[p]) {
                    case _diffs.add:
                    case _diffs.update:
                        if (this.events[p].toString() != nextVDOM.events[p].toString()) {
                            this.DOM.removeEventListener(p, this.events[p]);
                            this.DOM.addEventListener(p, nextVDOM.events[p]);
                            this.events[p] = nextVDOM.events[p];
                        }
                        break;
                    case _diffs.remove:
                        this.DOM.removeEventListener(p, this.events[p]);
                        this.events[p] = undefined;
                        break;
                }
            }
            // TODO: apply keyed diff to reduce DOM changes
            var oChildLen = this.childs != undefined ? this.childs.length : 0;
            var nChildLen = nextVDOM.childs != undefined ? nextVDOM.childs.length : 0;
            var maxChildLen = oChildLen > nChildLen ? oChildLen : nChildLen;
            for (var i = maxChildLen; i > 0; i--) {
                if (i > oChildLen) {
                    // add
                    this.DOM.appendChild(nextVDOM.childs[i - 1].DOM);
                    this.childs.push(nextVDOM.childs[i - 1]);
                } else {
                    if (i > nChildLen) {
                        // remove
                        this.DOM.removeChild(this.DOM.childNodes[i - 1]);
                        this.childs.splice(i - 1, 1);
                    } else {
                        // update
                        this.childs[i - 1].update(nextVDOM.childs[i - 1]);
                    }
                }
            }
        }
    }
    Object.defineProperty(VDOM.prototype, "DOM", {
        get: function () {
            if (this._DOM == undefined) {
                this._DOM = document.createElement(this.tag || '');
                for (var a in this.attrs) {
                    _setAttr(this._DOM, a, this.attrs[a]);
                }
                for (var e in this.events) {
                    _setEvent(this._DOM, e, this.events[e]);
                }
                for (var c in this.childs) {
                    this._DOM.appendChild(this.childs[c].DOM)
                }
            }
            return this._DOM;
        },
        set: function (dom) {
            this._DOM = dom;
        },
        enumerable: true,
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
    m.deepCopy = function (origin) {
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
    return m;
})({ overwrite: false });