l.c.register('todo', function(){
    var m = this, _ = null;
    // Define template
    m.template = function() {
        return l('main', _, _, [
            // input section
            l('div', _, _, [
                l('input', { type: 'text', placeholder:'Enter todo', value : m.dataService.getTodo() }, {
                    input: function(e) {
                        m.dataService.setTodo(e.target.value);
                        m.redraw();
                    }
                }),
                l('button', _, { click: function(){ 
                    m.dataService.addTodo();
                    m.redraw();
                } }, ['Add todo'])
            ]),
            // todo list
            l('ul', _, _, m.dataService.getTodos().map(function(item, index){                
                return l('li', { key:item }, _, [
                    item,
                    l('button', _, {
                        click: function(){
                            m.dataService.removeTodo(index);
                            m.redraw();
                        }
                    }, ['X'])
                ])
            }))
        ]);
    }
})

window.onload = function() {

    var todoData = {
        todo:'',
        todos: ['1', '2']
    };

    var todoDataService = {
        getTodo: function() { return todoData.todo; },
        setTodo: function(val) { todoData.todo = val; },
        getTodos: function() { return todoData.todos },
        addTodo: function() { todoData.todos.push(todoData.todo); todoData.todo = ''; },
        removeTodo: function(index) { todoData.todos.splice(index, 1); }
    }

    var todoApp = l.c('todo', todoDataService);    
    l.attach(document.getElementById('app'), todoApp);
}