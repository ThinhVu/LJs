----
# ljs

Simple client site web framework.

Only take 15-20 minutes to read through the guide and you can practice immediately.

----
## features
1. No addition dependencies (No nodejs, node babel, no lodash, no ES6, ...), open your text editor of choice and start typing just vanilla javascript.
2. VDOM support.
3. 1-1 DOM mapping.
4. Explicit redraw + partial redraw.
5. IoC built-in.
6. Component with namespace support.
7. …

---
## what is what
ljs is an virtual DOM based javascript framework which help you manipulate the DOM automatically.

It similar to a lot of well known libraries, frameworks: [ReactJs](https://reactjs.org/), [AngularJs](https://angularjs.org/), [VueJs](https://vuejs.org/), [MitrhilJs](https://mithril.js.org/), [Bobril](http://bobril.com/), [Polymer](https://www.polymer-project.org/), [Aurelia](aurelia.io/), etc, ...



### Reason
Now a day, we have a lot javascript libraries, frameworks which automatically manipulate DOM. Using these libraries, framework make our web application easier to develop, maintain, scale,...

Each libs, frameworks have own weakness, but not so much. And performance of these libraries, framework also very good too.


#### So what is the reason why I continue to re-invent the wheel?

The problem is some of these libs, frameworks is too complex. It come with a lot of useful tools,  dependency libraries, different architect design, etc,....

The result is we need spend a lot of time to learn these things before start do things.

That is the reason why I create ljs.

I want to make very simple framework which have the same abilities as above libs, frameworks but take less time to learn (15-20 minutes is accepted).

### Why l
I think 'l' - in lower case - is one of the most simple character, just a vertical line.
And I want this framework should simple too, just like its name.

To understand how 'l' works, we have to learn the design idea of somethings like VDOM, Component.

### What vdom is 

VDOM is a name of 'l' virtual DOM. VDOM is a very simple object. It contain small piece of data which help 'l' decide what need to do with the DOM.


VDOM properties:

1. tag: is a tag of VDOM. tag can be defined html tag or custom tag which registered by someone(and you too).

2. attributes: is an object which have some property contain attribute value of HTMLElement.

3. events: is an object which have some property contain event handler for HTMLElement events.

4. childs: is an array VDOM array. VDOM in this array is child of current VDOM.

 Parent VDOM link to child VDOM by 'childs' property while child VOM link to it parent VDOM by 'parent' property.

5. DOM: is a reference to DOM object. 'l' use this property to manipulate the DOM.

6. component: is a reference to its component. Note that only custom VDOM have component. Default VDOM like 'a', 'div', etc doesn't have component property. 

### What component is 

Component is another very simple object which contain a piece of data and also have responsibility to update changes to DOM every time its data changed.


Component fields:

1. data: an object contain data of component. Component will use this data to render VDOM from its VDOM template.

2. VDOM: a reference to its VDOM.
 
 A component have only 1 main VDOM tree, sometime when it need to update DOM, temp VDOM will be created.

 To understand what is the difference between main VDOM and temp VDOM, we need to understand what is the difference between DOM and hidden DOM.
 
 Visiable DOM: is a DOM which has been attached to document object. Every change in this DOM will change browser content.

 Hidden DOM: is a DOM which has been created by javacript and not attached to document object yet. So changing this DOM is not affect to browser content.

  As I wrote above, each VDOM node have directly link to DOM node. The main VDOM is a VDOM tree which have each node link to visible DOM node. And the temp VDOM tree is a VDOM which have each node link to hidden DOM.

 So what component do each time its data change is  it create temp VDOM from its new data. Then compare main VDOM and temp VDOM to detect changes. After that, it update DOM directly via main VDOM tree, then update VDOM too. That is.


3. redraw(): is a method which we will use to tell component update new change to DOM.


4. template(data): is a method which we define html structure of component.

  data: is an object which contain all data template need to use. (it known as props and states in another framework). Of course it's an data object grab by data property of component.

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

        * customTag is not in html tag (a, div, etc)
.
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