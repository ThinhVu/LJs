var l = (function () {
    var mStorage = {
        // primitive elements - array
        els: 'a,address,applet,area,b,base,basefont,bgsound,big,blink,blockquote,body,br,button,caption,center,cite,code,colgroup,dd,del,div,dl,dt,em,embed,fieldset,font,form,frame,frameset,h1,h2,h3,h4,h5,h6,head,hr,html,i,iframe,img,input,ins,label,legend,li,link,map,marquee,meta,nobr,noembed,noframes,noscript,object,ol,option,p,param,pre,q,rb,rp,rt,ruby,s,samp,script,select,small,span,strike,strong,style,sub,sup,table,tbody,td,textarea,tfoot,th,thead,title,tr,tt,u,ul,var'.split(','),
        // store component class
        cels: {}
    }

    /**
     * Create VDOM object
     * 
     * @param {string} tag 1st param - VDOM tag name
     * !Important: tag can be html tag or custom tag.
     * 
     * If tag is html tag
     * @param {object} attrs (pass null if not set) - 2nd param.
     * @param {object} events (pass null if not set) - 3rd param.
     * @param {object} childs (pass null if not set) - 4th param.
     * 
     * If tag is custom tag
     * @param {object} data (pass null if not set) 2nd param - use if custom tag.
     */
    var l = function (tag) {
        if (mStorage.els.includes(tag))
            return new VDOM(tag, arguments[1], arguments[2], arguments[3])
        else if (mStorage.cels.hasOwnProperty(tag)) {
            // It's suck!
            // All I want is it just a view. Not link to any component.
            // But if its only link to the view, we cannot reuse logic of this component.
            var component = new mStorage.cels[tag]();
            component.init(arguments[1]/*data object*/);
            return component.VDOM;
        }
        else
            throw 'VDOM ' + tag + " doesn't exist.";
    };

    
    /**
     * Register custom component to l system.
     * 
     * @param {string} tag : component tag
     * !Important about tag:
     * - "a", "div",... or any html tag is invalid.
     * - "todo", "to-do", "todo_", "to do", "anything but not html tag", ... are valid.
     * 
     * Set tag name as a namespace can reduce alot of conflict. E.g:
     * 'com.company.project.component'
     * 
     * @param {*} componentFactory : a class which inherited from Component class,
     * define template method which return VDOM.
     */    
    l.register = function (tag, componentFactory) {
        mStorage.cels[tag] = componentFactory;
    }

    /**
     * Host specified component in DOM
     * 
     * @param {HTMLElement} dom Root node will be use to host component 
     * @param {Component} component A component will be host
     */
    l.attach = function(dom, component) {
        component.VDOM.parent = { DOM : dom };
        dom.appendChild(component.VDOM.DOM);
    }

    return l;
})();

function VDOM(tag /*:string*/, attrs /*:object*/, events /*:object*/, childs /*Array<primtive|VDOM>*/) {
    var m = this;   // selft reference    
    // make debug better   
    if (tag != null) m.tag = tag;
    if (attrs != null) m.attrs = attrs;
    if (events != null) m.events = events;
    if (childs != null && childs.length != 0) {
        m.childs = [];
        childs = childs || [];
        for (var i = 0; i < childs.length; ++i) {
            var vd = childs[i];
            // if child is not VDOM then convert it to VDOM
            if (!(typeof vd === 'object' && vd.DOM !== 0)) // childs check
                vd = { DOM: document.createTextNode(childs[i]), text: childs[i] /*easier for debug*/ }        
            vd.parent = m;
            m.childs.push(vd);
        }
    }    
    
    var mDOM = 0; // by pass undefined in childs check
    // defer create DOM object
    m.__defineGetter__('DOM', function () {
        if (mDOM === 0) {
            mDOM = document.createElement(tag || '');
            for (var a in m.attrs)
                mDOM.setAttribute(a, m.attrs[a]);
            for (var e in m.events)
                mDOM.addEventListener(e, m.events[e]);
            for (var c in m.childs)
                mDOM.appendChild(m.childs[c].DOM)
        }
        return mDOM;
    })
    m.__defineSetter__('DOM', function (DOM) {
        mDOM = DOM
    })
}

// deep copy
function _deepCopy(origin /*:object | Array | primitive*/) {
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
        return origin; // primitive, function
}

// detect change of 2 object
// returned object with all prop of both 2 object.
// and value of each key will be: (0) unchange, (1) add, (2) remove, (3) update
function _diff(now /*object*/, next /*object*/) {
    // add all prop to ps object
    var ps = {}
    for (var p in now)
        ps[p] = 0;
    for (var p in next)
        ps[p] = 0;
    // diff
    for (var p in ps) {
        if (!now.hasOwnProperty(p)) // now not have, next have => add
            ps[p] = 1;
        else if (!next.hasOwnProperty(p)) // now have, next not have => remove
            ps[p] = 2;
        else if (now[p] !== next[p]) // otherwise, depend on value, it will be update or unchange.
            ps[p] = 3;
    }
    return ps;
}


