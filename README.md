S4GGZ Website

This is the static site for the S4GGZ project (HTML/CSS/JS). Use the instructions below to push this repository to GitHub from your machine.

Quick push instructions (PowerShell):

# 1) Initialize (only if not already a git repo)
# cd to the project root and run:
cd "c:\Users\Gabriel\Documents\GitHub\S4GGZ";
if (-not (Test-Path .git)) { git init }

# 2) Stage and commit all files
git add --all
git commit -m "Initial commit - S4GGZ site"

# 3) Create a GitHub repo (use the GitHub website or gh CLI). Example using `gh`:
# gh repo create <username>/<repo-name> --public --source=. --remote=origin --push

# 4) Or add remote manually and push (replace <url> with your repo HTTPS url):
# git remote add origin <url>
# git branch -M main
# git push -u origin main

# Notes:
# - If git is not installed, install Git for Windows: https://git-scm.com/download/win
# - If you prefer SSH, use the SSH repo URL and ensure your key is added to GitHub.
# - If you use the GitHub CLI (`gh`) the `gh repo create` command will guide you and can push the repo automatically.
