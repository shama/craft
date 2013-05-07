var EE = require('events').EventEmitter;
var inherits = require('inherits');

function WebUI(opts) {
  if (!(this instanceof WebUI)) return new WebUI(opts || {});
  var self = this;
  self.container = opts.container || document.createElement('div');
  self.slots = opts.slots || self.container.querySelectorAll('li');

  // init active
  self.active = document.createElement('div');
  self.active.classList.add('craft-webui-active');
  document.body.appendChild(self.active);
  self.active.style.visibility = 'hidden';
  self.active.style.position = 'absolute';
  self.active.style.pointerEvents = 'none';
  self.active.setAttribute('data-type', 'none');
  self.active.setAttribute('data-quantity', 0);

  // init mousemove
  document.addEventListener('mousemove', function(e) {
    // todo: calc offset better
    self.active.style.top = (e.clientY - 14) + 'px';
    self.active.style.left = (e.clientX - 14) + 'px';
  });

  // if <Ctrl> or right click is pressed
  self.ctrl = false;

  function click(e) {
    if (self.active.getAttribute('data-quantity') < 1) {
      self.pickup(this);
    } else {
      self.drop(this);
    }
  }

  // init slots
  [].forEach.call(self.slots, function(slot) {
    slot.setAttribute('data-type', 'none');
    slot.setAttribute('data-quantity', 0);
    slot.addEventListener('click', function(e) {
      click.call(this, e);
      return false;
    });
    slot.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      self.ctrl = true;
      click.call(this, e);
      self.ctrl = false;
      return false;
    });
  });
}
module.exports = WebUI;
inherits(WebUI, EE);

WebUI.prototype.pickup = function(slot) {
  var self = this;
  var slotQuantity = parseInt(slot.getAttribute('data-quantity'));
  var activeQuantity = parseInt(self.active.getAttribute('data-quantity'));

  // if not allowed to pickup
  if (slot.getAttribute('data-pickup') === 'no') return;

  // nothing to pickup
  if (slotQuantity < 1) return;

  // pickup either 1 or all
  var pickup = (self.ctrl) ? Math.ceil(slotQuantity / 2) : slotQuantity;
  slotQuantity -= pickup;
  activeQuantity += pickup;
  slot.setAttribute('data-quantity', slotQuantity);
  self.active.setAttribute('data-quantity', activeQuantity);

  // if we need to switch type
  var activeType = self.active.getAttribute('data-type');
  var slotType = slot.getAttribute('data-type');
  if (activeType !== slotType) {
    self.active.innerHTML = slot.innerHTML;
    self.active.setAttribute('data-type', slotType);
  }

  // if slot is now empty, clear it
  if (slotQuantity < 1) {
    slot.innerHTML = '';
    slot.setAttribute('data-type', 'none');
  }

  self.active.style.visibility = 'visible';
  self.emit('pickup', slot, pickup);
};

WebUI.prototype.drop = function(slot) {
  var self = this;
  var slotQuantity = parseInt(slot.getAttribute('data-quantity'));
  var activeQuantity = parseInt(self.active.getAttribute('data-quantity'));
  var activeType = self.active.getAttribute('data-type');
  var slotType = slot.getAttribute('data-type');

  // if not allowed to drop
  if (slot.getAttribute('data-drop') === 'no') {
    // but if the same type, pickup instead
    if (slotType === activeType) self.pickup(slot);
    return;
  }

  // nothing to drop
  if (activeQuantity < 1) return;

  // dropping on another type
  if (slotType !== 'none' && slotType !== activeType) return;

  var dropping = (self.ctrl) ? Math.ceil(activeQuantity / 2) : activeQuantity;
  activeQuantity -= dropping;
  slotQuantity += dropping;
  slot.setAttribute('data-quantity', slotQuantity);
  self.active.setAttribute('data-quantity', activeQuantity);

  if (slotType === 'none') {
    // dropping onto an empty slot
    slot.innerHTML = self.active.innerHTML;
    slot.setAttribute('data-type', activeType);
  }

  if (activeQuantity < 1) {
    self.active.innerHTML = '';
    self.active.setAttribute('data-type', 'none');
    self.active.setAttribute('data-quantity', 0);
    self.active.style.visibility = 'hidden';
  }

  self.emit('drop', slot, dropping);
};



// drag and drop api
/*[].forEach.call(crafting.querySelectorAll('li'), function(li) {
  li.addEventListener('dragstart', function(e) {
    this.classList.toggle('dragging');
    activeDrag = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
  }, false);
  li.addEventListener('dragover', function(e) {
    // HTML5 WHY U NOT DROP UNLESS I PREVENT DEFAULT?
    e.preventDefault();
  });
  li.addEventListener('drop', function(e) {
    if (e.stopPropagation) e.stopPropagation();
    if (activeDrag !== this) {
      activeDrag.innerHTML = this.innerHTML;
      this.innerHTML = e.dataTransfer.getData('text/html');
      if (this.parentElement === craftable) {
        craftit();
      }
    }
    return false;
  }, false);
  li.addEventListener('dragend', function(e) {
    this.classList.toggle('dragging');
    return false;
  }, false);
});*/
