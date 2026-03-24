@echo off
cd d:\fullStack

:: Initialize Git
git init
echo node_modules/ > .gitignore
echo .env >> .gitignore
echo firebaseServiceKey.json >> .gitignore
echo .DS_Store >> .gitignore

:: Setup Backend
mkdir backend
cd backend
copy NUL package.json
echo {"name":"backend","version":"1.0.0"} > package.json
call npm install express cors dotenv firebase-admin

:: Setup Frontend
cd d:\fullStack
call npx -y create-vite@latest frontend --template react
cd frontend
call npm install axios react-router-dom lucide-react date-fns
call npm install -D tailwindcss postcss autoprefixer
call npx tailwindcss init -p

cd d:\fullStack
git add .
