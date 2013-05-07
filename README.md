# craft

An HTML5 crafting API.

# example

[View this example](http://shama.github.io/craft). It loads up most (not all) of
the Minecraft recipes and items. The textures are completely themeable using
exiting Minecraft texture packs too.

```js
// create a crafter
var crafter = require('craft')();

// add a recipe for a torch
crafter.recipe({
  have: [
    ['coal'],
    ['stick'],
  ],
  give: ['torch', 4],
});

// craft your item
var item = crafter.craft([
  ['coal'],
  ['stick'],
]);
console.log('You get ' + item.give[1] + 'x ' + item.give[0] + '!');

// item is now a normalized recipe
```

### Minecraft-like Recipe Format
If you specify more than one argument to `crafter.recipe()` it will assume
you're entering a recipe in a Minecraft-like format:

```js
// turn a box of dirt into 2 diamonds
crafter.recipe(['diamond', 2], [
  'DDD',
  'D D',
  'DDD',
], ['D', 'dirt', 2]);
```

- The first argument is what the recipe will give and how much.
- The second argument is a map of the recipe.
- The following arguments indicate what each of the characters within the map
are equivalent to and how much are required.

### Popular Mod Recipe Format
`crafter.recipe()` also accepts a shorthand popular mod format. Enter as
strings, a single recipe per line:

```js
crafter.recipe([
  // recipe for a ladder
  'shaped ( log+null+log / log+log+log / log+null+log ) > ( ladder,16 )',
  // planks
  'shaped stick+stick ; stick+stick > planks',
].join('\n'));
```

## web user interface
Also included is a web user interface.

```js
var webui = require('crafter/webui')({
  container: document.getElementById('crafting')
});
```

View the
[example](https://github.com/shama/crater/blob/master/example/world.js) for a
more in depth example.

# api

## `require('craft')(options)`
Returns a new craft instance.

### `crafter.recipe(data[, ...])`
Add a new recipe to the crafter.

### `crafter.craft([when], have)`
Input `have` into the crafter and it will search for a matching recipe then
return the matching recipe.

## `require('craft/webui')(options)`
Returns a crafting web UI instance. Specify a `container` option that contains
your crafting grids.

### Events: `pickup` and `drop`
Events emitted as an item is picked up and dropped:

```js
webui.on('pickup', function(itemSlot, quantityPickedUp) {});
webui.on('drop', function(itemSlot, quantityDropped) {});
```

# install

With [npm](https://npmjs.org) do:

```
npm install craft
```

Use [browserify](http://browserify.org) to `require('craft')`.

## release history
* 0.1.0 - initial release

## license
Copyright (c) 2013 Kyle Robinson Young<br/>
Licensed under the MIT license.

**Minecraft is property of Mojang AB**
