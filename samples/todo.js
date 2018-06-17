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
        var deleteButton = l('button', {}, { click: e.onDeleteTodo }, l('', { text: 'X' }));
        var todoItem = l('li', {}, {}, [todoContent, deleteButton]);
        return todoItem;
    }
});

l.register('todo-item-list', function(){
    this.template = function(a,e) {
        var todoItems = [];
        for(var i=0; i<a.todos.length; ++i) {
            var todoItem = l(  'todo-item', 
                                { todo: a.todos[i] }, 
                                { onDeleteTodo: function(){ a.todos.splice(i, 1); this.f5(); } })
            todoItems.push(todoItem);
        }
        return l('ul', {}, {}, todoItems);
    }
});

l.register('todo', function(){
    this.template = function(a, e) {
        var todoForm = l('todo-form', { todo: a.todo }, { 
            onInput: function(e) { 
                a.todo = e.target.value;
                this.f5(); 
            },
            onAdd: function(e) {
                a.todos.push(a.todo);
                a.todo = '';
                this.f5();
            }
        });
        var todoItemList = l('todo-item-list', { todos: a.todos });
        return l('div', {}, {}, [todoForm, todoItemList]);
    }
})

window.onload = function(){
    var todo = l('todo', { todo: 'Hello there', todos: [ 'Route', 'Ajax', 'Sample app' ]} )
    l.attach(document.getElementById('app'), todo);
}
