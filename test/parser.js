'use strict';

/* global describe:false, it:false */

var chai = require('chai');
var expect = chai.expect;
var parser = require('../lib/parser.js');

describe('parameterized.parser()', function() {
  it('parses plain objects', function() {
    expect(parser().parse({ param: 'val' })).to.eql({
      null: { param: 'val' }
    });
    expect(parser().parse({ null: { param: 'val' } })).to.eql({
      null: { param: 'val' }
    });
  });

  it('parses args with no tasks', function() {
    expect(parser().parse('--param val')).to.eql({
      null: { param: 'val' }
    });
    expect(parser().parse('--param1 val --param2 --param3 val3')).to.eql({
      null: { param1: 'val', param2: true, param3: 'val3' }
    });
    expect(parser().parse('-abc val -de -f')).to.eql({
      null: { a: true, b: true, c: 'val', d: true, e: true, f: true }
    });
    expect(parser().parse('--param1=val --param2')).to.eql({
      null: { param1: 'val', param2: true }
    });
  });

  it('parses args with tasks', function() {
    expect(parser().parse('--param --param0 val0 ' +
                          'task1 --param1 val1 ' +
                          'task2 --param2 --param3 val3')).to.eql({
      null: { param: true, param0: 'val0' },
      task1: { param1: 'val1' },
      task2: { param2: true, param3: 'val3' }
    });
    expect(parser().parse('-xyz valz ' +
                          'task1 -abc valc ' +
                          'task2 -de -f')).to.eql({
      null: { x: true, y: true, z: 'valz' },
      task1: { a: true, b: true, c: 'valc' },
      task2: { d: true, e: true, f: true }
    });
    expect(parser().parse('--param --param0=val0 ' +
                          'task1 --param1=val1 ' +
                          'task2 --param2')).to.eql({
      null: { param: true, param0: 'val0' },
      task1: { param1: 'val1' },
      task2: { param2: true }
    });
  });

  it('supports .alias()', function() {
    expect(parser().alias('p', 'param').parse('-p val')).to.eql({
      null: { p: 'val', param: 'val' }
    });
  });

  it('supports .number()', function() {
    expect(parser().number('p', 'param').parse('-p 1')).to.eql({
      null: { p: 1 }
    });
    expect(parser().number('p', 'param').parse('-p -1')).to.eql({
      null: { p: -1 }
    });
    expect(parser().number('p', 'param').parse('-p 0x01')).to.eql({
      null: { p: 1 }
    });
    expect(parser().number('p', 'param').parse('-p val')).to.eql({
      null: { p: NaN }
    });
  });

  it('supports .string()', function() {
    expect(parser().string('p', 'param').parse('-p 1')).to.eql({
      null: { p: '1' }
    });
    expect(parser().string('p', 'param').parse('-p -1')).to.eql({
      null: { p: '-1' }
    });
    expect(parser().string('p', 'param').parse('-p 0x01')).to.eql({
      null: { p: '0x01' }
    });
    expect(parser().string('p', 'param').parse('-p val')).to.eql({
      null: { p: 'val' }
    });
    expect(parser().string('p', 'param').parse('-p')).to.eql({
      null: { p: '' }
    });
  });

  it('supports .choices()', function() {
    expect(parser().choices('p', ['v1', 'v2']).parse('-p v2')).to.eql({
      null: { p: 'v2' }
    });
    expect(function() {
      parser().choices('p', ['v1', 'v2']).parse('-p v3')
    }).to.throw(Error);
  });

  it('supports .normalize()', function() {
    expect(parser().normalize('p').parse('-p foo//bar')).to.eql({
      null: { p: 'foo/bar' }
    });
  });

  it('fails for unsupported argument types', function() {
    expect(function() { parser().parse(/param/) }).to.throw(Error);
  });

});
