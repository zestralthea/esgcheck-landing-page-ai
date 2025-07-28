#!/bin/bash
# Script to deploy ESG analysis functions and database schema

set -e

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}ESG Analysis Deployment Script${NC}"
echo -e "${YELLOW}================================${NC}"

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Supabase CLI is not installed. Please install it with 'npm install -g supabase'${NC}"
    exit 1
fi

# Step 1: Check if project is linked
echo -e "\n${GREEN}Step 1: Checking Supabase project status...${NC}"
if ! supabase status &> /dev/null; then
    echo -e "${YELLOW}Project not linked to Supabase. Please enter your project reference:${NC}"
    read -p "Supabase Project Ref: " PROJECT_REF
    supabase link --project-ref "$PROJECT_REF"
else
    echo -e "${GREEN}Project already linked to Supabase.${NC}"
fi

# Step 2: Set environment variables
echo -e "\n${GREEN}Step 2: Setting up environment variables...${NC}"
echo -e "${YELLOW}Please enter your OpenAI API key:${NC}"
read -p "OpenAI API Key: " OPENAI_API_KEY
echo -e "${YELLOW}Please enter your PDFMonkey API key:${NC}"
read -p "PDFMonkey API Key: " PDFMONKEY_API_KEY
echo -e "${YELLOW}Please enter your PDFMonkey Template ID:${NC}"
read -p "PDFMonkey Template ID: " PDFMONKEY_TEMPLATE_ID

echo -e "${GREEN}Setting Supabase secrets...${NC}"
supabase secrets set OPENAI_API_KEY="$OPENAI_API_KEY"
supabase secrets set PDFMONKEY_API_KEY="$PDFMONKEY_API_KEY"
supabase secrets set PDFMONKEY_TEMPLATE_ID="$PDFMONKEY_TEMPLATE_ID"

# Step 3: Check and fix migration file names if needed
echo -e "\n${GREEN}Step 3: Checking migration file names...${NC}"
echo -e "${YELLOW}Supabase requires migration files to be named in the format <timestamp>_name.sql${NC}"

# Check if any migration files have incorrect naming format
INCORRECT_FILES=$(find supabase/migrations -name "[0-9]*-*.sql" | wc -l)

if [ $INCORRECT_FILES -gt 0 ]; then
    echo -e "${YELLOW}Found $INCORRECT_FILES migration files with incorrect naming format.${NC}"
    echo -e "${YELLOW}Renaming migration files to the correct format...${NC}"
    
    # Rename migration files with incorrect format
    find supabase/migrations -name "[0-9]*-*.sql" | while read file; do
        filename=$(basename "$file")
        if [[ $filename =~ ^([0-9]{14})-(.+)\.sql$ ]]; then
            timestamp="${BASH_REMATCH[1]}"
            rest="${BASH_REMATCH[2]}"
            new_filename="${timestamp}_${rest}.sql"
            new_path="supabase/migrations/$new_filename"
            echo -e "  Renaming: ${YELLOW}$filename${NC} to ${GREEN}$new_filename${NC}"
            mv "$file" "$new_path"
        fi
    done
    
    echo -e "${GREEN}Migration files renamed to the correct format.${NC}"
fi

# Step 4: Apply database migrations
echo -e "\n${GREEN}Step 4: Applying database migrations...${NC}"
echo -e "${YELLOW}This will create the esg_report_analyses table in your database.${NC}"
read -p "Continue? (y/n): " CONTINUE
if [[ $CONTINUE != "y" && $CONTINUE != "Y" ]]; then
    echo -e "${RED}Deployment aborted.${NC}"
    exit 1
fi

echo -e "${GREEN}Running migrations...${NC}"
supabase db push

# Step 5: Deploy edge functions
echo -e "\n${GREEN}Step 5: Deploying Edge Functions...${NC}"
echo -e "${GREEN}Deploying analyze-esg-report function...${NC}"
supabase functions deploy analyze-esg-report --no-verify-jwt

echo -e "${GREEN}Deploying get-pdf-download-url function...${NC}"
supabase functions deploy get-pdf-download-url --no-verify-jwt

# Step 6: Verify deployment
echo -e "\n${GREEN}Step 6: Verifying deployment...${NC}"
echo -e "${GREEN}Checking functions status...${NC}"
supabase functions list

echo -e "\n${GREEN}ESG Analysis deployment completed successfully!${NC}"
echo -e "${YELLOW}You can now use the AI-powered ESG report analysis feature in your application.${NC}"
echo -e "${YELLOW}Important: The front-end components have been added to your codebase. Make sure to rebuild your application.${NC}"
echo -e "\nTo test the functions locally, run:"
echo -e "${GREEN}supabase functions serve --no-verify-jwt${NC}"