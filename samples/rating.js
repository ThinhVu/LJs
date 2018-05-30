l.c.register('tv.star', function(){
    var m = this;
    m.template = function(d) {
        return l(
            'span', 
            { class : 'star ' +  (d.rated ? 'rated' : 'unrated') },
            { click : function() { d.onRated() }});
    }
})

l.c.register('tv.rating', function(){
    var m = this;
    m.template = function(d) {
        return l('div', null, null, [0,0,0,0,0].map(function(item, index) {
            return l('tv.star', { 
                rated: index < d.score, 
                onRated : function(){
                    d.score = index + 1;
                    m.redraw();
                }
            })
        }));
    }
})

window.onload = function() {
    var ratingStar = l.c('tv.rating', { score : 3 });
    l.attach(this.document.getElementById('app'), ratingStar)
}