var IntN = require("../index.js"),
    Int32 = IntN(32),
    
    imin = (0x80000000)|0,
    imax = (0x7fffffff)|0,
    iumax = (0xffffffff)>>> 0,
    
    defaultCases = [ // for lessThan, greaterThan etc. comparison to standard JS
        /* 1 */ [0, 0],
        /* 2 */ [1, 1],
        /* 3 */ [-1, -1],
        /* 4 */ [-1, 1],
        /* 5 */ [1, 2],
        /* 6 */ [-2, -1],
        /* 7 */ [imin, 0],
        /* 8 */ [imin, 1],
        /* 9 */ [imin, -1],
        /* 10 */ [imax, 0],
        /* 11 */ [imax, 1],
        /* 12 */ [imax, -1],
        /* 13 */ [imin, imin],
        /* 14 */ [imin, imax],
        /* 15 */ [imax, imax],
        /* 16 */ [0xff, 0xfe],
        /* 17 */ [0xffff, 0xfffe],
        /* 18 */ [0xff, 0xffff],
        /* 19 */ [0xff, 0xffffff],
        /* 20 */ [-256*256, -256*256],
        /* 21 */ [-256*256, -255*256],
        /* 22 */ [-256*256, 255*256],
        /* 23 */ [-256*256*256, -255*256*256],
        /* 24 */ [-256*256*256, 255*256*256],
        /* 25 */ [1, 100]
    ],
    defaultValues = [0, 1, -1, 10, 100, 255, 256, -255, imin, imax],
    defaultRadix = [2, 8, 10, 16, 36];

for (var i=0; i<1000; ++i)
    defaultCases.push([(Math.random()*0xffffffff)|0, (Math.random()*0xffffffff)|0]);

function runCases(method, test, cases) {
    cases = cases || defaultCases;
    cases.forEach(function(c, i) {
        var n = 1;
        try {
            var res, rev;
            switch (method) {
                case 'equals':
                    res = c[0] == c[1];
                    rev = c[1] == c[0];
                    break;
                case 'notEquals':
                    res = c[0] != c[1];
                    rev = c[1] != c[0];
                    break;
                case 'lessThan':
                    res = c[0] < c[1];
                    rev = c[1] < c[0];
                    break;
                case 'lessThanEqual':
                    res = c[0] <= c[1];
                    rev = c[1] <= c[0];
                    break;
                case 'greaterThan':
                    res = c[0] > c[1];
                    rev = c[1] > c[0];
                    break;
                case 'greaterThanEqual':
                    res = c[0] >= c[1];
                    rev = c[1] >= c[0];
                    break;
                case 'add':
                    res = (c[0] + c[1])|0;
                    rev = (c[1] + c[0])|0;
                    break;
                case 'subtract':
                    res = (c[0] - c[1])|0;
                    rev = (c[1] - c[0])|0;
                    break;
                case 'multiply':
                    res = (c[0] * c[1])|0;
                    rev = (c[1] * c[0])|0;
                    break;
                case 'divide':
                    res = c[1] === 0 ? null : (c[0] / c[1])|0;
                    rev = c[0] === 0 ? null : (c[1] / c[0])|0;
                    break;
                case 'modulo':
                    res = c[0] % c[1];
                    rev = c[1] % c[0];
                    break;
                case 'shiftLeft':
                    res = c[0] << c[1];
                    rev = null;
                    break;
                case 'shiftRight':
                    res = c[0] >> c[1];
                    rev = null;
                    break;
                case 'shiftRightUnsigned':
                    res = c[0] >>> c[1];
                    rev = null;
                    break;
                default:
                    throw Error('missing standard javascript comparison for: '+method);
            }
            var a = Int32.fromInt(c[0], c[0] > 0x7fffffff),
                b = Int32.fromInt(c[1], c[1] > 0x7fffffff);
            if (res !== null) {
                var f1 = a[method](b);
                if (typeof f1 === 'boolean')
                    test.strictEqual(f1, res);
                else
                    test.deepEqual(f1.bytes, Int32.fromInt(res).bytes);
                ++n;
            }
            if (rev !== null) {
                var f2 = b[method](a);
                if (typeof f2 === 'boolean')
                    test.strictEqual(f2, rev);
                else
                    test.deepEqual(f2.bytes, Int32.fromInt(rev, rev > 0x7fffffff).bytes);
            }
        } catch (e) {
            e.message += " (case "+(i+1)+"."+n+": "+c[0]+" "+method+" "+c[1]+" ^= "+res+")";
            // console.log(a.toBinary(true)+" "+method+" "+ b.toBinary(true));
            throw e;
        }
    });
}

