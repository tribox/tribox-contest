#!/bin/sh

pids=(`ps aux | grep java | grep contest | grep -v grep | awk '{ print $2; }'`)
echo ${pids}
