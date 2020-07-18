#!/bin/bash

tar -cvf bundle.tgz \
    client \
    db \
    details/public.md \
    server/{package.json,tsconfig.json,yarn.lock,src,Dockerfile,.dockerignore} \
    docker-compose.yaml