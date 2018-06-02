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
        else if (dom.attachEvent)
            dom.attachEvent(evName, evVal);
        else
            dom['on' + evName] = evVal;
    }
    var _dNoChange = 0;
    var _dAdd = 1;
    var _dUpdate = 2;
    var _dRemove = 3;
    var _diff = function (now, nxt) {
        var ps = {};
        for (var p in now) {
            ps[p] = (!nxt.hasOwnProperty(p)) ? _dRemove:
                    (nxt[p] == now[p]) ? _dNoChange : _dUpdate;
        }
        for (var p in nxt) {
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
    // LComp
    function LComp(data) {
        this._data = data;
        this.setData = function(nData, skip) {
            var change = false;
            for(var p in nData) {
                if (this._data[p] != nData[p]) {
                    this._data[p] = nData[p];
                    change = true;
                }
            }
            if (skip) return;
            if (change) this.prototype.redraw();
        }
    }
    LComp.prototype.template = function () {
        throw "Not implemented exception";
    }
    LComp.prototype.redraw = function () {
        if (this._VDOM == null) {
            this._VDOM = this.template(_deepCopy(this._data));
            this._VDOM.component = this;
        }
        else {
            this._VDOM.update(this.template(_deepCopy(this._data)));
        }
    }
    Object.defineProperty(LComp.prototype, "VDOM", {
        get: function () {
            if (this._VDOM == null) {
                this._VDOM = this.template(this._data);
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
    // flatten child array
    function _addChild(parent, cs) {
        if (!Array.isArray(cs)) {
            _addChild(parent, [cs]);
            return;
        }
        if (cs && cs.length) {
            for (var i = 0; i < cs.length; ++i) {
                var vd = cs[i];
                if (Array.isArray(vd)) {
                    _addChild(parent, vd);
                    continue;
                }
                if (!(typeof vd == 'object' && typeof vd.__proto__.update == 'function')) {
                    vd = {
                        DOM: document.createTextNode(cs[i]),
                        text: cs[i], // verbose
                        update: function(nxt) {
                            this.DOM.data = nxt.text;
                            this.text = nxt.text;
                        }
                    }
                }
                vd.parent = parent;
                parent.childs.push(vd);
            }
        }
    }
    // VDOM
    function VDOM(tag, attrs, events, childs) {
        var m = this;
        if (tag != null) 
            m.tag = tag;
        if (attrs != null) 
            m.attrs = attrs;
        if (events != null) 
            m.events = events;
        m.childs = [];
        _addChild(m, childs);
    }
    VDOM.prototype.update = function (nxt) {
        // facebook reconciliation impl
        // 1st assumption: if tag diff, redraw entire tree.
        if (this.tag != nxt.tag) 
        {
            // Almost, if not all case it doesn't matter detach old node or attach new node first.  
            var nxtSbl = this.DOM.nextSibling || undefined;
            // life cycle of DOM
            this.beforeDetach && this.beforeDetach();
            this.parent.DOM.removeChild(this.DOM);
            this.afterDetach && this.afterDetach();
            //
            nxt.beforeAttach && nxt.beforeAttach();
            this.parent.DOM.insertBefore(nxt.DOM, nxtSbl);
            nxt.afterAttach && nxt.afterAttach();

            // update VDOM
            this.tag = nxt.tag;
            this.attrs = nxt.attrs;
            this.events = nxt.events;
            this.childs = nxt.childs;
            this.DOM = nxt.DOM;
        } 
        else 
        {
            var adif = _diff(this.attrs, nxt.attrs);            
            for (var a in adif) {
                switch (adif[a]) {
                    case _dAdd:
                    case _dUpdate:
                        _setAttr(this.DOM, a, nxt.attrs[a]);
                        this.attrs[a] = nxt.attrs[a];
                        break;
                    case _dRemove:
                        this.DOM.removeAttribute(a);
                        this.attrs[a] = undefined;
                        break;
                }
            }
            var edif = _diff(this.events, nxt.events);
            for (var p in edif) {
                switch (edif[p]) {
                    case _dAdd:
                    case _dUpdate:
                        if (this.events[p].toString() != nxt.events[p].toString()) {
                            this.DOM.removeEventListener(p, this.events[p]);
                            _setEvent(this.DOM, p, nxt.events[p]);
                            this.events[p] = nxt.events[p];
                        }
                        break;
                    case _dRemove:
                        this.DOM.removeEventListener(p, this.events[p]);
                        this.events[p] = undefined;
                        break;
                }
            }
            var empty = [];
            var nLen = (this.childs || empty).length;
            var nxtLen = (nxt.childs || empty).length;
            var keyed = false;
            if (nLen && this.childs[0].attrs && this.childs[0].attrs.hasOwnProperty['key'])
                keyed = true;
            if (keyed) {
                // 2nd assumption: keyed childrend node diffing.
                // old_childs = [ {key:1, VDOM:..}, {key: 2, VDOM:..} ]
                // new_childs = [ {key:3, VDOM:..}, {key: 1, VDOM:..}, {key:2, DOM:html}]
                var oldKeys = {}; // { 1: VDOM, 2: VDOM, 3: VDOM}
                for(var i in this.childs) {
                    oldKeys[this.childs[i].attrs.key] = this.childs[i];
                }
                var newKeys = {};
                for(var i in nxt.childs) {
                    newKeys[nxt.childs[i].attrs.key] = nxt.childs[i];
                }
                // remove childs element which doesn't appear in new childs DOM
                for(var i in oldKeys) {
                    if (!newKeys.hasOwnProperty(i)) {
                        oldKeys[i].beforeDetach && oldKeys[i].beforeDetach();
                        this.DOM.removeChild(oldKeys[i].DOM); // remove DOM
                        oldKeys[i].afterDetach && oldKeys[i].afterDetach();
                        this.childs.splice(this.childs.indexOf(oldKeys[i]), 1); // remove VDOM
                    }
                }
                // update or add new
                for(var i in nxt.childs) {
                    var nKey = nxt.childs[i].attrs.key;
                    if (oldKeys.hasOwnProperty(nKey)) {
                        // update
                        frag.appendChild(oldKeys[nKey].DOM); /*detach DOM*/
                        oldKeys[nKey].update(nxt.childs[i]); /*and update DOM*/
                    }
                    else {
                        // add new
                        newKeys[nKey].beforeAttach && newKeys[nKey].beforeAttach();
                        frag.appendChild(newKeys[nKey].DOM);
                        newKeys[nKey].afterAttach && newKeys[nKey].afterAttach();
                        this.childs.push(newKeys[nKey]);
                    }
                }
                this.DOM.appendChild(frag);
            }
            else {
                // naively implement - iterates over both lists of children at the same time
                if (nLen > nxtLen) {
                    var i = nLen - 1;
                    do {
                        this.DOM.removeChild(this.childs[i].DOM);
                        this.childs.splice(i, 1);
                        i--;
                    }
                    while(i != nxtLen)
                }
                else if (nLen < nxtLen) {
                    // add
                    for(var i=nLen; i<nxtLen; ++i) {
                        this.DOM.appendChild(nxt.childs[i].DOM);
                        this.childs.push(nxt.childs[i]);
                    }
                }
                // update
                var min = nLen < nxtLen ? nLen : nxtLen;
                for(var i=0; i<min;++i) {
                    this.childs[i].update(nxt.childs[i]);
                }
            }            
        }
    }
    Object.defineProperty(VDOM.prototype, "DOM", {
        get: function () {
            if (this._DOM == undefined) {
                // invisible DOM, reflow won't occur.
                // DOM only render if we access it.
                // in VDOM.update method, we only access to next DOM when tag change.
                // so DOM render rarely happen.
                var dom = document.createElement(this.tag || '');
                for (var a in this.attrs) _setAttr(dom, a, this.attrs[a]);
                for (var e in this.events) _setEvent(dom, e, this.events[e]);
                for (var c in this.childs) dom.appendChild(this.childs[c].DOM);
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
    var l = function (tag) {
        if (_defaults.includes(tag))
            return new VDOM(tag, arguments[1], arguments[2], arguments[3]);
        else
            return l.c(tag, arguments[1]).VDOM;
    };
    // component
    l.c = function (tag, data) {
        if (_customs.hasOwnProperty(tag)) {
            var o = new _customs[tag]();
            o.data = data;
            return o;
        }
        else {
            throw "Missing " + tag + " component";
        }
    }
    l.c.register = function (tag, ctor) {
        if (_customs.hasOwnProperty(tag) && !l.setting.componentOverwrite)
            throw "Component " + tag + " already exist.";
        ctor.prototype = Object.create(LComp.prototype);
        ctor.prototype.constructor = ctor;
        _customs[tag] = ctor;
    }
    // ...
    l.setting = setting;
    l.attach = function (dom, cpn) {
        cpn.VDOM.parent = { DOM: dom, childs: [cpn.VDOM] };
        cpn.beforeAttach && cpn.beforeAttach();
        dom.appendChild(cpn.VDOM.DOM);
        cpn.afterAttach && cpn.afterAttach();
    }
    return l;
})({ componentOverwrite: false });