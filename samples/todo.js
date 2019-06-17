l.register('todo-form', function() {
    // defined attribute
    this.getAttributeNames = function() {
        return ['todo', 'emptyAlertMsg'];
    }
    // defined events
    this.getEventNames = function() {
        return ['onTodoValueChanged', 'onAddTodo'];
    }
    // defined template
    this.template = function(childs) {
        var todoInput = l('input', { 
            type:'input', 
            value: this.attrs['todo'], 
            placeholder: this.attrs['emptyAlertMsg'],
            oninput: this.events['onTodoValueChanged']
        });

        var addButton = l('button', { onclick: this.events['onAddTodo'] }, lt('Add todo'));

        var todoForm = l('form', null, [todoInput, addButton]);

        return todoForm;
    }
});

l.register('todo-item', function(){
    this.getAttributeNames = function() {
        return ['todo'];
    }

    this.getEventNames = function() {
        return ['onDeleteTodo'];
    }

    this.template = function(childs) {
        var todoContent = l('span', null, lt(this.attrs['todo']));

        var deleteButton = l('button', { 
            click: function(event){ 
                this.events['onDeleteTodo'](); 
            } 
        }, lt('X'));

        var todoItem = l('li', null, [todoContent, deleteButton]);

        return todoItem;
    }
});

l.register('todo-item-list', function(){
    this.getAttributeNames = function() {
        return ['todoList'];
    }

    this.getEventNames = function() {
        return ['onDeleteTodo'];
    }

    this.template = function(childs) {
        var totoList = this.attrs['todoList'];
        var onDeleteEvent = this.events['onDeleteTodo'];

        //
        var onDeleteTodoHandler = function(index) {
            return function(){ 
                onDeleteEvent(index);
            }
        }

        //
        var todoItems = [];
        for(var i = 0, len = totoList.length; i<len; ++i) {
            var todoItem = l('todo-item', { 
                todo: totoList[i],
                onDeleteTodo: onDeleteTodoHandler(i)
            });

            todoItems.push(todoItem);
        }

        return l('ul', null, todoItems);
    }
});

l.register('todo', function(){
    this.getAttributeNames = function() {
        return ['todo', 'todoList'];
    }

    this.getEventNames = function() {
        return ['onInput', 'onAdd', 'onDeleteTodo'];
    }


    this.template = function(childs) {
        var todoForm = l('todo-form', { 
            todo: this.attrs['todo'],
            emptyAlertMsg: this.attrs['emptyAlertMsg'],
            onTodoValueChanged: this.events['onInput'],
            onAddTodo: this.events['onAdd']
        });

        var todoItemList = l('todo-item-list', { 
            todoList: this.attrs['todoList'], 
            onDeleteTodo: this.events['onDeleteTodo']
        });

        return l('div', null, [todoForm, todoItemList]);
    }
});

window.onload = function(){
    var todoComponent;

    var todoData = { 
        todo: 'Hello there', 
        emptyAlertMsg: '<enter-msg-here>',
        todoList: [ 'Route', 'Ajax', 'Sample app' ], 
        onInput: function(event) { 
            event.preventDefault();
            todoData.todo = event.target.value;
            todoComponent.f5(todoData);
        },
        onAdd: function(event) {
            event.preventDefault();
            todoData.todoList.push(todoData.todo);
            todoData.todo = '';
            todoComponent.f5(todoData);
        },
        onDeleteTodo: function(i) {
            event.preventDefault();
            todoData.todoList.splice(i, 1);
            todoComponent.f5(todoData);
        }
    };

    todoComponent = l('todo', todoData);
    l.attach(document.getElementById('app'), todoComponent);
}