l.register('tv.star', function(){
    var m = this;
    m.template = function(d) {
        return l(
            'span', 
            { class : 'star ' +  (d.rated ? 'rated' : 'unrated') },
            { click : function() { d.onRated() }});
    }
})

l.register('tv.rating.star', function(){
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
    var ratingStar = l('tv.rating.star', { score : 3 });
    l.attach(
        this.document.getElementById('app'), 
        ratingStar.component)
}