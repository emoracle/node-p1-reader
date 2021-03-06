var EventEmitter = require('events');
var util = require('util');
var fs = require('fs');
var serialPort = require('serialport');
var SerialPort = serialPort.SerialPort;

var serialPortFound = false;
var debugMode = false;
var availablePorts = [];
var constructor;

var parsePacket = require('./lib/parsePacket');
var debug = require('./lib/debug');
var config = require('./config/config.json');

function P1Reader(options) {
    if (options && options.debug) {
        debugMode = options.debug;
        console.log('DEBUG MODE ACTIVE');
    }

    constructor = this;

    EventEmitter.call(this);

    // Automatically find the correct serial port
    serialPort.list(function (err, ports) {
        if (err) {
            throw new Error('Serialports could not be listed: ' + err);
        }

        availablePorts = ports;

        _setupSerialConnection();
    });
}

util.inherits(P1Reader, EventEmitter);

module.exports = P1Reader;


/**
 * Setup serial port connection
 */
function _setupSerialConnection() {
    var port = availablePorts[0].comName;

    console.log('Trying to connect to Smart Meter via port: ' + port);

    // Open serial port connection
    var sp = new SerialPort(port, config.serialPort);

    var received = '';

    sp.on('open', function () {
        console.log('Serial connection established');

        sp.on('data', function (data) {
            received += data.toString();

            var startCharPos = received.indexOf(config.startCharacter);
            var endCharPos = received.indexOf(config.stopCharacter);

            // Package is complete if the start- and stop character are received
            if (startCharPos >= 0 && endCharPos >= 0) {
                var packet = received.substr(startCharPos, endCharPos - startCharPos);
                var parsedPacket = parsePacket(packet);

                received = '';

                // Verify if connected to the correct serial port at initialization
                if (!serialPortFound) {
                    if (parsedPacket.timestamp !== null) {
                        console.log('Connection with Smart Meter established');
                        serialPortFound = true;
                    } else {
                        _tryNextSerialPort();
                    }
                }

                // Write packet to log if debug mode is active
                if (debugMode) {
                    debug.writeToLogFile(packet, parsedPacket);
                }

                if (parsedPacket.timestamp !== null) {
                    constructor.emit('reading', parsedPacket);
                } else {
                    console.error('Invalid reading received, event not emitted.');
                    // TODO: set a limiter on the amount of these errors, restart if it occured 5 times
                }
            }
        });
    });

    sp.on('error', function (error) {
        // Reject this port if we haven't found the correct port yet
        if (!serialPortFound) {
            _tryNextSerialPort();
        }

        constructor.emit('error', error);
    });

    sp.on('close', function () {
        constructor.emit('close');
    });
}

/**
 * Try the next serial port if available
 */
function _tryNextSerialPort() {
    availablePorts.shift();

    if (availablePorts.length > 0) {
        console.log('Smart Meter not attached to this port, trying another one...');
        _setupSerialConnection();
    } else {
        throw new Error('Could not find an attached Smart Meter');
    }
}