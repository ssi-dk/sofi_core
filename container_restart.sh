#!/bin/bash

# Settings
CONTAINER_NAME="bifrost_queue_broker"

# Variables for date and hour
today=$(date +"%B %-d")  # e.g., March 11
hour=$(date +"%H") # e.g., 13:05:54

# Get logs and searches for the string "LIMS", the date, and the hour
if ! sudo journalctl --unit=sofi.service | grep -E "^$today $hour.*(LIMS|TBR)"; then
    echo "No logs found matching criteria, restarting Docker container..."
    sudo docker restart $CONTAINER_NAME
fi