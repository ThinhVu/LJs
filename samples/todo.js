l.register('el-todo-form', function() {
    // defined attributes
    this.getAttributeNames = function() {
        return ['newTodo', 'emptyAlertMsg'];
    }
    // defined events
    this.getEventNames = function() {
        return ['onTodoValueChanged', 'onAddTodo'];
    }
    // defined template
    this.template = function() {
        var todoInput = l('input', { 
            type:'input', 
            value: this.attrs.newTodo, 
            placeholder: this.attrs.emptyAlertMsg,
            oninput: this.events.onTodoValueChanged
        });
        var addButton = l('button', { onclick: this.events.onAddTodo }, lt('Add todo'));
        var todoForm = l('form', null, [todoInput, addButton]);
        return todoForm;
    }
});

l.register('el-todo-item', function(){
    var m = this;

    this.getAttributeNames = function() {
        return ['todo'];
    }

    this.getEventNames = function() {
        return ['onDeleteTodo'];
    }

    this.template = function(childrens /*optional Lode[]*/) {
        var todoContent = l('span', null, lt(this.attrs.todo));

        var deleteButton = l('button', { 
            onclick: function(event){ 
                m.events['onDeleteTodo'](); 
            } 
        }, lt('X'));

        var todoItem = l('li', null, [todoContent, childrens, deleteButton]);

        return todoItem;
    }
});

l.register('el-todo-item-list', function(){
    this.getAttributeNames = function() {
        return ['todoList'];
    }
    this.getEventNames = function() {
        return ['onDeleteTodo'];
    }
    this.template = function() {
        var todoList = this.attrs['todoList'];
        var onDeleteEvent = this.events['onDeleteTodo'];
        var onDeleteTodoHandler = function(index) {
            return function(){ 
                onDeleteEvent(index);
            }
        }
        //
        var todoItems = [];
        for(var i = 0, len = todoList.length; i < len; ++i) {
            var todoItem = l('el-todo-item', { 
                todo: todoList[i],
                onDeleteTodo: onDeleteTodoHandler(i)
            }, lt('(not done)'));

            todoItems.push(todoItem);
        }

        return l('ul', null, todoItems);
    }
});



l.register('el-todo', function() {
    this.getAttributeNames = function() {
        return ['newTodo', 'todoList', 'emptyAlertMsg'];
    }

    this.getEventNames = function() {
        return ['onInput', 'onAdd', 'onDeleteTodo'];
    }

    this.template = function() {
        var todoForm = l('el-todo-form', { 
            newTodo: this.attrs.newTodo,
            emptyAlertMsg: this.attrs.emptyAlertMsg,
            onTodoValueChanged: this.events.onInput,
            onAddTodo: this.events.onAdd
        });

        var todoItemList = l('el-todo-item-list', { 
            todoList: this.attrs.todoList, 
            onDeleteTodo: this.events.onDeleteTodo
        });

        return l('div', null, [todoForm, todoItemList]);
    }
});

window.onload = function(){
    var todoElement;
    // state management
    var todoData = { 
        newTodo: 'Hello there', 
        emptyAlertMsg: '<enter-msg-here>',
        todoList: [ 'Route', 'Ajax', 'Sample app' ], 
        onInput: function(event) { 
            event.preventDefault();
            todoData.newTodo = event.target.value;
            todoElement.f5(todoData);
        },
        onAdd: function(event) {
            event.preventDefault();
            todoData.todoList.push(todoData.newTodo);
            todoData.newTodo = '';
            todoElement.f5(todoData);
        },
        onDeleteTodo: function(i) {
            event.preventDefault();
            todoData.todoList.splice(i, 1);
            todoElement.f5(todoData);
        }
    };

    todoElement = l('el-todo', todoData);
    l.attach(document.getElementById('app'), todoElement);
}