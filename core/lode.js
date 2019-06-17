/**
 * @class
 * @constructor
 * @param {string} tag: a string specified Lode name.
 * @param {Lode || Lode[] || Lode[Lode[...]]} childs: a Lode array, Lode will flatten childs
 */
function Lode(tagName, childs /* for nested-component */) {
    var m = this;

    // abstract methods
    m.getAttributeNames = function() { throw "Not implemented!" };
    m.getEventNames = function() { throw "Not implmented!" };
    m.template = function (childs) { throw "Not impl" };

    // initial custom element
    // tagName
    m.tagName = tagName;
    
    // attr, event
    m.attrs = {};
    m.events = {};
    // validate input data
    m.addData = function(data) {
        if (_isTextNode(tagName)) {
            m.attrs.text = data.text;
        }
        else {
            var attrNames = m.getAttributeNames();
            var eventNames = m.getEventNames();
            // validate data
            // native element always ignore attr, event if you don't define it
            // so we only validate for custom element
            // and we also have an option to ignore attrs, events for custom element too.
            // see l.configuration()
            if (_isCustomElement(m.tagName)) {
                for (var i=0; i<attrNames.length; ++i) {
                    if (!data.hasOwnProperty(attrNames[i])) {
                        throw "Attribute '" + attrNames[i] + "' is missing in '" + tagName + "' element.";
                    }
                }
                for (var i=0; i<eventNames.length; ++i) {
                    if (!data.hasOwnProperty(eventNames[i])) {
                        throw "Event '" + eventNames[i] + "' is missing in '" + tagName + "' element";
                    }
                }
            }

            // add data into attributes and events
            for(var prop in data) {
                if (attrNames.indexOf(prop) >= 0) {
                    m.attrs[prop] = data[prop];
                }
                else if (eventNames.indexOf(prop) >= 0) {
                    m.events[prop] = data[prop];
                }
            }
        }
    }

    // childs
    if (childs !== undefined) {
        m.childs = [].concat.apply([], [childs]);
    }
    else {
        m.childs = [];
    }

    // VDOM
    var _VDOM = undefined;
    /**
     * Get correspond Virtual DOM tree
     */
    Object.defineProperty(this, 'VDOM', {
        get: function () {
            if (_VDOM == undefined) {
                _VDOM =  m.toVDOM();
            }
            return _VDOM;
        },
        set: function (value) {
            if (value.Lode != m) {
                value.Lode = m;
            }
            _VDOM = VDOM;
        }
    });
    
    /**
     * Method help user define the GUI of current Lode in LodeTree
     * This LodeTree will be wrap by a <LodeTag> element
     * @method
     * @param {object} attrs: an object contain custom attribute of current Lode
     * @param {object} events: an object contain custom event of current Lode
     * @param {Lode[]} childs: a Lode array
     * @returns {Lode} a Lode tree
     */
    m.toVDOM = function() {
        var vdom;
        if (_isNativeElement(m.tagName)) {
            vdom = new VDOM(m.tagName, m.attrs, m.events, getChildrenVDOM(m.childs));
        } else {
            var nestedLodeTree = m.template(m.childs || []);
            var nestedVdomTree = new VDOM(
                nestedLodeTree.tagName, 
                nestedLodeTree.attrs, 
                nestedLodeTree.events,
                getChildrenVDOM(nestedLodeTree.childs));
            
            nestedLodeTree.VDOM = nestedVdomTree;
            // Lode VDOM
            vdom = new VDOM(m.tagName, m.attrs, m.events, [nestedVdomTree]);
        }
        vdom.Lode = m;
        return vdom;
    }

    var getChildrenVDOM = function(childrens /* Lode[] */) {
        return childrens.map(function(lode) { 
            return lode.toVDOM();
        });
    };

    /**
     * Refresh component, update changed to DOM
     */
    m.f5 = function (data) {
        m.addData(data);
        if (_VDOM == undefined) {
            _VDOM = m.toVDOM();
        }
        else {
            var vdomNxt = m.toVDOM();
            _VDOM.update(vdomNxt);
        }
    }
}