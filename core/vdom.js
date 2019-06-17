var VDOM = (function() {
    // add/remove attribute
    var _setAttr = (function(){
        // update attribute by setAttribute doesn't work for some specified attribute
        // for example 'value'
        // to change the attribute, we need to assign it directly into the object.
        var _assignRequiredAttrs = [ 'value' ];

        return function (dom, name, attr) {
            // skip adding attribute for custom element
            if (_isCustomElement(dom.tagName.toLowerCase()))
                return;
            // check if directly assign is the only way to change the dom attribute
            if (_assignRequiredAttrs.indexOf(name) >= 0) {
                dom[name] = attr;
            }
            else { // otherwise using setAttribute
                dom.setAttribute(name, attr);
            }
        }
    })();
    var _removeAttr = function(dom, name) {
        dom.removeAttribute(name);
    }
    
    // event add/remove
    var _addEvent = function(dom, name, ev) {
        if (_isCustomElement(dom.tagName.toLowerCase())) 
            return;
        dom.addEventListener(_getEventName(name), ev);
    }
    
    var _removeEvent = function(dom, name, ev) {
        dom.removeEventListener(_getEventName(name), ev);
    }

    var _getEventName = function(fullyEventName) {
        return fullyEventName.substr(2);
    }

    // diffing
    var Changes = { None: 0, Create: 1, Update: 2, Delete: 3 };
    var _diff = function (now, nxt) {
        var ps = {};
        for (var p in now) {
            ps[p] = (!nxt.hasOwnProperty(p)) ? Changes.Delete :
                    (nxt[p] == now[p]) ? Changes.None : Changes.Update;
        }
        for (var p in nxt) {
            if (!now.hasOwnProperty(p))
                ps[p] = Changes.Create;
        }
        return ps;
    }

    /**
     * Ensure all item in object array has key property with unique value
     * @param {object} objs 
     */
    var _uniqueChildKey = function (objs /*object[]*/) {
        var ks = {};
        for (var i in objs) {
            if (objs[i].attrs == undefined) return false; // no attr
            if (objs[i].attrs.key == undefined) return false; // no-key
            if (ks.hasOwnProperty(objs[i].attrs.key)) return false; // duplicate key
            ks[objs[i].attrs.key] = 0; // store key for next check
        }
        return true;
    }

    /**
     * @class
     * @constructor
     * @param {string} tag 
     * @param {object} attrs 
     * @param {object} events 
     * @param {VDOM[]} childs 
     */
    function _ctor(tag, attrs, events, childs) {
        var m = this;
        m.tag = tag || '';
        m.attrs = attrs || {}; 
        m.events = events || {};
        m.childs = [];
        if (undefined != childs) {
            for(var i in childs) {
                childs[i].parent = m;
                m.childs.push(childs[i]);
            }
        }

        var _DOM;
        Object.defineProperty(this, 'DOM', {
            get: function() {
                // create if DOM is not defined yet
                if (_DOM == undefined) {
                    if ('' == this.tag) { // text VDOM
                        _DOM = document.createTextNode(this.attrs.text || '');
                    }
                    else {
                        // tag vdom
                        _DOM = document.createElement(this.tag);
                        // only add the attributes & events for natives dom element
                        // otherwise, skip
                        if (_isNativeElement(tag)) {
                            for (var a in this.attrs) {
                                _setAttr(_DOM, a, this.attrs[a]);
                            }
                            for (var e in this.events) {
                                _addEvent(_DOM, e, this.events[e]);
                            }
                        }
                        for (var c in this.childs) {
                            _DOM.appendChild(this.childs[c].DOM);
                        }
                    }
                    // link the DOM to VDOM
                    _DOM.VDOM = this;
                }

                return _DOM;
            },
            set: function(value) {
                if (this != value.VDOM) {
                    value.VDOM = this;
                }
                _DOM = value;
            }
        });

        //
        m.update = function (nxt) {
            if (m.tag == '' && nxt.tag == '') {
                // text node contains attrs object with text property
                if (m.attrs.text !== nxt.attrs.text) {
                    m.DOM.data = nxt.DOM.data;
                }
            }
            else if (m.tag != nxt.tag) { // 1st assumption: If tag different => f5 entire tree. 
                var nxtSbl = m.DOM.nextSibling || undefined;

                m.parent.DOM.removeChild(m.DOM);
                m.parent.DOM.insertBefore(nxt.DOM, nxtSbl);

                m.tag = nxt.tag;
                m.attrs = nxt.attrs;
                m.events = nxt.events;
                m.childs = nxt.childs;
                m.DOM = nxt.DOM;
            }
            else { // same tag
                // => diff attributes
                var attrDiffs = _diff(m.attrs, nxt.attrs);
                for (var a in attrDiffs) {
                    switch (attrDiffs[a]) {
                        case Changes.Create:
                        case Changes.Update:
                            _setAttr(m.DOM, a, nxt.attrs[a]);
                            m.attrs[a] = nxt.attrs[a];
                            break;
                        case Changes.Delete:
                            _removeAttr(m.DOM, a);
                            m.attrs[a] = undefined;
                            break;
                    }
                }

                // => diff events
                var eventDiffs = _diff(m.events, nxt.events);
                for (var p in eventDiffs) {
                    switch (eventDiffs[p]) {
                        case Changes.Create:
                        case Changes.Update:
                            _removeEvent(m.DOM, p, m.events[p]);
                            m.events[p] = nxt.events[p];
                            _addEvent(m.DOM, p, m.events[p]);
                            break;
                        case Changes.Delete:
                            _removeEvent(m.DOM, p, m.events[p]);
                            m.events[p] = undefined;
                            break;
                    }
                }

                // => diff childrens
                var empty = [];
                var nLen = (m.childs || empty).length;
                var nxtLen = (nxt.childs || empty).length;

                if (nLen > nxtLen) {
                    // in case next childrens less than current childrens 
                    // => childrens has been removed
                    // remove the childrens in the last position
                    var i = nLen - 1;
                    do {
                        m.DOM.removeChild(m.childs[i].DOM);
                        m.childs.splice(i, 1);
                        i--;
                    }
                    while (i > nxtLen)
                }
                else if (nLen < nxtLen) {
                    // in case next childrens greater than current childrens
                    // => new childrens has been added
                    // add the childrens
                    for (var i = nLen; i < nxtLen; ++i) {
                        m.DOM.appendChild(nxt.childs[i].DOM);
                        m.childs.push(nxt.childs[i]);
                    }
                }
                // update the childrens
                for (var i = 0, min = Math.min(nLen, nxtLen); i < min; ++i) {
                    m.childs[i].update(nxt.childs[i]);
                }
            }
        }
    }

    return _ctor;
})();