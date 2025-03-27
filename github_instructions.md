# Instructions to Push Your Repository to GitHub

## Creating a New Repository on GitHub

1. Visit [https://github.com/new](https://github.com/new) in your web browser
2. Enter "BookStoreApp" as the repository name (this will create the repository at https://github.com/johnnyt16/BookStoreApp)
3. Add a description (optional): "Online Bookstore Application with ASP.NET Core backend and React frontend"
4. Choose "Public" visibility
5. Do NOT initialize with README, .gitignore, or license (since you already have these files)
6. Click "Create repository"

## Pushing Your Existing Repository

After creating the repository on GitHub, run these commands in your terminal:

```bash
# Ensure you're in the project directory
cd /Users/johnmcconkie/Desktop/BookStoreApp

# Set the main branch name
git branch -M main

# Push to GitHub (using johnnyt16 as the username)
git push -u origin main
```

## Authentication Notes

- If prompted for credentials, use your GitHub username (johnnyt16) and personal access token (not password)
- If you need to create a personal access token, visit: [https://github.com/settings/tokens](https://github.com/settings/tokens)
- Select at least these scopes: `repo`, `workflow`, and `read:org`

## Setting Default Branch

After pushing, on GitHub:
1. Go to your repository settings
2. Navigate to "Branches" 
3. Make sure "main" is set as the default branch 