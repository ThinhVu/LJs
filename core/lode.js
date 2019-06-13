/**
 * @class
 * @constructor
 * @param {string} tag: a string specified Lode name.
 * @param {object} attrs: an object contain custom attribute of Lode
 * @param {object} events: an object contain custom event handler methods with context of Lode and 1st param is Event object
 * @param {Lode || Lode[] || Lode[Lode[...]]} childs: a Lode array, Lode will flatten childs
 */
function Lode(tag, attrs, events, childs) {
    var m = this;
    m.tag = tag;
    m.attrs = attrs;
    m.events = events;
    // flaten childs    
    m.childs = [].concat.apply([], [childs]);
    // eliminate null or undefined
    var i = 0;
    while(i < m.childs.length) {
        if (m.childs[i] == null)
            m.childs.splice(i, 1);
        else
            i++;
    }

    var _VDOM = undefined;
    /**
     * Refresh component, update changed to DOM
     */
    m.f5 = function () {
        if (_VDOM == undefined) {
            _VDOM = m.toVDOM();
        }
        else {
            var vdomNxt = m.toVDOM();
            _VDOM.update(vdomNxt);
        }
    }
    /**
     * Get correspond Virtual DOM tree
     */
    m.__defineGetter__('VDOM', function () {
        if (_VDOM == undefined) {
            _VDOM =  m.toVDOM();
        }
        return _VDOM;
    });
    /**
     * Set virtual DOM
     */
    m.__defineSetter__('VDOM', function (VDOM) {
        if (VDOM.Lode != m)
            VDOM.Lode = m;
        _VDOM = VDOM;
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
    m.template = function (attrs, events, childs) { throw "Not impl" };
    m.toVDOM = function() {
        var vdom;        
        if (_tags.includes(this.tag)) {
            // for html tag
            vdom = new VDOM(m.tag, m.attrs, m.events, (m.childs || []).map(function(lode){ return lode.toVDOM()}));            
        } else {
            // custom tag
            // nested VDOM
            var nestedLodeTree = m.template(m.attrs, m.events, m.childs || []);
            var nestedVdomTree = new VDOM(
                nestedLodeTree.tag, 
                nestedLodeTree.attrs, 
                nestedLodeTree.events,
                nestedLodeTree.childs.map(function(lode){ return lode.toVDOM() }));
            
            nestedLodeTree.VDOM = nestedVdomTree;
            // Lode VDOM
            vdom = new VDOM(m.tag, m.attrs, m.events, [nestedVdomTree]);
        }
        vdom.Lode = m;
        return vdom;
    }
}