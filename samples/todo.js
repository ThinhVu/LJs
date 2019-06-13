l.register('todo-form', function(){
    this.template = function(a, e) {    
        var todoInput = l('input', { type:'input', value: a.todo, placeholder: a.placeholder || '...' }, e.onInput && { input: e.onInput })
        var addButton = l('button', null, e.onAdd && { click: e.onAdd }, l('', { text:'Add todo' }))
        var todoForm = l('form', null, null, [todoInput, addButton]);
        return todoForm;
    }
});

l.register('todo-item', function(){
    this.template = function(a,e) {
        var todoContent = l('', { text: a.todo });
        var deleteButton = l('button', null, { click: function(event){ 
            e.onDeleteTodo(); 
        } }, l('', { text: 'X' }));
        var todoItem = l('li', { key: a.key }, null, [todoContent, deleteButton]);
        return todoItem;
    }
});

l.register('todo-item-list', function(){
    this.template = function(a,e) {
        var m = this;
        var todoItems = [];
        for(var i=0; i<a.todos.length; ++i) {
            var todoItem = l(  'todo-item', 
                                { todo: a.todos[i], key: i }, 
                                { onDeleteTodo: (function(index){ 
                                    return function(){ 
                                        e.onDeleteTodo(index);
                                    } 
                                })(i) }
                            )
            todoItems.push(todoItem);
        }
        return l('ul', null, null, todoItems);
    }
});

l.register('todo', function(){
    this.template = function(a, e) {
        var m = this;
        var todoForm = l('todo-form', { todo: a.todo }, { 
            onInput: function(event) { 
                event.preventDefault();
                a.todo = event.target.value;
                m.f5();
            },
            onAdd: function(event) {
                event.preventDefault();
                a.todos.push(a.todo);
                a.todo = '';
                m.f5();
            }
        });
        var todoItemList = l('todo-item-list', { todos: a.todos }, {
            onDeleteTodo: function(i) {
                a.todos.splice(i, 1);
                m.f5();
            }
        });
        return l('div', null, null, [todoForm, todoItemList]);
    }
})

window.onload = function(){
    var todo = l('todo', { todo: 'Hello there', todos: [ 'Route', 'Ajax', 'Sample app' ]} )
    l.attach(document.getElementById('app'), todo);
}
