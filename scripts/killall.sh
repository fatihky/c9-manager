kill -9 `ps aux | grep "node /opt/c9sdk" | awk '{print $2}'`
