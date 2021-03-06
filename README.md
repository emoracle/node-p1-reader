# Node.js P1-Reader
Node.js package for reading and parsing data from the P1 port of a Dutch Smart Meter.
Data is parsed according to the official 2011 DSMR4.0 specification by Netbeheer Nederland, which is used by most popular Kaifa and Landis+Gyr Smart Meters.

How to use
==========

The serial connection is automatically opened on initiating the P1-Reader. Use the `reading` event to start receiving data, which should come in every 10 seconds.

```
var P1Reader = require('p1-reader');
var p1Reader = new P1Reader();

p1Reader.on('reading', function(data) {
    console.log('Currently consuming: ' + data.electricity.received.actual.reading + data.electricity.received.actual.unit);
});

p1Reader.on('error', function(err) {
    console.log('Error while reading: ' + err);
});
```

Events
======

The module emits the following events:

* `reading` : When a reading is received via the serial connection (should be on a 10 second interval)
* `error` : When the serial connection emits an error
* `close` : When the serial connection closes for some reason

Reading structure
=================

The `reading` event returns the following data structure:

```
{
    "meterType": "ISk5\2MT382-1000",
    "version": "42",
    "timestamp": "2010-12-09T10:30:20.000Z",
    "equipmentId": "4B384547303034303436333935353037",
    "textMessage": {
        "codes": "3031203631203831",
        "message": "0123456789:;<=>?0123456789:;<=>?0123456789:;<=>?0123456789:;<=>?0123456789:;<=>?"
    },
    "electricity": {
        "received": {
            "tariff1": {
                "reading": 123456.789,
                "unit": "kWh"
            },
            "tariff2": {
                "reading": 123456.789,
                "unit": "kWh"
            },
            "actual": {
                "reading": 1.193,
                "unit": "kW"
            }
        },
        "delivered": {
            "tariff1": {
                "reading": 123456.789,
                "unit": "kWh"
            },
            "tariff2": {
                "reading": 123456.789,
                "unit": "kWh"
            },
            "actual": {
                "reading": 0,
                "unit": "kW"
            }
        },
        "tariffIndicator": 2,
        "threshold": {
            "value": 16.1,
            "unit": "kW"
        },
        "switchPosition": "1",
        "numberOfPowerFailures": 4,
        "numberOfLongPowerFailures": 2,
        "longPowerFailureLog": {
            "count": 2,
            "log": [
                {
                    "endOfFailure": "2010-12-08T14:24:15.000Z",
                    "duration": 240,
                    "unit": "s"
                },
                {
                    "endOfFailure": "2010-12-08T14:10:04.000Z",
                    "duration": 301,
                    "unit": "s"
                }
            ]
        },
        "voltageSags": {
            "L1": 2,
            "L2": 1,
            "L3": 0
        },
        "voltageSwell": {
            "L1": 0,
            "L2": 3,
            "L3": 0
        },
        "instantaneous": {
            "current": {
                "L1": {
                    "reading": 1,
                    "unit": "A"
                },
                "L2": {
                    "reading": 2,
                    "unit": "A"
                },
                "L3": {
                    "reading": 3,
                    "unit": "A"
                }
            },
            "power": {
                "positive": {
                    "L1": {
                        "reading": 1.111,
                        "unit": "kW"
                    },
                    "L2": {
                        "reading": 2.222,
                        "unit": "kW"
                    },
                    "L3": {
                        "reading": 3.333,
                        "unit": "kW"
                    }
                },
                "negative": {
                    "L1": {
                        "reading": 4.444,
                        "unit": "kW"
                    },
                    "L2": {
                        "reading": 5.555,
                        "unit": "kW"
                    },
                    "L3": {
                        "reading": 6.666,
                        "unit": "kW"
                    }
                }
            }
        }
    },
    "gas": {
        "deviceType": "003",
        "equipmentId": "3232323241424344313233343536373839",
        "timestamp": "2010-12-09T10:00:00.000Z",
        "reading": 12785.123,
        "unit": "m3",
        "valvePosition": "1"
    }
}
```

Debug mode
==========

In debug mode all raw and parsed packages are written to 2 separate log files (debug-data-raw.log and debug-data-parsed.log) and stored in the directory from which the module was triggered.

Provide the `debug` option parameter to run the module in debug mode:

```
var p1Reader = new P1Reader({debug: true});
```

Official DSMR documentation
===========================

The official DSMR Smart Meter P1 interface documentation from Netbeheer Nederland can be found here:
http://www.netbeheernederland.nl/publicaties/publicatie/?documentregistrationid=1745033
This documentation was used as a reference to create and verify this module.