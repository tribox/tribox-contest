#!/bin/sh

# Change contest app directory
cd `dirname $0`

ps aux | grep java | grep play | grep contest | grep -v grep | awk '{ print "kill -9", $2 }' | sh

cd -
