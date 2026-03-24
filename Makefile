install:
	cd backend && npm install
	cd frontend && npm install

dev:
	start /B cmd /c "cd backend && npm start"
	start /B cmd /c "cd frontend && npm run dev"

# For linux/mac or git bash users
dev-sh:
	(cd backend && npm start) & (cd frontend && npm run dev)
