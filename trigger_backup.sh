#!/bin/sh
wget -qO- --post-data '{"type":"completo","engine":"mysql"}' --header='Content-Type:application/json' http://localhost:8102/database/backup
echo ""
wget -qO- --post-data '{"type":"full","engine":"mongodb"}' --header='Content-Type:application/json' http://localhost:8102/database/backup
echo ""
