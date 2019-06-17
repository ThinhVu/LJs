/**
 * Create new Lode
 * @param {string} tag 
 * @param {object} attrs 
 * @param {object} events 
 * @param {Lode[] || null} childs 
 */
var l = function (tag, data, childs) {
    if (_isNativeElement(tag) || _isCustomElement(tag)) {
        var lodeCtor = _lodeCtors[tag];
        var lodeInstance = {};
        // invoke base constructor
        Lode.call(lodeInstance, tag, childs);
        // invoke its constructor
        lodeCtor.call(lodeInstance);
        // validate provided data
        lodeInstance.addData(data);
        // initialize VDOM
        var lodeInstanceVDOM = lodeInstance.VDOM;
        // 
        return lodeInstance;
    }
    else {
        throw "'" + tag + "' element is not existed!";
    }
};

/**
 * Register new Lode with Lode management system
 * @param {string} tag : Lode alias
 * @param {function} lodeCtor : function define a class of Lode.
 */
l.register = function (tag, lodeCtor) {
    // define specified constructor
    if (_lodeCtors.hasOwnProperty(tag))
        console.log('overwriting existed component: ' + tag);
    _lodeCtors[tag] = lodeCtor;
}

/**
 * Attach Lode to live DOM
 * @param {HTMLElement} dom 
 * @param {*} vdom 
 */
l.attach = function (dom, lode) {
    var parentLode = { childs: [lode], VDOM: { DOM: dom, childs: [lode.VDOM] } };
    lode.parent = parentLode;
    lode.VDOM.parent = lode.parent.VDOM;
    dom.appendChild(lode.VDOM.DOM);
}

var getElementProperties = function(tag) {
    var elAttrs = [];
    var elEvents = [];

    if (tag !== '') {
        // closure???
        // prepare attrs, events for native element
        var el = document.createElement(tag);
        
        for(var prop in el) {
            if (prop.startsWith('on') && prop.length > 2) {
                elEvents.push(prop);
            }
            else {
                elAttrs.push(prop);
            }
        }
    }
    
    return {
        attrs: elAttrs,
        events: elEvents
    }
}

// register default tags    
for (var i = 0; i < _tags.length; ++i) {
    (function (tag) {
        var elementProps = getElementProperties(tag);

        l.register(tag, function () {
            this.getAttributeNames = function() {
                return elementProps.attrs;
            };

            this.getEventNames = function() {
                return elementProps.events;
            };

            this.template = function (childs) {
                return new Lode(tag, childs);
            }
        })
    })(_tags[i]);
}

// create text node
var lt = function(text) {
    return l('', { text: text });
}