/**
 * 
 * @param {VDOM} oVD : Is a VDOM, DOM element of this VDOM already mounted to document object 
 * @param {*} nVD : Is a new VDOM, DOM element of this VDOM is not linked to document object
 * @param {*} prVD : Is a parent VDOM, DOM element of this VDOM already mounted to document object.
 * @param {*} index : Index of oVD in prVD.childs
 *
 * _update function update both VDOM and DOM
 */
function _update(oVD /*:VDOM*/, nVD /*:VDOM*/, prVD /*parent:VDOM*/, index /*index of oVD:int*/) {
    var DOM1 = oVD.DOM;   // mounted DOM
    if (oVD.tag != nVD.tag) {
        // in case entire element change, unmount DOM1, mount new DOM
        try {
            prVD.DOM.insertBefore(nVD.DOM, DOM1.nextSibling || undefined);
            prVD.DOM.removeChild(DOM1);
        } catch(e){
            console.log(e);
        }

    } else {
        // in case some prop changes, update DOM1, link nVD to DOM1.
        if (oVD.tag == undefined && nVD.tag == undefined) { // text node  
            if (DOM1.data != nVD.DOM.data)  
                DOM1.data =nVD.DOM.data
        }
        else { // HTMLElement
            var adif = _diff(oVD.attrs, nVD.attrs);
            // 1.1) update attr
            for (var a in adif) {
                switch (adif[a]) {
                    case 1: // add
                    case 3: // update      
                        // 1) add/update DOM attr                  
                        // setAttribute value,... will not take any affect to HTMLElement
                        // so we need change it directly by property value
                        if (a == 'value')
                            DOM1['value'] = nVD.attrs[a];
                        else
                            DOM1.setAttribute(a, nVD.attrs[a]);
                        // 2) add/update VDOM attr
                        oVD.attrs[a] = nVD.attrs[a];
                        break;
                    case 2: // remove
                        // remove DOM attr
                        DOM1.removeAttribute(a);
                        // remove VDOM attr
                        oVD.attrs[a] = undefined;
                        break;
                }
            }

            // 2) compare events
            // 2.2) update events
            var eventDiff = _diff(oVD.events, nVD.events);
            for (var p in eventDiff) {
                switch (eventDiff[p]) {
                    case 1: // add
                    case 3: // update                                       
                        // Simple trick, does it's a bug?
                        if (oVD.events[p].toString() != nVD.events[p].toString()) {
                            // unlink event first, if not, events will be stacked
                            DOM1.removeEventListener(p, oVD.events[p]);
                            DOM1.addEventListener(p, nVD.events[p])
                            // VDOM
                            oVD.events[p] = nVD.events[p];
                        }
                        break;
                    case 2: // remove
                        // DOM           
                        DOM1.removeEventListener(p, oVD.events[p])
                        // VDOM
                        oVD.events[p] = undefined;
                        break;
                }
            }

            // 3) compare childs
            // 3.2) update childs
            // unkeyed diff
            // TODO: apply keyed diff to reduce DOM changes
            var oChildLen = oVD.childs != undefined ? oVD.childs.length : 0;
            var nChildLen = nVD.childs != undefined ? nVD.childs.length : 0;
            var maxChildLen = oChildLen > nChildLen ? oChildLen : nChildLen;
            for (var i = maxChildLen; i > 0; i--) {
                if (i > oChildLen) {
                    // add  
                    DOM1.appendChild(nVD.childs[i - 1].DOM);

                    oVD.childs.push(nVD.childs[i - 1]);
                } else {
                    // update or remove
                    if (i > nChildLen) {
                        // remove                        
                        var childi = DOM1.childNodes[i - 1];
                        DOM1.removeChild(childi);

                        oVD.childs.splice(i - 1, 1);
                    } else {
                        // update
                        var ochildi = oVD.childs[i - 1];
                        var nchildi = nVD.childs[i - 1];
                        _update(ochildi, nchildi, oVD, i - 1);
                    }
                }
            }

            // link to DOM1
            nVD.DOM = DOM1;
        }

        // update VDOM
        prVD.childs[index] = nVD;
    }
}

function Component() {
    var m = this;    
    m.init = function (data) { m.data = data || {} }

    // vdom
    var mVDOM = null;

    var _initVDOM = function() {
        mVDOM = m.template(m.data);
        mVDOM.component = m;
    }

    m.__defineGetter__('VDOM', function(){
        if (mVDOM == null) 
            _initVDOM();
        return mVDOM;
    })

    m.__defineSetter__('VDOM', function(vdom){mVDOM = vdom })

    m.redraw = function () {
        if (mVDOM == null)
            _initVDOM() // 1st revision
        else            
            _update(mVDOM, m.template(m.data), mVDOM.parent, 0) // compare VDOM current and next revision
    }
    /**
     * Generate virtual DOM from specified template
     */
    m.template = function () {
        throw "Not implemented exception";
    }
}