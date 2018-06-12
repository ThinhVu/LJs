// pin-img-ctx-menu
l.l.register('pin-img-ctx-menu', function(){
    var m = this, _ = null;
    m.template = function() {        
        return l('ul', {
            id: m.prop.id,
            class: 'pin-img-ctx-menu',
            style: 'top: ' + (m.state.hidden? -999: (m.prop.top || 0)) + 'px; left:' +   (m.prop.left || 0) + 'px'       
        }, {
            mouseleave: function(e) {                
                m.setState({hidden: true })
                e.preventDefault();
            }
        }, [
            l('li', _, _, 'Download'),
            l('li', _, _, 'Share'),
            l('li', _, _, 'Report'),
        ])
    }
})

// pin image
l.l.register('pin-image', function () {
    var m = this, _ = null;
    m.template = function () {
        return l('div', { class: 'pin-image' }, _, [
            l('img', { src: m.prop.src }),           
            l('span', { class: 'menu' }, {
                click: function(e){
                    m.setState({ 
                        ctxTop: e.clientY,
                        ctxLeft: e.clientX,
                        ctxHidden: false
                    })
                }
            }, 
            l('img', { src: m.prop.menuIcon })),
            l('pin-img-ctx-menu', { 
                prop: { 
                    id: m.prop.id, 
                    top: m.state.ctxTop, 
                    left: m.state.ctxLeft 
                }, 
                state: { 
                    hidden: m.state.ctxHidden 
                } 
            })
        ]);
    }
})

// pin-image-list
l.l.register('pin-image-list', function () {
    var m = this, _ = null;
    m.template = function () {
        return l('div', _, _, m.prop.images.map(function (item, index) {
            return l('pin-image', { 
                prop: { id: index, src: item, menuIcon: m.prop.menuIcon }, 
                state: { shown: false, ctxHidden: true } 
            })
        }));
    }
});

window.onload = function () {
    var _data = {
        images: [
            './samples/assets/images/1.jpg',
            './samples/assets/images/3.jpg',            
            './samples/assets/images/5.jpg',            
        ],
        icons: [
            './samples/assets/icons/menu.png',
        ]
    };
    var imageList = l.l('pin-image-list', {
        prop: { images : _data.images, menuIcon: _data.icons[0] },
        state: { }
    });
    l.attach(document.getElementById('app'), imageList);
}