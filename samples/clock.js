l.register('tv.clock', function() {
    var m = this;
    Component.call(m);
    
    this.template = function(data) {
        return l('span', null, null, [new Date().toLocaleTimeString()])
    }

    // at the moment, life cycle methods are not supported.

    var itvId;
    this.start = function() {
        itvId = setInterval(function() {
            m.redraw()
        }, 1000);
    }

    this.stop = function() {
        clearInterval(itvId);
    }
});


l.register('tv.app', function(){
    var m = this;
    Component.call(m);
    
    this.template = function() {
        var clock = l('tv.clock');
        var start = l('button', null, {
            click: function(){
                clock.component.start();
            }
        }, ['Start']);
        var stop = l('button', null, {
            click: function() {
                clock.component.stop();
            }
        }, ['Stop']);

        return l('div', null, null, [clock, start, stop])
    }
})

window.onload = function() {    
    var app = l('tv.app').component;
    l.attach(this.document.getElementById('app'), app)
}