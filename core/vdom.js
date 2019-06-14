var _isCustomElement = function(dom) {
    return _tags.indexOf(dom.tagName.toLowerCase()) < 0;
}

// add/remove attribute
var _assignRequiredAttrs = [ 'value' ];
var _setAttr = function (dom, name, attr) {
    // skip adding attribute for component element
    if (_isCustomElement(dom))
        return;
    // check if directly assign is the only way to change the dom attribute
    if (_assignRequiredAttrs.indexOf(name) >= 0) {
        dom[name] = attr;
    }
    else { // otherwise using setAttribute
        dom.setAttribute(name, attr);
    }
}
var _removeAttr = function(dom, name) {
    dom.removeAttribute(name);
}

// event add/remove
var _addEvent = function(dom, name, ev) {
    if (_isCustomElement(dom)) 
        return;
    dom.addEventListener(name, ev);
}
var _removeEvent = function(dom, name, ev) {
    dom.removeEventListener(name, ev);
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
function VDOM(tag, attrs, events, childs) {
    var m = this, _DOM = undefined;
    m.tag = tag || ''; // tag or text node
    if (attrs != undefined) {
        m.attrs = attrs;
    }   
    if (events != undefined) {
        m.events = events;
    }
    if (childs != undefined) {
        m.childs = [];
        for(var i in childs) {
            childs[i].parent = m;
            m.childs.push(childs[i]);
        }
    }

    m.__defineSetter__('DOM', function (dom) {
        _DOM = dom;
        _DOM.VDOM = this;
    });
    m.__defineGetter__('DOM', function () {
        if (_DOM == undefined) {
            if (this.tag === '') {
                // text VDOM
                _DOM = document.createTextNode(this.attrs.text);
            }
            else {
                // tag vdom
                _DOM = document.createElement(this.tag);
                // only add the attributes & events for native dom element
                // otherwise, skip
                if (_tags.indexOf(tag) > 0) {
                    for (var a in this.attrs) _setAttr(_DOM, a, this.attrs[a]);
                    for (var e in this.events) _addEvent(_DOM, e, this.events[e]);
                }
                for (var c in this.childs) _DOM.appendChild(this.childs[c].DOM);
            }
            _DOM.VDOM = this;
        }
        return _DOM;
    });

    //
    m.update = function (nxt) {
        if (m.tag == '' && nxt.tag == '') { // text node
            // text node contains attrs object with text property
            if (m.attrs.text !== nxt.attrs.text)
                m.DOM.data = nxt.DOM.data;
        }
        else if (m.tag != nxt.tag) { // if not
            // 1st assumption: If tag different => f5 entire tree.            
            // Almost, if not all case it doesn't matter detach old node or attach new node first.  
            var nxtSbl = m.DOM.nextSibling || undefined;

            m.parent.DOM.removeChild(m.DOM);
            m.parent.DOM.insertBefore(nxt.DOM, nxtSbl);
            
            m.tag = nxt.tag;
            m.attrs = nxt.attrs;
            m.events = nxt.events; // TODO: events should bind to context of Lode
            m.childs = nxt.childs;
            m.DOM = nxt.DOM;
        }
        else {
            var adif = _diff(m.attrs, nxt.attrs);
            for (var a in adif) {
                switch (adif[a]) {
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
            var edif = _diff(m.events, nxt.events);
            for (var p in edif) {
                switch (edif[p]) {
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

            var empty = [];
            var nLen = (m.childs || empty).length;
            var nxtLen = (nxt.childs || empty).length;

            if (nLen > nxtLen) {
                var i = nLen - 1;
                do {
                    m.DOM.removeChild(m.childs[i].DOM);
                    m.childs.splice(i, 1);
                    i--;
                }
                while (i > nxtLen)
            }
            else if (nLen < nxtLen) {
                // add
                for (var i = nLen; i < nxtLen; ++i) {
                    m.DOM.appendChild(nxt.childs[i].DOM);
                    m.childs.push(nxt.childs[i]);
                }
            }
            // update
            var min = nLen < nxtLen ? nLen : nxtLen;
            for (var i = 0; i < min; ++i) {
                m.childs[i].update(nxt.childs[i]);
            }
        }
    }
}