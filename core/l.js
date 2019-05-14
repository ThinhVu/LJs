/**
 * Create new Lode
 * @param {string} tag 
 * @param {object} attrs 
 * @param {object} events 
 * @param {VDOM[] || null} childs 
 */
var l = function (tag, attrs, events, childs) {
    return _templates[tag](attrs, events, childs);
};

/**
 * Register new Lode with Lode management system
 * @param {string} tag : Lode alias
 * @param {function} customTemplate : function define a class of vdom.
 */
l.register = function (tag, customTemplate) {
    _templates[tag] = customTemplate;
}

/**
 * Attach Lode to live DOM
 * @param {HTMLElement} dom 
 * @param {*} vdom 
 */
l.attach = function (dom, vdom) {
    vdom.parent = { DOM : dom, childs: [vdom] };  
    dom.appendChild(vdom.DOM);
}

// register default tags
for (var i = 0; i < _tags.length; ++i) {
    (function (tag) {
        l.register(tag, function (attrs, events, childs) {
            return new VDOM(tag, attrs, events, childs);
        })
    })(_tags[i]);
}