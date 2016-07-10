/**
 * count-participants.js
 *
 * 指定コンテストの参加者をカウントする。
 * オプションによってはカウント数をデータベースに書き込む。
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
    },
    {
        name: 'inprogress',
        short: 'p',
        type: 'boolean',
        description: 'Set target contest to inProgress.contest',
        example: "'count-participants.js --inprogress' or 'count-participants.js -p"
    },
    {
        name: 'save',
        short: 's',
        type: 'boolean',
        description: 'Store counted value to firebase database',
        example: "'count-participants.js --save' or 'count-participants.js -s"
    }
]);
var argvrun = argv.run();
//console.log(argvrun);

// Target contest id
var cid;


var countParticipants = function() {
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

                var counts = {};
                async.each(Object.keys(Events), function(eid, next) {
                    counts[eid] = 0;
                    Object.keys(Results[eid]).forEach(function(uid) {
                        if (Results[eid][uid].endAt) {
                            counts[eid]++;
                        }
                    });
                    console.log(eid + ': ' + counts[eid]);
                    next();
                }, function(err) {
                    if (err) {
                        console.error(err);
                    } else {
                        if (argvrun.options.save) {
                            contestRef.child('participants').child(cid).set(counts, function(error) {
                                if (error) {
                                    console.error(error);
                                } else {
                                    process.exit(0);
                                }
                            });
                        } else {
                            process.exit(0);
                        }
                    }
                });

            });
            });
        }
    });
};

var main = function() {
    if (argvrun.options.contest) {
        cid = 'c' + argvrun.options.contest;
        countParticipants();
    } else if (argvrun.options.inprogress) {
        contestRef.child('inProgress').child('contest').once('value', function(snap) {
            cid = snap.val();
            countParticipants();
        });
    } else {
        console.error('Specify contest!');
        process.exit(1);
    }
};
main();
