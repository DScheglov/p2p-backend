#!/bin/bash
NOW=$(date +"%Y-%m-%d %H:%M:%S")
MASTER_COMMIT_MSG="changes $NOW"
PAGES_COMMIT_MSG="coverage $NOW"

TMP_DIR="./cvrg"
CVRG_DIR="./coverage"

rm $TMP_DIR -rf
git add .
git commit -m '"'"$MASTER_COMMIT_MSG"'"'
git push origin master

mkdir $TMP_DIR
mv "$CVRG_DIR"/* $TMP_DIR
git checkout gh-pages

cp "$TMP_DIR"/* $CVRG_DIR -rf
rm $TMP_DIR -rf
git add "$CVRG_DIR"/. -A
git commit -m '"'"$PAGES_COMMIT_MSG"'"'
git push origin gh-pages
git checkout master
