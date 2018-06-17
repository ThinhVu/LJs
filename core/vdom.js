var _attrs = { 'value': 'value' };
var _setAttr = function (dom, name, val) {
    if (_attrs.hasOwnProperty(name))
        dom[_attrs[name]] = val;
    else
        dom.setAttribute(name, val);
}

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
    if (attrs != undefined) m.attrs = attrs;
    if (events != undefined) m.events = events;
    if (childs != undefined) m.childs = childs;

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
                _DOM = document.createElement(this.tag || '');
                for (var a in this.attrs) _setAttr(_DOM, a, this.attrs[a]);
                for (var e in this.events) _DOM.addEventListener(e, this.events[e].bind(this.Lode));
                for (var c in this.childs) _DOM.appendChild(this.childs[c].DOM);
            }
            _DOM.VDOM = this;
        }
        return _DOM;
    })

    //
    m.update = function (nxt) {
        if (m.tag == '' && nxt.tag == '') { // text node
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
                        m.DOM.removeAttribute(a);
                        m.attrs[a] = undefined;
                        break;
                }
            }
            var edif = _diff(m.events, nxt.events);
            for (var p in edif) {
                switch (edif[p]) {
                    case Changes.Create:
                    case Changes.Update:
                        m.DOM.removeEventListener(p, m.events[p]);
                        m.events[p] = nxt.events[p].bind(m.Lode);
                        m.DOM.addEventListener(p, m.events[p]);
                        break;
                    case Changes.Delete:
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
                _uniqueChildKey(m) && _isChildNoDuplicateKey(nxt);
            if (keyed) {
                var frag = document.createDocumentFragment();
                frag.appendChild(m.DOM);
                // 2nd assumption: keyed children node diffing.
                // old_childs = [ {key:1, VDOM:..}, {key: 2, VDOM:..} ]
                // new_childs = [ {key:3, VDOM:..}, {key: 1, VDOM:..}, {key:2, DOM:html}]
                var oldKeys = {}; // { 1: VDOM, 2: VDOM, 3: VDOM}
                var newKeys = {};
                for (var i in m.childs) { oldKeys[m.childs[i].attrs.key] = m.childs[i]; }
                for (var i in nxt.childs) { newKeys[nxt.childs[i].attrs.key] = nxt.childs[i]; }

                // remove childs element which doesn't appear in new childs DOM
                for (var i in oldKeys) {
                    if (!newKeys.hasOwnProperty(i)) {
                        m.DOM.removeChild(oldKeys[i].DOM); // remove DOM
                        m.childs.splice(m.childs.indexOf(oldKeys[i]), 1); // remove VDOM
                    }
                }

                // update or add new
                // loop through nxt.childs because we need ordered childs
                // if we loop through newKeys, order will be changed depend on key name.
                for (var i in nxt.childs) {
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
                            m.DOM.insertBefore(newKeys[key].DOM, m.childs[i - 1].DOM.nextSibling || _);
                        }
                        m.childs.splice(i, 0, newKeys[key]);
                    }
                }
                // attach
                m.parent.DOM.appendChild(frag);
            }
            else {
                // naively implement
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
}