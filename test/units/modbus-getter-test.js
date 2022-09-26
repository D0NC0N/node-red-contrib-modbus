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

var injectNode = require('@node-red/nodes/core/common/20-inject.js')

var clientNode = require('../../src/modbus-client.js')
var serverNode = require('../../src/modbus-server.js')
var getterNode = require('../../src/modbus-getter.js')
var ioConfigNode = require('../../src/modbus-io-config')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

var testGetterNodes = [injectNode, ioConfigNode, clientNode, serverNode, getterNode]

var testFlows = require('./flows/modbus-getter-flows')

describe('Getter node Testing', function () {
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
    it('simple Node should be loaded without client config', function (done) {
      helper.load([clientNode, serverNode, getterNode], [
        {
          "id": "3ffe153acc21d72b",
          "type": "modbus-getter",
          "name": "modbusGetter",
          "showStatusActivities": false,
          "showErrors": false,
          "logIOActivities": false,
          "unitid": "",
          "dataType": "",
          "adr": "",
          "quantity": "",
          "useIOFile": false,
          "ioFile": "",
          "useIOForPayload": false,
          "emptyMsgOnFail": false,
          "keepMsgProperties": false,
          "wires": [
            [],
            []
          ]
        }
      ], function () {
        const modbusGetter = helper.getNode('3ffe153acc21d72b')
        modbusGetter.should.have.property('name', 'modbusGetter')

        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple Node should be loaded', function (done) {
      helper.load([clientNode, serverNode, getterNode], testFlows.testGetterWithClientFlow, function () {
        const modbusServer = helper.getNode('996023fe.ea04b')
        modbusServer.should.have.property('name', 'modbusServer')

        const modbusClient = helper.getNode('9660d4a8f8cc2b44')
        modbusClient.should.have.property('name', 'modbusClient')

        const modbusGetter = helper.getNode('322daf89.be8dd')
        modbusGetter.should.have.property('name', 'modbusGetter')

        done()
      }, function () {
        helper.log('function callback')
      })
    })

    it('simple flow with inject should be loaded', function (done) {
      helper.load([injectNode, clientNode, serverNode, getterNode], testFlows.testInjectGetterWithClientFlow, function () {
        const h1 = helper.getNode('h1')
        let counter = 0
        h1.on('input', function (msg) {
          counter++
          if (counter === 1) {
            done()
          }
        })
      }, function () {
        helper.log('function callback')
      })
    })

    it('should work as simple flow with inject and IO', function (done) {
      this.timeout(3000)
      testFlows.testGetterFlowWithInjectIo[1].serverPort = "5810"
      testFlows.testGetterFlowWithInjectIo[5].tcpPort = "5810"
      const flow = Array.from(testFlows.testGetterFlowWithInjectIo)
      helper.load(testGetterNodes, flow, function () {
        const modbusGetter = helper.getNode('a9b0b8a7cec1de86')
        const h1 = helper.getNode('dee228d8d9eaea8a')
        let counter = 0
        h1.on('input', function (msg) {
          counter++
          if (modbusGetter.bufferMessageList.size === 0 && counter === 1) {
            done()
          }
        })
      }, function () {
        helper.log('function callback')
      })
    })

    it('should work as simple flow with inject and IO with read done', function (done) {
      this.timeout(3000)
      testFlows.testGetterFlowWithInjectIo[1].serverPort = 5811
      testFlows.testGetterFlowWithInjectIo[5].tcpPort = 5811
      const flow = Array.from(testFlows.testGetterFlowWithInjectIo)
      helper.load(testGetterNodes, flow, function () {
        const modbusGetter = helper.getNode('a9b0b8a7cec1de86')
        let counter = 0
        modbusGetter.on('modbusGetterNodeDone', function (msg) {
          counter++
          if (modbusGetter.bufferMessageList.size === 0 && counter === 1) {
            done()
          }
        })
      }, function () {
        helper.log('function callback')
      })
    })

    it('should work as simple flow with wrong write inject and IO', function (done) {
      helper.load(testGetterNodes, testFlows.testGetterFlow, function () {
        const modbusGetter = helper.getNode('cea01c8.36f8f6')
        setTimeout(function () {
          modbusGetter.receive({ payload: '{ "value": "true", "fc": 5, "unitid": 1,"address": 0, "quantity": 4 }' })
          done()
        }, 800)
      }, function () {
        helper.log('function callback')
      })
    })

    it('should work as simple flow with wrong address inject and IO', function (done) {
      helper.load(testGetterNodes, testFlows.testGetterFlow, function () {
        const modbusGetter = helper.getNode('cea01c8.36f8f6')
        setTimeout(function () {
          modbusGetter.receive({ payload: '{ "fc": 1, "unitid": 1,"address": -1, "quantity": 4 }' })
          done()
        }, 800)
      }, function () {
        helper.log('function callback')
      })
    })

    it('should work as simple flow with wrong quantity inject and IO', function (done) {
      helper.load(testGetterNodes, testFlows.testGetterFlow, function () {
        const modbusGetter = helper.getNode('cea01c8.36f8f6')
        setTimeout(function () {
          modbusGetter.receive({ payload: '{ "fc": 1, "unitid": 1,"address": 0, "quantity": -1 }' })
          done()
        }, 800)
      }, function () {
        helper.log('function callback')
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/modbus-getter/invalid').expect(404).end(done)
    })
  })
})