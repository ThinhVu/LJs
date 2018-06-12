var l = (function (setting) {
    // set attribute helper
    // some attr doesn't take any affect if set by setAttribute method
    // so we need to set this attr directly by property
    var _attrs = { 'value': 'value', 'class': 'className' };
    var _setAttr = function(dom, name, val) {
        if (_attrs.hasOwnProperty(name))
            dom[_attrs[name]] = val;
        else
            dom.setAttribute(name, val);
    }

    // set event helper
    var _setEvent = function(dom, evName, evVal) {
        if (dom.addEventListener)
            dom.addEventListener(evName, evVal);
        else if (dom.attachEvent)
            dom.attachEvent(evName, evVal);
        else
            dom['on' + evName] = evVal;
    }
    
    // diffing
    var _eDiff = { NoChange:0, Add: 1, Update: 2, Remove: 3 };
    var _diff = function(now, nxt) {
        var ps = {};
        for (var p in now) {
            ps[p] = (!nxt.hasOwnProperty(p)) ? _eDiff.Remove:
                    (nxt[p] == now[p]) ? _eDiff.NoChange : _eDiff.Update;
        }
        for (var p in nxt) {
            if (!now.hasOwnProperty(p))
                ps[p] = _eDiff.Add;
        }
        return ps;
    }
    
    // ==================================================================
    // Lelement
    function Lelement() {
        var m = this, _Lode = null;
        m.template = function() { throw "Not impl" };
        m.setState = function(newState, redraw) {
            var state = m.state, 
                changed = false, 
                render = (redraw == undefined) ? true : redraw; // default true
            for(var i in newState) {
                if (state[i] != newState[i]) {
                    state[i] = newState[i];
                    changed = true;
                }
            }
            changed && render && m.redraw();
        };
        m.redraw = function () {
            if (_Lode == undefined) {
                _Lode = m.template();
                _Lode.lelement = m;
            }
            else {
                var lode = m.template();
                var __l = this.Lode;
                _Lode.update(lode);
            }
        }
        m.__defineGetter__('Lode', function() {
            if (_Lode == undefined) {
                _Lode = m.template();
                _Lode.lelement = m;
            }
            return _Lode;
        });
        m.__defineSetter__('Lode', function(Lode) {
            if (Lode.lelement != m)
                Lode.lelement = m;
            _Lode = Lode;
        })
    }

    // ====================================================================
    // Lode
    function Lode(tag, attrs, events, childs) {
        var _addChild = function(parent, cs) {
            if (cs == null) return;
            if (!Array.isArray(cs)) {
                _addChild(parent, [cs]);
            }
            else {
                for (var i = 0; i < cs.length; ++i) {
                    var vd = cs[i];
                    if (Array.isArray(vd)) {
                        _addChild(parent, vd);
                    }
                    else {
                        if (!(typeof vd == 'object' && typeof vd.update == 'function')) {
                            vd = {
                                DOM: document.createTextNode(cs[i]),
                                text: cs[i], // fast text compare, skip DOM access.
                                update: function(nxt) {
                                    var m = this;
                                    if (m.text != nxt.text) {
                                        m.DOM.data = nxt.text;
                                        m.text = nxt.text;
                                    }
                                }
                            }
                            vd.parent = parent;
                        }
                        parent.childs.push(vd);
                    }             
                }
            }
        }

        var m = this;
        if (tag != undefined) m.tag = tag;
        if (attrs != undefined) m.attrs = attrs;
        if (events != undefined) m.events = events;    
        m.childs = []; _addChild(m, childs);

        // 
        m.uniqueChildKey = function(){
            var cs = this.childs, ks = {};
            for(var i in cs) {
                if (cs[i].attrs.key != undefined && !ks.hasOwnProperty(cs[i].attrs.key)) {
                    ks[cs[i].attrs.key] = 0;
                    continue;
                }
                return false;
            }
            return true;
        }

        //
        m.update = function (nxt) {
            // 1st assumption: If tag different => redraw entire tree.
            if (m.tag != nxt.tag) 
            {            
                // Almost, if not all case it doesn't matter detach old node or attach new node first.  
                var nxtSbl = m.DOM.nextSibling || undefined;
                // life cycle of DOM
                m.beforeDetach && m.beforeDetach();
                m.parent.DOM.removeChild(m.DOM);
                m.afterDetach && m.afterDetach();
                //
                nxt.beforeAttach && nxt.beforeAttach();
                m.parent.DOM.insertBefore(nxt.DOM, nxtSbl);
                nxt.afterAttach && nxt.afterAttach();
    
                // update Lode
                m.tag = nxt.tag;
                m.attrs = nxt.attrs;
                m.events = nxt.events;
                m.childs = nxt.childs;
                m.DOM = nxt.DOM;
            } 
            else 
            {
                var adif = _diff(m.attrs, nxt.attrs);
                for (var a in adif) {
                    switch (adif[a]) {
                        case _eDiff.Add:
                        case _eDiff.Update:
                            _setAttr(m.DOM, a, nxt.attrs[a]);
                            m.attrs[a] = nxt.attrs[a];
                            break;
                        case _eDiff.Remove:
                            m.DOM.removeAttribute(a);
                            m.attrs[a] = undefined;
                            break;
                    }
                }
                var edif = _diff(m.events, nxt.events);
                for (var p in edif) {
                    switch (edif[p]) {
                        case _eDiff.Add:
                        case _eDiff.Update:
                            m.DOM.removeEventListener(p, m.events[p]);
                            _setEvent(m.DOM, p, nxt.events[p]);
                            m.events[p] = nxt.events[p];
                            break;
                        case _eDiff.Remove:
                            m.DOM.removeEventListener(p, m.events[p]);
                            m.events[p] = undefined;
                            break;
                    }
                }
                var empty = [];
                var nLen = (m.childs || empty).length;
                var nxtLen = (nxt.childs || empty).length;
    
                // diffing by key if and only if:
                // - old DOM have at least one child with key attr
                // - no duplicate child key in both old and new dom
                var keyed = nLen && m.childs[0].attrs && m.childs[0].attrs.hasOwnProperty('key') && 
                    m.uniqueChildKey() && nxt.isChildNoDuplicateKey();
                if (keyed) {
                    var frag = document.createDocumentFragment();
                    frag.appendChild(m.DOM);
                    // 2nd assumption: keyed children node diffing.
                    // old_childs = [ {key:1, Lode:..}, {key: 2, Lode:..} ]
                    // new_childs = [ {key:3, Lode:..}, {key: 1, Lode:..}, {key:2, DOM:html}]
                    var oldKeys = {}; // { 1: Lode, 2: Lode, 3: Lode}
                    var newKeys = {};
                    for(var i in m.childs) { oldKeys[m.childs[i].attrs.key] = m.childs[i]; }
                    for(var i in nxt.childs) { newKeys[nxt.childs[i].attrs.key] = nxt.childs[i]; }
    
                    // remove childs element which doesn't appear in new childs DOM
                    for(var i in oldKeys) {
                        if (!newKeys.hasOwnProperty(i)) {
                            //oldKeys[i].beforeDetach && oldKeys[i].beforeDetach();
                            m.DOM.removeChild(oldKeys[i].DOM); // remove DOM
                            //oldKeys[i].afterDetach && oldKeys[i].afterDetach();
                            m.childs.splice(m.childs.indexOf(oldKeys[i]), 1); // remove Lode
                        }
                    }
                    
                    // update or add new
                    // loop through nxt.childs because we need ordered childs
                    // if we loop through newKeys, order will be changed depend on key name.
                    for(var i in nxt.childs) {
                        var key = nxt.childs[i].attrs.key;
                        if (oldKeys.hasOwnProperty(key)) {
                            oldKeys[key].update(newKeys[key]);
                        }
                        else {
                            // add new
                            if (i == 0) { // insert at 1st position
                                m.DOM.insertBefore(newKeys[key].DOM, m.childs[0].DOM);
                            } else {
                                // insert at the middle or the last
                                //newKeys[nKey].beforeAttach && newKeys[nKey].beforeAttach();
                                m.DOM.insertBefore(newKeys[key].DOM, m.childs[i-1].DOM.nextSibling || _);
                                //newKeys[nKey].afterAttach && newKeys[nKey].afterAttach();
                            }
                            m.childs.splice(i, 0, newKeys[key]);
                        }
                    }
                    // attach
                    m.parent.DOM.appendChild(frag);
                }
                else {
                    // naively implement - iterates over both lists of children at the same time
                    if (nLen > nxtLen) {
                        var i = nLen - 1;
                        do {
                            m.DOM.removeChild(m.childs[i].DOM);
                            m.childs.splice(i, 1);
                            i--;
                        }
                        while(i > nxtLen)
                    }
                    else if (nLen < nxtLen) {
                        // add
                        for(var i=nLen; i<nxtLen; ++i) {
                            m.DOM.appendChild(nxt.childs[i].DOM);
                            m.childs.push(nxt.childs[i]);
                        }
                    }
                    // update
                    var min = nLen < nxtLen ? nLen : nxtLen;
                    for(var i=0; i<min;++i) {
                        m.childs[i].update(nxt.childs[i]);
                    }
                }            
            }
        }

        
        m.__defineSetter__('DOM', function (dom) {
            m._DOM = dom;
        });

        m.__defineGetter__('DOM', function () {
            if (m._DOM == undefined) {
                // invisible DOM, reflow won't occur.
                // DOM only render if we access it.
                // in Lode.update method, we only access to next DOM when tag change.
                // so DOM render rarely happen.
                var dom = document.createElement(m.tag || '');
                for (var a in m.attrs) _setAttr(dom, a, m.attrs[a]);
                for (var e in m.events) _setEvent(dom, e, m.events[e]);
                for (var c in m.childs) dom.appendChild(m.childs[c].DOM);
                m._DOM = dom;
            }
            return m._DOM;
        })

    }   

    // ===================================================================================
    // l stuff
    var _defaults = 'a,address,applet,area,article,aside,b,base,basefont,bdi,bgsound,big,blink,blockquote,body,br,button,caption,center,cite,code,colgroup,dd,del,details,dialog,div,dl,dt,em,embed,fieldset,figcaption,figure,font,footer,form,frame,frameset,h1,h2,h3,h4,h5,h6,head,header,hr,html,i,iframe,img,input,ins,label,legend,li,link,main,map,mark,marquee,menuitem,meta,meter,nav,nobr,noembed,noframes,noscript,object,ol,option,p,param,pre,progress,q,rb,rp,rt,ruby,s,samp,script,select,section,small,span,strike,strong,style,sub,summary,sup,table,tbody,td,time,textarea,tfoot,th,thead,title,tr,tt,u,ul,var,wbr'.split(',');
    var _lels = {};

    // lode
    var l = function (tag) {
        return (
            _defaults.includes(tag) ? 
                new Lode(tag, arguments[1], arguments[2], arguments[3]) : 
                l.l(tag, arguments[1]).Lode
        );
    };

    // lelement
    l.l = function(tag, data) {
        if (_lels.hasOwnProperty(tag)) {
            var ce = {};
            Lelement.call(ce);
            _lels[tag].call(ce);            
            ce.prop = data.prop;
            ce.state = data.state;
            return ce;
        }
        else {
            throw "Missing " + tag + " lelement";
        }
    }
    l.l.register = function (tag, ctor) {
        if (_lels.hasOwnProperty(tag) && !l.setting.overwrite)
            throw "lelement " + tag + " already exist.";
        _lels[tag] = ctor;
    }

    //
    l.setting = setting;

    // 
    l.attach = function (dom, cpn) {
        cpn.Lode.parent = { DOM: dom, childs: [cpn.Lode] };
        cpn.beforeAttach && cpn.beforeAttach();
        dom.appendChild(cpn.Lode.DOM);
        cpn.afterAttach && cpn.afterAttach();
    }
    return l;
})({ overwrite: false });