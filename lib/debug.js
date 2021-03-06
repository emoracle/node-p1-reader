var fs = require('fs');
var config = require('../config/config.json');

/**
 * Write raw and parsed data to log file for debugging purposes
 *
 * @param packet : P1 packet according to DSMR4.0 specification
 */
function writeToLogFile(rawPacket, parsedPacket) {
    var now = new Date().toUTCString();

    fs.appendFile(config.debugRawDataFile, 'Package received at ' + now + ':\n' + rawPacket + '\n\n', function (err) {
        if (err) {
            console.error('Could not write raw package to ' + config.debugRawDataFile);
        }
    });

    fs.appendFile(config.debugParsedDataFile, 'Package received at ' + now + ':\n' + JSON.stringify(parsedPacket, true, 4) + '\n\n', function (err) {
        if (err) {
            console.error('Could not write parsed package to ' + config.debugParsedDataFile);
        }
    });
}

module.exports.writeToLogFile = writeToLogFile;