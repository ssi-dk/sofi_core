#!/usr/bin/env bash

# Simply run rsync on all combinations of the given path to keep in sync
for source in $@; do
  for dest in $@; do
    if [ "$source" != "$dest" ]; then
      rsync -Pru "$source"/* "$dest"
    fi
  done
done