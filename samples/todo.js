l.register('todo-form', function(){
    this.template = function(a, e) {    
        var todoInput = l('input', { type:'input', value: a.todo, placeholder: a.placeholder || '...' }, { input: e.onInput });
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
        var todoItem = l('li', null, null, [todoContent, deleteButton]);
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
        var todoForm = l('todo-form', { todo: a.todo }, { 
            onInput: e.onInput,
            onAdd: e.onAdd
        });
        var todoItemList = l('todo-item-list', { todos: a.todos }, { onDeleteTodo: e.onDeleteTodo });
        return l('div', null, null, [todoForm, todoItemList]);
    }
})

window.onload = function(){
    var todoComponent;

    var todoData = { 
        todo: 'Hello there', 
        todos: [ 'Route', 'Ajax', 'Sample app' ]
    };

    var todoEvents = {
        onInput: function(event) { 
            event.preventDefault();
            todoData.todo = event.target.value;
            todoComponent.f5();
        },
        onAdd: function(event) {
            event.preventDefault();
            todoData.todos.push(todoData.todo);
            todoData.todo = '';
            todoComponent.f5();
        },
        onDeleteTodo: function(i) {
            todoData.todos.splice(i, 1);
            todoComponent.f5();
        }
    };
    
    todoComponent = l('todo', todoData, todoEvents);
    l.attach(document.getElementById('app'), todoComponent);
}