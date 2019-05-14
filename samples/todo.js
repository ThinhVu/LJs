// register todo-form
l.register('todo-form', function(a, ev) {  
    return l('form', null, null, [
        l('input', { 
            type:'input', 
            value: a.todo, 
            placeholder: a.placeholder || '...' 
        }, { 
            input: function(e) {
                e.preventDefault();
                if (ev.onInput)
                    ev.onInput(e.target.value);
            }
        }), 
        l('button', null, { 
            click: function(e) {
                e.preventDefault();
                if (ev.onAdd)
                    ev.onAdd(a.todo);
            } 
        }, l('', { text:'Add todo' }))
    ]);
});

// register todo-item
l.register('todo-item', function(a,ev) {
    return l('li', null, null, [
        l('', { text: a.todo }), 
        l('button', null, { 
            click: function(e) {
                e.preventDefault();
                if (ev.onDelete)
                    ev.onDelete(a.index);
            }
        }, l('', { text: 'X' }))
    ]);
});


// register todo item list
l.register('todo-item-list', function(a,e) {
    return l('ul', null, null, a.todos.map(function(item, index){
        return l('todo-item', 
            { todo: item, index: index },
            { onDelete: e.onDelete })
    }));
});

// register todo component
l.register('todo', function(a, e) { 
    return l('div', null, null, [
        l('todo-form', { todo: a.todo }, { 
            onInput: function(input) {
                a.todo = input;
            }, 
            onAdd: function(todo) {
                a.todos.push(todo);
                a.todo = '';                
            }
        }), 
        l('todo-item-list', { todos: a.todos }, { 
            onDelete: function(index) {
                a.todos.splice(index, 1);
            }
        })
    ]);
});

window.onload = function(){
    var data = {
        todo: 'Hello there',
        todos: ['Route', 'Ajax', 'Sample app']
    }
    var todo = l('todo', data);
    l.attach(document.getElementById('app'), todo);
}
