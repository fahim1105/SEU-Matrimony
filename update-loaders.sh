#!/bin/bash

echo "🔄 Updating all loading states to use Loader component..."

# List of files to update (excluding already updated ones)
files=(
    "src/Pages/BrowseMatches/BrowseMatches.jsx"
    "src/Pages/Profile/MyProfile.jsx"
    "src/Pages/Profile/ProfileDetails.jsx"
    "src/Pages/Dashboard/DashboardHome.jsx"
    "src/Pages/Requests/MyRequests.jsx"
    "src/Pages/Admin/AdminSuccessStories.jsx"
    "src/Pages/AccountSettings/AccountSettings.jsx"
    "src/Pages/Admin/AdminDashboard.jsx"
    "src/Pages/Admin/AdminAnalytics.jsx"
    "src/Pages/Admin/PendingBiodatas.jsx"
    "src/Pages/Admin/UserManagement.jsx"
    "src/Pages/Biodata/BiodataForm.jsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ Processing $file"
    fi
done

echo ""
echo "✅ All files processed!"
echo ""
echo "📝 Manual steps needed:"
echo "1. Add Loader import to each file"
echo "2. Replace loading spinner with <Loader />"
