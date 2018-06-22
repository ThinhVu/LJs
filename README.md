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
ljs is an virtual DOM based javascript framework which help you manipulate the DOM automatically.

It similar to a lot of well known libraries, frameworks: [ReactJs](https://reactjs.org/), [VueJs](https://vuejs.org/), [MitrhilJs](https://mithril.js.org/), [Bobril](http://bobril.com/),

### Reason
Now a day, we have a lot js libraries, frameworks which automatically manipulate DOM. Using these libs, frameworks make our web app easier to develop, maintain, scale, etc...

Each libs, frameworks have their strength and weakness. And performance of these libraries, frameworks also very good too.

#### So what is the reason why I continue to re-invent the wheel?

The problem is some of these libs, frameworks is too complex. It come up with a lot of useful tools, well design dependency libs, different architect design (angularjs), etc,....

And the core code is hard to read for new comer.

So before we ready to make things by using these libs, frameworks, we need spend a lot of time to learn to understand what is what, and what do what. (Of course, it worthy, but sometimes it still hurt.)

That is the reason why I create ljs.

All I want is to make a very simple framework (in both idea and implementation) which have the same useful features as above libs, frameworks but take less time to learn (15-20 minutes is accepted).

### Why ljs
I think 'l' - in lower case - is one of the most simple character, just a vertical line.
And I want this framework should simple too, just like its name.

To understand how ljs works, we have to learn the design idea of its concepts like VDOM, component.


### Main idea
The main idea of ljs is it allow developer define a custom, complex component from simple HTMLElement in easiest way, and using this component just like using native HTML Element. Make sense?

To fully understand what ljs is, we need to know:
1. ljs component structure.
2. ljs mecharnism to update DOM tree.

#### ljs component structure
The first thing to know in ljs is component structure.
To explain the concept of ljs component structure in a simple way. I have a HTMLElement tree like so:
`
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
`

In this tree, we can see these is a lot of native HTMLElements like div, form, input, button, ul, li.
Native HTMLElement have a lot of things inside it, but what we only need to care about is only tag, attributes and events (like above example).

Everytime create a HTMLElement, we need to provide a tag name, a custom attributes and events. Like so:
`<input type='text' input='function(){}' placeholder='Enter todo...'/>`

It's so familiar, and what I want is allow ljs creating custom component in the same way.

To make it clear, I split this DOM tree into 3 part: 
- The 1st one is a todo-input component which allow user enter todo and add value to todo collections. It's form element with 2 childs.
- The 2nd one is a todo-list component which display all todos.
- The 3rd one is a todo component. This component will wrap todo-input and todo-list component to make todo app.

So with new structure, we have:
- todo-input component:
    `
    <todo-input>
        <form>
            <input 
                type='text' 
                input='events.onInput' 
                value='attrs.todo' 
                placeholder='Enter todo...'/>
            <button click='events.onAdd'>Add todo</button>
        </form>
    </todo-input>    
    `
    This component have one attribute is todo which is a value of todo, and two events which use to alert todo change and add todo to todo list.

- Todo list:
    `
    <todo-list>
        <ul>
            <li> attr.todos[i] <button click='events.onDelete(i)'>X</button> </li>
            <li> attr.todos[i] <button click='events.onDelete(i)'>X</button> </li>
            ...
        </ul>
    </todo-list>
    `
    This component have one custom attribute is todos and one custom event is onDelete.

Then I can re-use these in todo component like so:
`
<todo>
    <div id='todo'>
        <todo-input todo='attrs.todo' onInput='function(){...}' onAdd='function(){...}'/>
        <todo-list todos="attrs.todos" onDeleted='function(){...}'/>
    </div>
</todo>
`
This todo component define 2 custom attribute is todo and todos. 3 events is onInput, onAdd and onDelete has been defined in component itself.

And to using 'todo' element, what I need to do is just put a 
`
<todo 
    todo='...' 
    todos='["Route", "Ajax"]'>
</todo>
`
as a simple element like div, span in HTML document,...

This syntax is so easy to learn if one already have knownledge about html.

But what is the difference between component and HTMLElement?

HTMLElmenet is a simple tag like a div, a span, an img, an a tag, a ul, a li,.. and these HTMLElement can be mounted to the DOM directly.

But custom component can't because in ljs, it just vanilla js object.

Another reason is custom component is not a simple HTMLElement. It look like a complex HTMLElement tree. For example, todo component above is created by the combination of a todo-input and todo-list element (which also a complex element too).

So how can we display this component into DOM tree? We need to translate our custom component to a HTMLElement tree then mount it to the real DOM.

#### ljs update DOM mecharnism
What I want to do is each time component data change, this component will automatically update the related DOM itself.
But generate native HTMLElement tree directly from a component, then detect the changes in this tree will spent a ton of work because a native HTMLElement define a lot of property, method, etc... Comparing the change in this tree is impossible.

So to make it possible to detect the changes of component, I create a lightweight Virtual DOM tree. Each node of this tree is only vanilla js object with few properties. It's make more easier and effeciently to detect what has been changed.

After detect the changes from virtual DOM, we need to patch the diffs into the real DOM. To make it's fast, the virtual DOM created will link to the DOM directly. So each time virtual DOM change, we can find the affected DOM easily without traversal entire DOM tree.


#### Conclude
What you will do is define a custom component with custom attribute and events, define the way this component will be translate into VDOM tree.

When you using this component, ljs will translate this component to virtual DOM tree. After that, ljs will translate this virtual DOM tree to HTMLElement tree and attach it into the live DOM.

### What vdom is 

VDOM is a name of ljs virtual DOM. Virtual DOM is a lightweight object of DOM. Its important concept of so much libs, frameworks. Its make these framework detect the changes easier, faster, effeciently,...

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

1. data - (object): is an object contain data of current component (also known as props and states in another framework). Component will use this data to render VDOM from its defined template.

2. VDOM - (VDOM): a reference to its VDOM.
 
   A component have only 1 main VDOM tree, sometimes when it need to update DOM, temp VDOM will be created.

   To understand what is the difference between main VDOM and temp VDOM, we need to understand what is the difference between visible DOM and hidden DOM.
 
 Visiable DOM: is a DOM object which has been attached to document object. Every change in this DOM will change browser content.

 Hidden DOM: is a DOM which has been created by javacript and not attached to document object yet. So changing this DOM is not affect to browser content.

  As you know, each VDOM have a reference to DOM. So the main VDOM is an object tree, each node of its reference to visible DOM node. And the temp VDOM is an object tree, each node of its reference to hidden DOM.

 So each time data change (new data), component pass its data to template method to create temp VDOM. Then compare main VDOM and temp VDOM to detect changes. After that, it update DOM directly via main VDOM tree, then update VDOM too. That is.

3. redraw() - (void): is a method which we will use to tell component: "Hey, it's a time to update DOM".

4. template(data) - (VDOM): this method define the html structure of component via ljs.

### Using l
1. Create template
   
 Template is a VDOM tree. There are 2 ways to create VDOM tree using l function.
  * l(tag, attributes, events, childs): this function will return raw VDOM object without component.
    - tag: is a valid string html tag ('a', 'div', 'span', ...)
    - attributes: is an object which define attributes of html element by its attributes ( { class: 'navbar', id: 'nav', type: 'input', placeholder: 'hello ljs' })

    - events: is an object which define events for html element by its attributes (click, input, change...)

    - child: is an array which contain primitive value or VDOM tree, objects ( ['Log in', 'Log out', 5, l(...)]).

 * l(customTag, data): this function will return VDOM object with component linked by 'component' property.
    - customTag: is a string which define tag you registered with l. Note that:
    
        * customTag is not in html tag (a, div, etc).
        
        * customTag should be use as a namespace to reduce name conflict. (com.abc.menubar, com.netfluux.navbar, ...)
    - data: is an object which contain everything your custom component need to render template.

2. Register custom component

 Default, 'l' only contain html VDOM. To resgister custom component, we should use register method of 'l' object.
 * l.register(customTag, componentConstructor): this function will add componentConstructor to component storage of l. After register, component can be create by l(…).component.
    - customTag: is a unique string to help l detect your custom component. 
    - componentConstructor: is a constructor function which contain 'template' method return VDOM object.

3. Attach component to the DOM
 * l.attach(host, component): this function will attach component to the DOM to make it visible in browser.
    - host: is a DOM object which will contain component after attach completed.
    - component: is a component object created by l().component



----
## TODO
1. Router
2. XHR, Promise
3. Keyed child diff
4. Documentation
5. Samples
6. Benchmark (jk)
