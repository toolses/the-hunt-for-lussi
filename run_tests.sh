#!/bin/bash
cd /c/Dev/Repos/the-hunt-for-lussi
npx playwright test tests/e2e/treats.spec.js > /c/Dev/Repos/the-hunt-for-lussi/test_treats_output.txt 2>&1
echo "treats_exit=$?" >> /c/Dev/Repos/the-hunt-for-lussi/test_treats_output.txt
npx playwright test tests/e2e/navigation.spec.js --grep "Mamma" > /c/Dev/Repos/the-hunt-for-lussi/test_nav_output.txt 2>&1
echo "nav_exit=$?" >> /c/Dev/Repos/the-hunt-for-lussi/test_nav_output.txt