// Tests compatibility between JavaScript's 32bit integers (that's all we have) and IntN(32)
var suite = {
    
    "isIntN": function(test) {
        test.strictEqual(Int32.isIntN, Int32.isInt32);
        test.strictEqual(Int32.isIntN(undefined), false);
        test.strictEqual(Int32.isIntN(null), false);
        test.strictEqual(Int32.isIntN(1), false);
        test.strictEqual(Int32.isIntN({ bytes: [0,0,0,0] }), false);
        test.strictEqual(Int32.isIntN({ unsigned: false }), false);
        test.strictEqual(Int32.isIntN({ bytes: [0,0,0], unsigned: false }), false);
        test.strictEqual(Int32.isIntN({ bytes: [0,0,0,0], unsigned: false }), true);
        test.strictEqual(Int32.isIntN({ bytes: [0,0,0,0], unsigned: false, foo: "bar" }), true);
        test.strictEqual(Int32.isIntN({ bytes: [256,0,0,0], unsigned: false, foo: "bar" }), true); // This is not checked
        test.done();
    },
    
    "constants": {
    
        "ZERO/UZERO": function(test) {
            test.deepEqual(Int32.ZERO.bytes, [0,0,0,0]);
            test.strictEqual(Int32.ZERO.unsigned, false);
            test.deepEqual(Int32.UZERO.bytes, [0,0,0,0]);
            test.strictEqual(Int32.UZERO.unsigned, true);
            test.done();
        },
        
        "ONE/UONE": function(test) {
            test.deepEqual(Int32.ONE.bytes, [1,0,0,0]);
            test.strictEqual(Int32.ONE.unsigned, false);
            test.deepEqual(Int32.UONE.bytes, [1,0,0,0]);
            test.strictEqual(Int32.UONE.unsigned, true);
            test.done();
        },
        
        "MIN_VALUE": function(test) {
            test.deepEqual(Int32.MIN_VALUE.bytes, [0,0,0,0x80]);
            test.strictEqual(Int32.MIN_VALUE.unsigned, false);
            test.done();
        },
        
        "MAX_VALUE": function(test) {
            test.deepEqual(Int32.MAX_VALUE.bytes, [0xff, 0xff, 0xff, 0x7f]);
            test.strictEqual(Int32.MAX_VALUE.unsigned, false);
            test.done();
        },
        
        "MAX_UNSIGNED_VALUE": function(test) {
            test.deepEqual(Int32.MAX_UNSIGNED_VALUE.bytes, [0xff, 0xff, 0xff, 0xff]);
            test.strictEqual(Int32.MAX_UNSIGNED_VALUE.unsigned, true);
            test.done();
        }
        
    },


    "debugging": {

        "toBinary": function(test) { // Meant for debugging and testing
            test.strictEqual(Int32.ZERO.toBinary()      , "00000000000000000000000000000000"   );
            test.strictEqual(Int32.ZERO.toBinary(true)  , "00000000 00000000 00000000 00000000");
            test.strictEqual(Int32.UZERO.toBinary(true) , "00000000 00000000 00000000 00000000");
            test.strictEqual(Int32.ONE.toBinary(true)   , "00000000 00000000 00000000 00000001");
            test.strictEqual(Int32.UONE.toBinary(true)  , "00000000 00000000 00000000 00000001");
            test.done();
        }

    },
    
    "sign": {
        
        "isSigned/Unsigned": function(test) {
            test.strictEqual(Int32.ONE.isSigned(), true);
            test.strictEqual(Int32.ONE.isUnsigned(), false);
            test.strictEqual(Int32.UONE.isSigned(), false);
            test.strictEqual(Int32.UONE.isUnsigned(), true);
            test.done();
        },
        
        "toSigned/Unsigned": function(test) {
            test.strictEqual(Int32.ONE.toUnsigned().isUnsigned(), true);
            test.strictEqual(Int32.ONE.toSigned(), Int32.ONE);
            test.strictEqual(Int32.UONE.toSigned().isSigned(), true);
            test.strictEqual(Int32.UONE.toUnsigned(), Int32.UONE);
            test.done();
        }
        
    },
    
    "conversion": {
    
        "fromInt": function(test) {
            var one = Int32.fromInt(1),
                uone = Int32.fromInt(1, true);
            test.strictEqual(one.unsigned, false);
            test.strictEqual(uone.unsigned, true);
            test.strictEqual(one.toBinary(true)                 , "00000000 00000000 00000000 00000001");
            test.strictEqual(uone.toBinary(true)                , "00000000 00000000 00000000 00000001");
            test.strictEqual(Int32.fromInt(1).toBinary(true)    , "00000000 00000000 00000000 00000001");
            test.strictEqual(Int32.fromInt(-1).toBinary(true)   , "11111111 11111111 11111111 11111111");
            test.strictEqual(Int32.fromInt(100).toBinary(true)  , "00000000 00000000 00000000 01100100");
            test.strictEqual(Int32.fromInt(imin).toBinary(true) , "10000000 00000000 00000000 00000000");
            test.strictEqual(Int32.fromInt(imax).toBinary(true) , "01111111 11111111 11111111 11111111");
            test.strictEqual(Int32.fromInt(iumax, true).toBinary(true), "11111111 11111111 11111111 11111111");
            test.done();
        },
    
        "toInt": function(test) {
            test.strictEqual(Int32.ZERO.toInt(), 0);
            test.strictEqual(Int32.UZERO.toInt(), 0);
            test.strictEqual(Int32.ONE.toInt(), 1);
            test.strictEqual(Int32.UONE.toInt(), 1);
            test.strictEqual(Int32.NEG_ONE.toInt(), -1);
            test.notStrictEqual(Int32.NEG_ONE.toUnsigned().toInt(), -1);
            test.strictEqual(Int32.NEG_ONE.toUnsigned().toInt(), 0xFFFFFFFF);
            test.ok(Int32.MIN_VALUE.toInt() < 0);
            test.strictEqual(Int32.MIN_VALUE.toInt(), 0x80000000|0);
            test.strictEqual(Int32.MAX_VALUE.toInt(), 0x7fffffff);
            test.ok(Int32.MAX_UNSIGNED_VALUE.toInt() > 0);
            test.strictEqual(Int32.MAX_UNSIGNED_VALUE.toInt(), 0xffffffff);
            test.done();
        },
        
        // Number conversion
        
        "fromNumber": function(test) {
            defaultValues.forEach(function(v) {
                test.strictEqual(Int32.fromNumber(v).toInt(), v);
            });
            test.done();
        },
        
        "toNumber": function(test) {
            test.strictEqual(Int32.ZERO.toNumber(), 0);
            test.strictEqual(Int32.UZERO.toNumber(), 0);
            test.strictEqual(Int32.ONE.toNumber(), 1);
            test.strictEqual(Int32.UONE.toNumber(), 1);
            test.strictEqual(Int32.NEG_ONE.toNumber(), -1);
            test.notStrictEqual(Int32.NEG_ONE.toUnsigned().toNumber(), -1);
            test.strictEqual(Int32.NEG_ONE.toUnsigned().toNumber(), 0xFFFFFFFF);
            test.ok(Int32.MIN_VALUE.toNumber() < 0);
            test.strictEqual(Int32.MIN_VALUE.toNumber(), 0x80000000|0);
            test.strictEqual(Int32.MAX_VALUE.toNumber(), 0x7fffffff);
            test.ok(Int32.MAX_UNSIGNED_VALUE.toNumber() > 0);
            test.strictEqual(Int32.MAX_UNSIGNED_VALUE.toNumber(), 0xffffffff);
            defaultValues.forEach(function(v) {
                test.strictEqual(Int32.fromInt(v).toNumber(), v);
            });
            test.done();
        },
        
        // String conversion
        
        "fromString": function(test) {
            test.strictEqual(Int32.fromString("0", 10).toInt(), 0);
            test.strictEqual(Int32.fromString("-0", 10).toInt(), 0);
            test.strictEqual(Int32.fromString("100", 10).toInt(), 100);
            test.strictEqual(Int32.fromString("ff", 16).toInt(), 255);
            test.strictEqual(Int32.fromString("ffffffff", 16).toInt(), -1);
            defaultValues.forEach(function(v) {
                defaultRadix.forEach(function(r) {
                    var s = v.toString(r);
                    test.strictEqual(Int32.fromString(s, r).toInt(), v);
                });
            });
            test.done();
        },
        
        "toString": function(test) {
            defaultValues.forEach(function(v) {
                defaultRadix.forEach(function(r) {
                    var s = v.toString(r);
                    test.strictEqual(Int32.fromInt(v).toString(r), s);
                });
            });
            test.done();
        }
        
    },
    
    "bitwise": {
    
        "not": function(test) {
            var val = new Int32([0x00, 0xff, 0x01, 0x80]);
            test.notStrictEqual(val.not(), val);
            test.deepEqual(val.not().bytes, [0xff, 0x00, 0xfe, 0x7f]);
            test.strictEqual(val.      toBinary(true), "10000000 00000001 11111111 00000000");
            test.strictEqual(val.not().toBinary(true), "01111111 11111110 00000000 11111111");
            test.done();
        },
        
        "and": function(test) {
            var val1 = new Int32([0x00, 0xff, 0xf4, 0x80]);
            var val2 = new Int32([0x80, 0x8f, 0xff, 0x12]);
            test.notStrictEqual(val1.and(val2), val1);
            test.notStrictEqual(val1.and(val2), val2);
            test.strictEqual(val1.          toBinary(true), "10000000 11110100 11111111 00000000");
            test.strictEqual(val2.          toBinary(true), "00010010 11111111 10001111 10000000");
            test.strictEqual(val1.and(val2).toBinary(true), "00000000 11110100 10001111 00000000");
            test.done();
        },
        
        "or": function(test) {
            var val1 = new Int32([0x00, 0xff, 0xf4, 0x80]);
            var val2 = new Int32([0x80, 0x8f, 0xff, 0x12]);
            test.notStrictEqual(val1.or(val2), val1);
            test.notStrictEqual(val1.or(val2), val2);
            test.strictEqual(val1.or(val2).toBinary(true), "10010010 11111111 11111111 10000000");
            test.done();
        },
        
        "xor": function(test) {
            var val1 = new Int32([0x00, 0xff, 0xf4, 0x80]);
            var val2 = new Int32([0x80, 0x8f, 0xff, 0x12]);
            test.notStrictEqual(val1.xor(val2), val1);
            test.notStrictEqual(val1.xor(val2), val2);
            test.strictEqual(val1.xor(val2).toBinary(true), "10010010 00001011 01110000 10000000");
            test.done();
        },
        
        "shiftLeft": function(test) {
            test.strictEqual(Int32.prototype.lsh, Int32.prototype.shiftLeft);
            test.strictEqual(Int32.prototype.leftShift, Int32.prototype.shiftLeft);
            var val1 = new Int32([0x00, 0xff, 0xf4, 0x80]);
            test.strictEqual(val1.              toBinary(true), "10000000 11110100 11111111 00000000");
            test.strictEqual(val1.shiftLeft(0), val1);
            test.notStrictEqual(val1.shiftLeft(1), val1);
            test.strictEqual(val1.shiftLeft(32), val1);
            test.strictEqual(val1.shiftLeft( 1).toBinary(true), "00000001 11101001 11111110 00000000");
            test.strictEqual(val1.shiftLeft( 3).toBinary(true), "00000111 10100111 11111000 00000000");
            test.strictEqual(val1.shiftLeft( 7).toBinary(true), "01111010 01111111 10000000 00000000");
            test.strictEqual(val1.shiftLeft( 8).toBinary(true), "11110100 11111111 00000000 00000000");
            test.strictEqual(val1.shiftLeft( 9).toBinary(true), "11101001 11111110 00000000 00000000");
            test.strictEqual(val1.shiftLeft(15).toBinary(true), "01111111 10000000 00000000 00000000");
            test.strictEqual(val1.shiftLeft(16).toBinary(true), "11111111 00000000 00000000 00000000");
            test.strictEqual(val1.shiftLeft(17).toBinary(true), "11111110 00000000 00000000 00000000");
            test.strictEqual(val1.shiftLeft(23).toBinary(true), "10000000 00000000 00000000 00000000");
            test.strictEqual(val1.shiftLeft(24).toBinary(true), "00000000 00000000 00000000 00000000");
            test.strictEqual(val1.shiftLeft(25).toBinary(true), "00000000 00000000 00000000 00000000");
            test.strictEqual(val1.shiftLeft(33).toBinary(true), "00000001 11101001 11111110 00000000"); // << 1
            
            var cases = [];
            for (var i=0; i<1000; ++i) {
                cases.push([(Math.random()*0xffffffff)|0, (Math.random()*32)|0]);
            }
            runCases("shiftLeft", test, cases);
            
            test.done();
        },
        
        "shiftRight/Unsigned": function(test) {
            test.strictEqual(Int32.prototype.rsh, Int32.prototype.shiftRight);
            test.strictEqual(Int32.prototype.rightShift, Int32.prototype.shiftRight);
            var val1 = new Int32([0x00, 0xff, 0xf4, 0x80]);
            test.strictEqual(val1.toBinary(true), "10000000 11110100 11111111 00000000");
            test.strictEqual(val1.shiftRight(0) , val1);
            test.notStrictEqual(val1.shiftRight(1), val1);
            test.strictEqual(val1.shiftRight(32), val1);
            test.strictEqual(val1.shiftRight( 1).toBinary(true)      , "11000000 01111010 01111111 10000000");
            test.strictEqual(val1.shiftRight( 1, true).toBinary(true), "01000000 01111010 01111111 10000000");
            test.strictEqual(val1.shiftRight( 3).toBinary(true)      , "11110000 00011110 10011111 11100000");
            test.strictEqual(val1.shiftRight( 3, true).toBinary(true), "00010000 00011110 10011111 11100000");
            test.strictEqual(val1.shiftRight( 7).toBinary(true)      , "11111111 00000001 11101001 11111110");
            test.strictEqual(val1.shiftRight( 7, true).toBinary(true), "00000001 00000001 11101001 11111110");
            test.strictEqual(val1.shiftRight( 8).toBinary(true)      , "11111111 10000000 11110100 11111111");
            test.strictEqual(val1.shiftRight( 8, true).toBinary(true), "00000000 10000000 11110100 11111111");
            test.strictEqual(val1.shiftRight( 9).toBinary(true)      , "11111111 11000000 01111010 01111111");
            test.strictEqual(val1.shiftRight( 9, true).toBinary(true), "00000000 01000000 01111010 01111111");
            test.strictEqual(val1.shiftRight(15).toBinary(true)      , "11111111 11111111 00000001 11101001");
            test.strictEqual(val1.shiftRight(15, true).toBinary(true), "00000000 00000001 00000001 11101001");
            test.strictEqual(val1.shiftRight(16).toBinary(true)      , "11111111 11111111 10000000 11110100");
            test.strictEqual(val1.shiftRight(16, true).toBinary(true), "00000000 00000000 10000000 11110100");
            test.strictEqual(val1.shiftRight(17).toBinary(true)      , "11111111 11111111 11000000 01111010");
            test.strictEqual(val1.shiftRight(17, true).toBinary(true), "00000000 00000000 01000000 01111010");
            test.strictEqual(val1.shiftRight(33).toBinary(true)      , "11000000 01111010 01111111 10000000"); // << 1
            test.strictEqual(val1.shiftRight(33, true).toBinary(true), "01000000 01111010 01111111 10000000");
    
            var cases = [];
            for (var i=0; i<1000; ++i) {
                cases.push([(Math.random()*0xffffffff)|0, (Math.random()*32)|0]);
            }
            runCases("shiftRight", test, cases);
            runCases("shiftRightUnsigned", test, cases);
    
            test.done();
        }
    },
    
    "arithmetic": {
    
        "add": function(test) {
            var val = new Int32([0x02, 0, 0, 0]);
            test.strictEqual(val.add(2).toBinary(true), "00000000 00000000 00000000 00000100");
            runCases("add", test);
            test.done();
        },
    
        "negate": function(test) {
            test.strictEqual(Int32.ONE.negate().toBinary(true)    , "11111111 11111111 11111111 11111111");
            test.strictEqual(Int32.NEG_ONE.negate().toBinary(true), "00000000 00000000 00000000 00000001");
            // -MIN_VALUE = MIN_VALUE, e.g. for IntN(8): MIN_VALUE = -128, not() = MAX_VALUE = 127, add(1) = MIN_VALUE
            test.deepEqual(Int32.MIN_VALUE.not(), Int32.MAX_VALUE);
            test.deepEqual(Int32.MIN_VALUE.not().add(1), Int32.MIN_VALUE);
            test.deepEqual(Int32.MIN_VALUE.negate(), Int32.MIN_VALUE);
            test.strictEqual(Int32.MAX_VALUE.negate().toBinary(true), "10000000 00000000 00000000 00000001");
            test.done();
        },
        
        "subtract": function(test) {
            var val = new Int32([0x02, 0, 0, 0]);
            test.strictEqual(val.subtract(2).toBinary(true), "00000000 00000000 00000000 00000000");
            runCases('subtract', test);
            test.done();
        },
        
        "compare": function(test) {
            test.strictEqual(Int32.prototype.comp, Int32.prototype.compare);
            test.strictEqual(Int32.ONE.compare(Int32.ZERO), 1);
            test.strictEqual(Int32.NEG_ONE.compare(Int32.ZERO), -1);
            test.done();
        },
    
        "equals": function(test) {
            test.strictEqual(Int32.prototype.eq, Int32.prototype.equals);
            test.strictEqual(Int32.prototype.equal, Int32.prototype.equals);
            runCases("equals", test);
            test.done();
        },
        
        "notEquals": function(test) {
            test.strictEqual(Int32.prototype.ne, Int32.prototype.notEquals);
            test.strictEqual(Int32.prototype.notEqual, Int32.prototype.notEquals);
            runCases("notEquals", test);
            test.done();
        },
        
        "lessThan": function(test) {
            runCases("lessThan", test);
            test.done();
        },
        
        "lessThanEqual": function(test) {
            runCases("lessThanEqual", test);
            
            // In case this errors:
            
            // test.log("node says "+(imax|0)+" <= "+(imin|0)+" is", (imax|0) <= (imin|0));
            // test.log("          "+(imax|0)+" <  "+(imin|0)+" is", (imax|0) < (imin|0));
            // test.log(process.version);
            
            // At least node v0.10.12 on windows is affected
            // Firefox 31.0                      is not affected
            // Chrome 35.0.1916.153 m            is not affected
            // node v0.10.30                     is not affected
    
            test.done();
        },
        
        "greaterThan": function(test) {
            test.strictEqual(Int32.prototype.gt, Int32.prototype.greaterThan);
            runCases("greaterThan", test);
            test.done();
        },
        
        "greaterThanEqual": function(test) {
            test.strictEqual(Int32.prototype.gte, Int32.prototype.greaterThanEqual);
            runCases("greaterThanEqual", test);
            test.done();
        },
        
        "multiply": function(test) {
            test.strictEqual(Int32.prototype.mult, Int32.prototype.multiply);
            test.deepEqual(Int32.ZERO.multiply(Int32.ZERO), Int32.ZERO);
            test.deepEqual(Int32.ZERO.multiply(Int32.ONE), Int32.ZERO);
            test.deepEqual(Int32.ONE.multiply(Int32.ZERO), Int32.ZERO);
            test.deepEqual(Int32.ONE.multiply(Int32.NEG_ONE), Int32.NEG_ONE);
            test.deepEqual(Int32.NEG_ONE.multiply(Int32.ONE), Int32.NEG_ONE);
            test.deepEqual(Int32.NEG_ONE.multiply(Int32.NEG_ONE), Int32.ONE);
            test.deepEqual(Int32.MAX_VALUE.multiply(Int32.MIN_VALUE), Int32.MIN_VALUE);
            test.deepEqual(Int32.MIN_VALUE.multiply(Int32.MAX_VALUE), Int32.MIN_VALUE);
            test.strictEqual(Int32.MAX_VALUE.multiply(Int32.MAX_VALUE).toInt(), 1);
            // Multiplicating large 32 bit integers may exceed the integer precision of JS doubles (53 bit), so:
            var cases = defaultCases.filter(function(c) {
                return (c[0] & 0xfffff) === c[0] || (c[1] & 0xfffff) === c[1]; // One value must be max. 20 bit (32+20=52)
            });
            for (var i=0; i<500; ++i)
                cases.push([(Math.random()*0xffffffff)|0, (Math.random()*0xfffff)|0]);
            runCases("multiply", test, cases);
            test.done();
        },
        
        "divide": function(test) {
            test.strictEqual(Int32.prototype.div, Int32.prototype.divide);
            runCases("divide", test);
            test.done();
        }
    }
};

module.exports = {
    "Int32": suite
};