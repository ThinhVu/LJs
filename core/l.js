/**
 * Create new Lode
 * @param {string} tag 
 * @param {object} attrs 
 * @param {object} events 
 * @param {Lode[] || null} childs 
 */
var l = function (tag, attrs, events, childs) {
    var cpn = {};
    // add methods: 'f5, template, ...
    Lode.call(cpn, tag, attrs, events, childs);
    // update specified template
    _templates[tag].call(cpn);
    return cpn;
};

/**
 * Register new Lode with Lode management system
 * @param {string} tag : Lode alias
 * @param {function} lodeCtor : function define a class of Lode.
 */
l.register = function (tag, lodeCls) {
    if (_templates.hasOwnProperty(tag))
        throw tag + ' existed. Cannot overwrite.';
    _templates[tag] = lodeCls;
}

/**
 * Attach Lode to live DOM
 * @param {HTMLElement} dom 
 * @param {*} vdom 
 */
l.attach = function (dom, lode) {
    lode.parent = { childs: [lode], VDOM: { DOM: dom, childs: [lode.VDOM] } };
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