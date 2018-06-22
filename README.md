# ljs

Simple client site web framework.

Only take 15-20 minutes to read through the guide and you can practice immediately.

## features
1. No addition dependencies (No nodejs, node babel, no lodash, no ES6, ...), open your text editor of choice and start typing just vanilla javascript.
2. Easy to build from simple to complex component.
3. IoC built-in, re-use component in flexible way.
4. Reuse component in a simple way.
5. DOM automatically update by explicit redraw.
6. Partial template rendering, not entire VDOM tree.
6. Core code is easy to read, so you can understand what really happen.
6. …

## what is what
ljs is an virtual DOM based js framework which help you manipulate the DOM automatically.

It similar to a lot of well-known libs, frameworks like: [ReactJs](https://reactjs.org/), [VueJs](https://vuejs.org/), [MitrhilJs](https://mithril.js.org/), ...

### Reason
Now a day, we have a lot js libs, frameworks which automatically update DOM when data change. Using these libs, frameworks make our web application easier to develop, maintain, etc...

Each libs, frameworks have their strength and weakness. Performance of these libraries, frameworks also very good too.

#### So what is the reason why I continue to re-invent the wheel?

The problem is some of these libs, frameworks is too complex. So to make it easier to use, a lot of tools has been developed too,...
Another reason is the core of these libs, framework is also hard to understand for new comer.

So before we ready to make things by using these libs, frameworks, we need spend a lot of time to learn to understand what is what, and what do what. (Of course, it worthy, but sometimes it still hurt.)

That why I create ljs.

All I want is to make a very simple framework (in both idea and implementation) which have the same features as above libs, frameworks but take less time to learn (15-20 minutes is accepted).

### Why ljs
I think 'l' - in lower case - is one of the most simple character, just a vertical line.
And I want this framework should simple too, just like its name.

To understand how ljs works, we have to learn the design idea of its concepts like VDOM, component.

### Main idea
The main idea of ljs is it allow developer define a custom, complex component from registered component in easiest way, and using this component just like using native HTML Element. Make sense?

To fully understand what ljs is, we need to know:
1. ljs component.
2. ljs mecharnism to update live DOM.

#### ljs component
To explain the concept of ljs component in a simple way, I create a HTMLElement tree like so:
```
<div id='todo'>
    <form>
        <input type='text' input='function(){}' placeholder='Enter todo...'/>
        <button click='function(){}'>Add todo</button>
    </form>
    <ul>
        <li> Route <button click='function(){...}'>X</button> </li>
        <li> Ajax <button click='function(){...}'>X</button> </li>
        ...
    </ul>
</div>
```

In this tree, we can see these is a lot of native HTMLElements like div, form, input, button, ul, li.
Native HTMLElement have a lot of things inside it, but what we only need to care about is only tag, attributes and events (like above example).

To create a HTMLElement, we need to provide a tag name, a custom attributes and events like so:
```
<input type='text' placeholder='Enter todo...' value='...' input='function(){/*...*/}' />
```

It's so familiar, and what I want is allow ljs creating a component in the same way.
With ljs, the syntax to create a component is:
```
l( tagName, attributeObject, eventObject, childrenComponentArray );
```

For example, it's ljs syntax to create a component like a input HTMLElement above:
```
l('input', { type: 'text', placeholder: 'Enter todo...', value: '...' }, { input: function(){ /*...*/ } })) // no children
```

But using a default HTML component doesn't make it cooooool, so we continue with custom component.

Custom component is not only simple as a single HTMLElement with custom tag name, ... but also complex as a HTMLElement tree.

You will see what is a custom component in example below. But to make thing easy, let me introduce a syntax to register new custom component.

    ```
    // using l.register function to register new component
    // this function have 2 parameters:
    // - 1st parameter is component name: it can be simple string like 'z', 'y',.. or fully qualified namespace like so 'ljs.default.upload-component'
    // - 2nd parameter is component contructor function which define a method named 'template' to return a component tree.

    l.register( tagName, componentConstructor )
    ```

To make it clear, I split HTMLElement tree in above code into 3 parts: 
- The first one is a todo-input component which allow user enter todo and add value to todo collections.
- The second one is a todo-list component which display all todos.
- The third one is a todo component. This component will wrap todo-input and todo-list component to make todo app.

So with new structure, we have:
- todo-input component:
    1. ljs code:
        ```
        // define todo-form component
        // This component have one attribute is todo which is a value of todo
        // and two events which use to alert current todo value changed and tod add a new todo to todo list.
        // l('', { text:'Add todo' } in example below stand for text node

        l.register('todo-form', function() {
            this.template = function(a /*attrs*/, e /*events*/) {
                return l('form', null, null, [
                    l('input', { type:'input', value: a.todo }, e.onInput != null ? { input: e.onInput }: null),
                    l('button', null, e.onAdd != null ? { click: e.onAdd } : null, l('', { text:'Add todo' }))                    
                ]);
            }
        });

        // using
        l('todo-form', { todo: 'do sth' }, { onInput: function(e) { /*... */ }, onAdd: function(e) { /*...*/ } });
        ```
    2. Generated html:
        ```
        <todo-form>
            <form>
                <input 
                    type='text' 
                    input='function(){ /*... */}' 
                    value='do sth' 
                    placeholder='Enter todo...'/>
                <button click='function(){ /*...*/ }'>Add todo</button>
            </form>
        </todo-form>
        ```

- todo-item-list:
    1. ljs code:
        ```
        // define todo-item component
        l.register('todo-item', function() {
            this.template = function(a, e) {
                return l('li', null, null, [
                    l('', { text: a.todo }), 
                    l('button', null, { click: e.onDeleteTodo }, l('', { text: 'X' }))
                ]);
            }
        });

        // define todo-item-list component which use todo-item inside it
        l.register('todo-item-list', function(){
            this.template = function(a, e) {
                return l('ul', null, null, a.todos.map(function(item, index) {
                    return l('todo-item', { todo: item }, { onDeleteTodo: function(){ /*...*/ } })
                }));
            }
        });

        // using
        l('todo-item-list', { todos:[ "Router", "Ajax" ]} )
        ```

    2. Generated html:
        ```
        <todo-item-list>
            <ul>
                <todo-item><li> Router <button click='function(){ /*...*/ }'>X</button> </li></todo-item>
                <todo-item><li> Ajax <button click='function(){ /*...*/ }'>X</button> </li></todo-item>
            </ul>
        </todo-item-list>
        ```    

After create todo-form and todo-item-list components, I can re-use these components to make a todo component like so:
1. ljs code:
    ```
    l.register('todo', function(){
        this.template = function(a, e) {
            return l('div', null, null, [
                l('todo-form', { todo: a.todo }, { onInput: function(e) { /*... */ }, onAdd: function(e) { /*...*/ } }), 
                l('todo-item-list', { todos: a.todos })
            ]);
        }
    });

    // using
    var todo = l('todo', { todo: '1st todo', todos: [ 'Route', 'Ajax' ]} )
    ```    

2. Generated html:
    ```
    <todo>
        <div>
            <todo-form>
                <form>
                    <input 
                        type='text' 
                        input='function(){...}' 
                        value='1st todo' />
                    <button click='function(){...}'>Add todo</button>
                </form>
            </todo-form>
            <todo-item-list>
                <ul>
                    <todo-item><li> Route <button click='function(){...}'>X</button> </li></todo-item>
                    <todo-item><li> Ajax <button click='function(){...}'>X</button> </li></todo-item>
                </ul>
            </todo-item-list>
        </div>
    </todo>
    ```

Cooooool, huh. But how ljs make a component tree become actual DOM tree?

As an example above, todo component is a combination of todo-input and todo-item-list component (which also a complex component too). So we cannot treat this component as a single HTMLElement.

In other words, if we don't do anything with this component, the HTMLElement tree like above example will not be created, what we got is a single node `<todo>`. It's not what we want.

So what we need to do is loop through this component and all its childrens component. In case we meet any children is custom component, we will translate it to a component tree using defined 'template' method.

For example:
If ljs see the `<todo>` node, it'll translate it to 
```
<todo>
    <todo-form></todo-form>
    <todo-item-list></todo-item-list>
</todo>
```
then it continue translate `<todo-form>` node into:
```
<todo-form>
    <input/>
    <button></button>
</todo-form>
```
etc, ...

The result of this process is a HTMLElement tree (of course we still have component node) and this tree can be attached to the live DOM.

#### ljs update DOM mecharnism

Each time something change in component, ljs will generate another HTMLElement tree (new tree) by translating custom component.
To update new changes, ljs compare the old and new HTMLElement tree, apply this changes to the DOM.

Translate custom component to HTMLElement tree is very easy to do.

But its downside is it make impossible to detect new changes between old and new HTMLElement tree because HTMLElement contain a lot of properties, prototype layer,...

Finding a differences between 2 HTMLElement tree is impossible or at least, decrease perfomance significantly.

To make it possible, ljs doesn't translate custom component to HTMLElement tree. Actually, it's only generate custom component to an object tree called virtual DOM tree. Each node of this tree is an object which hold a pieces of data (attribute, event, childs) to mimic a real HTMLElement in DOM tree.

Comparing between 2 lightweight trees is easier and faster.

After detect the changes between 2 virtual DOM trees, ljs will patch the diffs into the real DOM.

And we have another problem. Travel entire the DOM tree to detect what DOM node will be affected by current changes is a nightmare. This action will slow-down the performance of entire application significantly.

To solve this problem, each virtual DOM object will have a property to link to the real DOM node directly.
Each time virtual DOM change, we can find and update the affected DOM easily without traversal entire DOM tree.


### What vdom is 

VDOM is a name of ljs virtual DOM. Virtual DOM is a lightweight object of DOM. It's an important concept of so much libs, frameworks. Its make these framework detect the changes easier, faster, effeciently,...

VDOM contain small piece of data which help ljs decide what need to do with the DOM.

VDOM members:

1. tag (string): is tag of VDOM. Tag can be a defined html tag like a, div, ... or custom tags which registered by ppl(and you too).

2. attributes (object): is an object which each its property is attribute of HTMLElement and its property value is value of HTMLElement attribute.

3. events (object): is an object which each its property is event handler of HTMLElement and its property value is event handler code.

4. childs (Array<VDOM>): is an array reference to all childrens VDOM of current VDOM.

5. parent (VDOM): is a reference to parent VDOM of current VDOM.

6. DOM (HTMLElement): is a reference to DOM object. By default, DOM will have value 0 until you access this property.

7. component: is a reference to VDOM component. Note that only custom VDOM have component. Default VDOM like 'a', 'div', ... doesn't have component property.

### What component is 

Component is a very simple object which contain a piece of data and also have responsibility to update changes to browser content each time its data changed.

Component members:

1. attrs - (object): is an object contain data of current component (also known as props and states in another framework). Component will use this data to render VDOM from its defined template.

2. events - (object): is an object which contain custom event of current component.

2. VDOM - (VDOM): a reference to its VDOM.
 
   A component have only 1 main VDOM tree, sometimes when it need to update DOM, temp VDOM will be created.

   To understand what is the difference between main VDOM and temp VDOM, we need to understand what is the difference between visible DOM and hidden DOM.
 
 Visible DOM: is a DOM object which has been attached to document object. Every change in this DOM will change browser content.

 Hidden DOM: is a DOM which has been created by javacript and not attached to document object yet. So changing this DOM is not affect to browser content.

  As you know, each VDOM have a reference to DOM. So the main VDOM is an object tree, each node of its reference to visible DOM node. And the temp VDOM is an object tree, each node of its reference to hidden DOM.

 So each time data change (new data), component pass its data to template method to create temp VDOM. Then compare main VDOM and temp VDOM to detect changes. After that, it update DOM directly via main VDOM tree, then update VDOM too. That is.

3. redraw() - (void): is a method which we will use to tell component: "Hey, it's a time to update DOM".

4. template(data) - (Component): this method define the html structure of component.

### Using l
1. Create component
  * l(tag, attributes, events, childs): this function will return component object.
    - tag: is a valid string html tag ('a', 'div', 'span', ... or custom tag which has been registered).
    - attributes: is an object which define custom attributes of component.
    - events: is an object which define custom events of component.
    - childs: is an array of component objects.

2. Register component
 * l.register(customTag, componentConstructor): this function will add componentConstructor to component storage of l. After register, component can be create by l(…).component.
    - customTag: is a unique string to help l detect your custom component.
    - componentConstructor: is a constructor function which contain 'template' method.

3. Attach component to the DOM
 * l.attach(host, component): this function will attach component to the DOM to make it visible in browser.
    - host: is a DOM object which will contain component after attach completed.
    - component: is a component object created by l(...)

----
## TODO
1. Router
2. XHR, Promise
3. Keyed child diff
4. Documentation
5. Samples
6. Benchmark (jk)