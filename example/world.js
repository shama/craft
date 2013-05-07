// make a crafter
var crafter = require('../')();

// load in recipes
crafter.recipe(require('./data/recipes.json'));

// load up items index
var itemsIndex = require('./data/items.json');

var texturePath = 'textures/';
var crafting = document.getElementById('crafting');
var items = document.getElementById('items');
var craftable = document.getElementById('craftable');
var result = document.getElementById('result');

// craft it!
// todo: maybe move this to the webui?
var giving = false;
function craftit(have) {
  have = have || [];
  [].forEach.call(craftable.querySelectorAll('li'), function(li, i) {
    var row = Math.floor(i / 3);
    if (!have[row]) have[row] = [];
    have[row].push(li.getAttribute('data-type') || 'none');
  });
  giving = crafter.craft(have.filter(function(row) {
    return row.length > 0;
  }));
  result.innerHTML = '';
  if (giving !== false) {
    var give = giving.give;
    // find item
    var item = false;
    itemsIndex.forEach(function(i) {
      if (i.name.toLowerCase() === give[0].toLowerCase()) {
        item = i;
        return false;
      }
    });
    result.setAttribute('data-type', give[0].toLowerCase());
    result.setAttribute('data-quantity', give[1]);
    if (item === false) {
      result.innerHTML = '<div class="noimage">' + give[0] + '</div><span>' + give[1] + '</span>';
    } else {
      result.innerHTML = '<img src="' + texturePath + item.image + '" title="' + item.name + '" /><span>' + give[1] + '</span>';
    }
  }
}

// removes the items from craftable if result is picked up
function deductcost() {
  var cost = [];
  if (!giving.have || giving.have.length < 1) return;

  // flatten
  var cost = [];
  for (var i = 0; i < giving.have.length; i++) {
    for (var j = 0; j < giving.have[i].length; j++) {
      cost.push(giving.have[i][j]);
    }
  }
  if (typeof cost[0] === 'string') cost = [cost];

  function deduct(from, amt) {
    var current = parseInt(from.getAttribute('data-quantity'));
    current -= amt;
    from.setAttribute('data-quantity', current);
    updateAmounts(from);
    if (current < 1) {
      from.setAttribute('data-type', 'none');
      from.innerHTML = '';
    }
  }

  [].forEach.call(craftable.querySelectorAll('li'), function(li, i) {
    var row = Math.floor(i / 3);
    var has = (li.getAttribute('data-type') || 'none').toLowerCase();
    for (var c = 0; c < cost.length; c++) {
      if (cost[c][0].toLowerCase() === has) {
        var price = cost[c][1];
        cost.splice(c, 1);
        deduct(li, price);
        return false;
      }
    }
  });
}

// UI
var webui = require('../webui')({
  container: document.getElementById('crafting')
});
function updateAmounts(slot, quantity) {
  var slotAmt = slot.querySelector('span');
  if (slotAmt) slotAmt.innerHTML = slot.getAttribute('data-quantity');
  var activeAmt = webui.active.querySelector('span');
  if (activeAmt) activeAmt.innerHTML = webui.active.getAttribute('data-quantity');
  craftit();
}
webui.on('pickup', function(slot, quantity) {
  if (slot.id === 'result') deductcost();
  updateAmounts(slot, quantity);
});
webui.on('drop', updateAmounts);

function createBlock(image) {
  var block = document.getElementById('block-template').cloneNode(true);
  [].forEach.call(block.querySelectorAll('#block > div'), function(el, i) {
    el.style.backgroundImage = 'url(' + image + ')';
  });
  return block.innerHTML;
}

// load up some items into our inventory
(function loadItems() {
  var lis = items.querySelectorAll('li');
  itemsIndex.filter(function(item) {
    return item.has > 0;
  }).forEach(function(item, i) {
    if (item.image.slice(0, 6) === 'blocks') {
      lis[i].innerHTML = createBlock(texturePath + item.image);
    } else {
      lis[i].innerHTML = '<img src="' + texturePath + item.image + '" title="' + item.name + '" />';
    }
    lis[i].innerHTML += '<span>' + item.has + '</span>';
    lis[i].setAttribute('data-type', item.name);
    lis[i].setAttribute('data-quantity', item.has);
  });
}());

// js editor
var jsedit = require('javascript-editor')({
  container: document.querySelector('#editor')
});
jsedit.editor.setValue(document.querySelector('#program').text);
document.getElementById('addrecipe').addEventListener('click', function(e) {
  var self = this;
  var value = jsedit.editor.getValue();
  try { eval(value); } catch (err) { console.error(err); }
  var orig = this.innerHTML;
  this.innerHTML = 'Added!';
  setTimeout(function() { self.innerHTML = orig; }, 2000);
  return false;
});
