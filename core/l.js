/**
 * Create new Lode
 * @param {string} tag 
 * @param {object} attrs 
 * @param {object} events 
 * @param {Lode[] || null} childs 
 */
var l = function (tag, attrs, events, childs) {
    var lodeInstance = {};
    // invoke base constructor
    Lode.call(lodeInstance, tag, attrs, events, childs);
    // invoke specified constructor
    _lodeCtors[tag].call(lodeInstance);
    var lodeInstanceVDOM = lodeInstance.VDOM;
    return lodeInstance;
};

/**
 * Register new Lode with Lode management system
 * @param {string} tag : Lode alias
 * @param {function} lodeCtor : function define a class of Lode.
 */
l.register = function (tag, lodeCtor) {
    // define specified constructor
    if (_lodeCtors.hasOwnProperty(tag))
        throw tag + ' existed. Cannot overwrite.';
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

// register default tags    
for (var i = 0; i < _tags.length; ++i) {
    (function (tag) {
        l.register(tag, function () {
            this.template = function (attrs, events, childs) {
                return new Lode(tag, attrs, events, childs);
            }
        })
    })(_tags[i]);
}