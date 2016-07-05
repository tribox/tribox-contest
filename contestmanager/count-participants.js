/**
 * count-participants.js
 *
 * 指定コンテストの参加者をカウントする。
 */

var async = require('async');

var Config = require('./config.js');

var Firebase = require('firebase');
var contestRef = new Firebase('https://' + Config.CONTESTAPP + '.firebaseio.com/');

// Create admin user
var FirebaseTokenGenerator = require('firebase-token-generator');
var tokenGenerator = new FirebaseTokenGenerator(Config.CONTESTAPP_SECRET);
var token = tokenGenerator.createToken(
    { uid: '1', some: 'arbitrary', data: 'here' },
    { admin: true, debug: true }
);

var argv = require('argv');
argv.option([
    {
        name: 'contest',
        short: 'c',
        type: 'string',
        description: 'Target contest',
        example: "'count-participants.js --contest=2016121' or 'count-participants.js -c 2016121'"
    }
]);
var argvrun = argv.run();
//console.log(argvrun);

var countParticipants = function(cid) {
    // admin 権限でログインしてから操作する
    contestRef.authWithCustomToken(token, function(error, authData) {
        if (error) {
            console.error('Authentication Failed!', error);
        } else {
            //console.log('Authenticated successfully with payload:', authData);

            contestRef.child('events').once('value', function(snapEvents) {
                var Events = snapEvents.val();
                //console.dir(Events);
            contestRef.child('results').child(cid).once('value', function(snapResults) {
                var Results = snapResults.val();
                //console.dir(Results);

                async.each(Object.keys(Events), function(eid, next) {
                    var counts = 0;
                    Object.keys(Results[eid]).forEach(function(uid) {
                        if (Results[eid][uid].endAt) {
                            counts++;
                        }
                    });
                    console.log(eid + ': ' + counts);
                    next();
                }, function(err) {
                    if (err) {
                        console.error(err);
                    } else {
                        process.exit(0);
                    }
                });

            });
            });
        }
    });
};

var main = function() {
    if (argvrun.options.contest) {
        var targetContest = 'c' + argvrun.options.contest;
        countParticipants(targetContest);
    } else {
        process.exit(1);
    }
};
main();
