# checksource-ai

Frontend app for checking source reliability.

How to publish this project to GitHub

1. Install Git: https://git-scm.com/downloads
2. (Optional) Install GitHub CLI: https://cli.github.com/
3. In the project folder run:

```powershell
git init
git add .
git commit -m "Initial commit"
```

4a. With GitHub CLI:

```powershell
gh repo create <your-username>/checksource-ai --public --source=. --remote=origin --push
```

4b. Or via GitHub website: create a new repo, then run:

```powershell
git remote add origin https://github.com/<your-username>/checksource-ai.git
git branch -M main
git push -u origin main
```

If you need me to run these steps here, install and make `git` and `gh` available in the terminal and tell me to continue.
