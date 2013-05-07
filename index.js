function Craft(opts) {
  if (!(this instanceof Craft)) return new Craft(opts || {});
  this.recipes = opts.recipes || [];
  this.separator = opts.separator || '|';
  this.emptyWords = ['none', 'air', 'null'];
}
module.exports = Craft;

Craft.prototype.recipe = function(data) {
  var self = this;
  // assume mod format
  if (typeof data === 'string') data = this._modRecipe(data);
  // assume mc format
  else if (arguments.length > 1) data = this._mcRecipe(Array.prototype.slice.call(arguments, 0));
  if (Array.isArray(data)) {
    data.forEach(function(r) { self.recipe(r); });
    return this;
  }
  data = self._normalize(data);
  // create a key based on have for quicker/easier read
  if (!data.key) data.key = data.have.join(self.separator).toLowerCase();
  this.recipes.push(data);
  return this;
};

Craft.prototype.craft = function(when, have) {
  if (Array.isArray(when)) {
    have = when;
    when = 'shaped';
  }
  var give = false;
  when = when.toLowerCase();

  have = this._normalize({have: have}).have;

  // throw out empty rows
  have = this._removeNoneRows(have);
  have = this._asColumns(have);
  have = this._removeNoneRows(have);
  have = this._asColumns(have);

  // nothing!
  if (have.length < 1) return false;

  // check shaped first
  give = this._craftShaped(have);

  // then shapeless
  if (give === false) give = this._craftShapeless(have);

  return give;
};

Craft.prototype._craftShaped = function(have) {
  var give = false;

  // TODO: This way isnt perfect, do this better!
  var key = have.join(this.separator).toLowerCase();
  this.recipes.forEach(function(recipe) {
    if (recipe.key === key && recipe.when === 'shaped') {
      give = recipe;
      return false;
    }
  });

  return give;
};

Craft.prototype._craftShapeless = function(have) {
  var give = false;

  // flatten
  var tmp = [];
  for (var i = 0; i < have.length; i++) {
    for (var j = 0; j < have[i].length; j++) {
      tmp.push(have[i][j]);
    }
  }
  have = tmp;

  this.recipes.forEach(function(recipe) {
    var found = 0;
    for (var i = 0; i < recipe.have.length; i++) {
      for (var j = 0; j < have.length; j++) {
        var rhas = recipe.have[i][0];
        if (typeof rhas === 'string') rhas = [rhas, 1];
        if (rhas[0].toLowerCase() === String(have[j][0]).toLowerCase()
          && have[j][1] >= recipe.have[i][1]) {
            found++;
        }
      }
    }
    if (found === have.length) {
      give = recipe;
      return false;
    }
  });

  return give;
};

Craft.prototype._removeNoneRows = function(arr) {
  var word = this.emptyWords[0];
  var rows = [];
  for (var r = 0; r < arr.length; r++) {
    var row = arr[r];
    var none = 0;
    for (var c = 0; c < row.length; c++) {
      if (row[c] === word) none++;
    }
    if (none < row.length) rows.push(row);
  }
  return rows;
};

Craft.prototype._asColumns = function(arr) {
  var cols = [];
  for (var r = 0; r < arr.length; r++) {
    var row = arr[r];
    for (var c = 0; c < row.length; c++) {
      var col = row[c];
      if (!cols[c]) cols[c] = [];
      cols[c][r] = col;
    }
  }
  return cols;
};

// parse minecraft-esque recipe
Craft.prototype._mcRecipe = function(data) {
  var when = 'shaped';
  if (typeof data[0] === 'string') {
    when = data[0];
    data = data.slice(1);
  }
  var keys = Object.create(null);
  data.slice(2).forEach(function(key) {
    if (key.length === 2) key[2] = 1;
    keys[key[0]] = [key[1], key[2]];
  });
  var have = data[1].map(function(row) {
    return row.split('').map(function(col) {
      return (keys[col]) ? keys[col] : 'none';
    });
  });
  return {
    when: when,
    give: data[0],
    have: have,
  };
};

// parse popular mod recipe format
Craft.prototype._modRecipe = function(str) {
  var self = this;
  if (str.indexOf('\n') !== -1) {
    return str.split('\n').map(function(s) {
      return self._modRecipe(s);
    });
  }

  // remove parens
  str = str.replace(/\(\s|\s\)/g, '');
  str = str.replace(/\(|\)/g, '').split(' ');

  var when = str[0];
  var give = str.slice(str.indexOf('>') + 1)[0];

  var have = str.slice(1, str.indexOf('>')).filter(function(has) {
    return (has.length > 1);
  }).map(function(has) {
    return has.split('+');
  });

  return {
    when: when,
    give: give,
    have: have,
  };
};

// last clean up step
Craft.prototype._normalize = function(data) {
  var self = this;

  // clean up give
  if (typeof data.give === 'string') {
    if (data.give.indexOf(',') !== -1) {
      data.give = data.give.split(',');
    } else {
      data.give = [data.give, 1];
    }
  }

  // clean up when
  if (!data.when || typeof data.when !== 'string') {
    data.when = 'shaped';
  }
  data.when = data.when.toLowerCase();

  // clean up have
  for (var r = 0; r < data.have.length; r++) {
    var row = data.have[r];
    if (typeof row === 'string') {
      if (row.indexOf(',') !== -1) {
        data.have[r] = row.split(',');
      } else {
        data.have[r] = [row, 1];
      }
      continue;
    }
    for (var c = 0; c < row.length; c++) {
      var col = data.have[r][c];
      if (typeof col === 'string') {
        // if an empty space
        if (self.emptyWords.indexOf(col) !== -1) {
          data.have[r][c] = self.emptyWords[0];
          continue;
        }
        // otherwise format the spot
        if (col.indexOf(',') !== -1) {
          data.have[r][c] = col.split(',');
        } else {
          data.have[r][c] = [col, 1];
        }
      } else if (Array.isArray(col)) {
        if (self.emptyWords.indexOf(col[0]) !== -1) {
          data.have[r][c] = self.emptyWords[0];
        }
      }
    }
  }

  return data;
};
