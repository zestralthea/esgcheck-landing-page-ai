#!/bin/bash
# Script to rename migration files to match Supabase's required pattern
# Converts <timestamp>-<name>.sql to <timestamp>_<name>.sql

set -e

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Migration File Renaming Script${NC}"
echo -e "${YELLOW}==============================${NC}"

# Change to migrations directory
cd supabase/migrations

# Count files before renaming
TOTAL_FILES=$(ls -1 *.sql 2>/dev/null | wc -l)
echo -e "${GREEN}Found ${TOTAL_FILES} migration files to process.${NC}"

# Process each .sql file
for file in *.sql; do
    # Check if the file matches the incorrect pattern (has a hyphen after the timestamp)
    if [[ $file =~ ^([0-9]{14})-(.+)\.sql$ ]]; then
        timestamp="${BASH_REMATCH[1]}"
        rest="${BASH_REMATCH[2]}"
        new_filename="${timestamp}_${rest}.sql"
        
        echo -e "Renaming: ${YELLOW}${file}${NC} to ${GREEN}${new_filename}${NC}"
        mv "$file" "$new_filename"
    else
        echo -e "${YELLOW}Skipping ${file} - already in correct format or doesn't match expected pattern.${NC}"
    fi
done

# Count files after renaming
RENAMED_FILES=$(find . -name "[0-9]*_*.sql" | wc -l)
echo -e "\n${GREEN}Renamed ${RENAMED_FILES} out of ${TOTAL_FILES} migration files.${NC}"
echo -e "${YELLOW}Migration files are now in the correct format for Supabase.${NC}"
echo -e "\nYou can now run 'supabase db push' to apply these migrations."