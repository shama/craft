var test = require('tape')
var createCrafter = require('./');

test('mod format', function(t) {
  t.plan(9);
  var crafter = createCrafter();
  crafter.recipe([
    'shaped ( log+null+log,2 / log+log+log / log+null+log ) > ( ladder,16 )',
    'shaped stick+stick ; stick+stick > planks',
    'shapeless (log,1) > ( log,2 )',
  ].join('\n'));
  t.deepEqual(crafter.recipes[0].when, 'shaped');
  t.deepEqual(crafter.recipes[0].give, ['ladder', 16]);
  t.deepEqual(crafter.recipes[0].have, [
    [['log', 1], 'none',     ['log', 2]],
    [['log', 1], ['log', 1], ['log', 1]],
    [['log', 1], 'none',     ['log', 1]],
  ]);
  t.deepEqual(crafter.recipes[1].when, 'shaped');
  t.deepEqual(crafter.recipes[1].give, ['planks', 1]);
  t.deepEqual(crafter.recipes[1].have, [
    [['stick', 1], ['stick', 1]],
    [['stick', 1], ['stick', 1]],
  ]);
  t.deepEqual(crafter.recipes[2].when, 'shapeless');
  t.deepEqual(crafter.recipes[2].give, ['log', 2]);
  t.deepEqual(crafter.recipes[2].have, [
    [['log', 1]],
  ]);
});

test('mc format', function(t) {
  t.plan(3);
  var crafter = createCrafter();
  crafter.recipe(['diamond', 2], [
    'DDD',
    'D D',
    'DDD',
  ], ['D', 'dirt', 2]);
  t.deepEqual(crafter.recipes[0].when, 'shaped');
  t.deepEqual(crafter.recipes[0].give, ['diamond', 2]);
  t.deepEqual(crafter.recipes[0].have, [
    [['dirt', 2], ['dirt', 2], ['dirt', 2]],
    [['dirt', 2], 'none', ['dirt', 2]],
    [['dirt', 2], ['dirt', 2], ['dirt', 2]],
  ]);
});

test('craft torch', function(t) {
  t.plan(3);
  var result;
  var crafter = createCrafter();
  crafter.recipe({
    have: [
      ['coal'],
      ['stick']
    ],
    give: ['torch', 4]
  });
  result = crafter.craft([
    ['none', 'none', 'none'],
    ['none', 'coal', 'none'],
    ['none', 'stick', 'none'],
  ]);
  t.deepEqual(result, ['torch', 4]);

  result = crafter.craft([
    ['coal'],
    ['stick'],
  ]);
  t.deepEqual(result, ['torch', 4]);

  result = crafter.craft([
    ['none', 'coal'],
    ['stick'],
  ]);
  t.equal(result, false);
});

