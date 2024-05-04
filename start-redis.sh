#!/bin/bash
# Redis 서버 및 HTTP 헬스체크 서버 시작
redis-server --bind '0.0.0.0' --port 6379 --notify-keyspace-events Ex --daemonize yes
node healthcheck-server.js
