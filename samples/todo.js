// Component should own seperate data
// ref data to component should copied by _deepCopy
// Component should public its api

// TODOS
l.register('todo-add', function () {
    var m = this;

    this.template = function () {
        var input = l('input', 
            {
                type: 'text',
                placeholder: 'Enter todo',
                value: m.data.todo
            }, 
            {
                input: function () {
                    m.data.onInput(this.value);
                    m.data.todo = this.value;
                    m.redraw();
                }
            }
        );

        var btnAdd = l('button', {}, {
            click: function () {
                m.data.onAdd(m.data.todo);
                m.data.todo = '';
                m.redraw();
            }
        }, ['Add']);

        return l('div', null, null, [input, btnAdd]);
    }
});

l.register('todo-item', function () {
    var m = this;
    this.template = function (data) {
        return l('li', null, null, [
            data.todo,
            l('button', null, {
                click: function () {
                    data.onDelete(data.index);
                }
            }, ['X'])
        ]);
    }
});

l.register('todo-list', function () {
    var m = this;
    this.template = function () {
        return l('ul', null, null, m.data.todos.map(function (todo, index) {
            return l('todo-item', {
                todo: todo,
                index: index,
                onDelete: function (index) {
                    m.data.todos.splice(index, 1);
                    m.redraw();
                }
            })
        }));
    }
});

l.register('todo', function () {
    var m = this;
    this.template = function (data) {
        var todoList = l('todo-list', {
            todos: _deepCopy(data.todos),
            deleteItem: function (index) {
                m.todos.splice(index, 1);
            }
        });
        var todoAdd = l('todo-add', {
            todo: data.todo,
            onInput: function (value) {
                m.data.todo = value;
            },
            onAdd: function (value) {
                if (value != '') {
                    m.data.todos.push(value);
                    todoList.component.data.todos.push(value);
                    todoList.component.redraw(); // to update todo-list
                } 
                else {
                    alert('Cannot add blank todo');
                }
            }
        });

        return l('div', null, null, [
            todoAdd, 
            todoList
        ]);
    }
});

window.onload = function () {  
    var todos = l('todo', { todos: [
        'Why l?',
        '- lightweight, robust, easy to learn', 
        'What to do next?', 
        '- Router',
        '- XHR, Promise',
        'Documentation?',
        '- Hello l',
        '- Thinking in l',
        '- l guide',
        '- ...'
        ], todo: '' })        
    l.attach(document.getElementById('app'), todos.component);
}