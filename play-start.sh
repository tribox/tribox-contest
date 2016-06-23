#!/bin/sh

# Change contest app directory
cd `dirname $0`

# Check if the play app process is already setup
APPPROC=`./play-check.sh`

if [ ! ${APPPROC} ]
then
    rm ./target/universal/stage/RUNNING_PID
    nohup target/universal/stage/bin/contest -Dconfig.file=`dirname $0`/conf/prod.conf > /dev/null 2> /dev/null < /dev/null &
    echo "Play app has just started"
else
    echo "Already started pid:"
    echo $APPPROC
fi

cd -
