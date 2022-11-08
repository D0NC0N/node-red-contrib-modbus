/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2016,2017,2018,2019,2020,2021,2022 Klaus Landsdorf (http://node-red.plus/)
 * All rights reserved.
 * node-red-contrib-modbus - The BSD 3-Clause License
 *
 **/

'use strict'

const functionNode = require('@node-red/nodes/core/function/10-function.js')
const injectNode = require('@node-red/nodes/core/common/20-inject.js')
const nodeUnderTest = require('../../src/modbus-response-filter.js')
const nodeIOConfig = require('../../src/modbus-io-config.js')
const clientNode = require('../../src/modbus-client.js')
const serverNode = require('../../src/modbus-server.js')
const flexGetterNode = require('../../src/modbus-flex-getter.js')

const testResponseFilterNodes = [functionNode, injectNode, nodeUnderTest, nodeIOConfig, clientNode, serverNode, flexGetterNode]

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const testFlows = require('./flows/modbus-response-filter-flows')

describe('Response Filter node Testing', function () {
  before(function (done) {
    helper.startServer(function () {
      done()
    })
  })

  afterEach(function (done) {
    helper.unload().then(function () {
      done()
    }).catch(function () {
      done()
    })
  })

  after(function (done) {
    helper.stopServer(function () {
      done()
    })
  })

  describe('Node', function () {
    it('should be loaded', function (done) {
      helper.load(testResponseFilterNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusNode = helper.getNode('50f41d03.d1eff4')
        modbusNode.should.have.property('name', 'ModbusResponseFilter')
        modbusNode.should.have.property('filter', 'FilterTest')
        done()
      })
    })

    it('should be loaded and handle wrong input without crash', function (done) {
      helper.load(testResponseFilterNodes, testFlows.testHandleWrongInputWithoutCrashFlow, function () {
        const modbusResponseFilter = helper.getNode('50f41d03.d1eff4')
        setTimeout(function () {
          modbusResponseFilter.receive({})
          done()
        }, 800)
      })
    })

    it('should stop on input with wrong count of registers', function (done) {
      helper.load(testResponseFilterNodes, testFlows.testStopOnInputWrongCountFlow, function () {
        const modbusResponseFilter = helper.getNode('50f41d03.d1eff4')
        setTimeout(function () {
          modbusResponseFilter.receive({ payload: {}, registers: [0, 1, 0, 1] })
          done()
        }, 800)
      })
    })

    it('should work on input with exact count registers', function (done) {
      helper.load(testResponseFilterNodes, testFlows.testWorkOnInputExactCountFlow, function () {
        const modbusResponseFilter = helper.getNode('50f41d03.d1eff4')
        setTimeout(function () {
          modbusResponseFilter.receive({ payload: {}, registers: [0, 1, 0, 1] })
          done()
        }, 800)
      })
    })

    it('should work with Flex Getter', function (done) {
      helper.load(testResponseFilterNodes, testFlows.testWorkWithFlexGetterFlow, function () {
        const modbusNode = helper.getNode('5a7d9b84.a543a4')
        modbusNode.should.have.property('name', 'ModbusResponseFilter')
        modbusNode.should.have.property('filter', 'bOperationActive')

        const h1 = helper.getNode('h1')
        h1.on('input', function () {
          done()
        })
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-reponse-filter/invalid').expect(404).end(done)
    })
  })
})
