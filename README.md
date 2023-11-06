## InnerMosaic
This project is built in 2023 UB Hacking, it's an exploration of your inner self and your mood

Feature:
- [x] Auth
- [x] Journaling
- [x] Chat with guide
- [x] Emotions/color analyzer
- [x] Date picking
- [x] Color matching (for mood) 

Tech Stack
- React Native
- MongoDB
- Flask
- Tensorflow (training model)

## To start this project: (frontend)
1. Go at `.env.sample` and replace the following credentials/API keys, rename to `.env`
2. Download independencies in terminal > `cd mobile` and then `npm install`
3. Download the expo app, run this code, and scan the qr code: `npx expo start`

## To start this project: (backend)
1. Ensure you have the latest pip installed on your machine:
```python.exe -m pip install --upgrade pip```
2. Install virtual environment to keep dependencies in the scope of your project folders:
```pip install virtualenv```
3. Create and name the virtual environment (venv is the name and can be replaced as required):
```virtualenv venv```
4. Optional: If scripts are restricted:
```Set-ExecutionPolicy RemoteSigned -Scope CurrentUser```
5. Activate environment:
Windows: ```.\venv\Scripts\activate ```
MacOS/Linus: ```source venv/bin/activate```
6. Install dependencies:
```pip install -r requirements.txt```
7. Go at `.env.sample` and replace the following credentials/API keys, rename to `.env`
8. In terminal, do `flask --app app.py --debug run`

## Port forwarding for routes:
Set up your ports in VSCode like the following
![Screenshot 2023-11-05 at 6 56 02 PM](https://github.com/bentan1020/innerMosaic/assets/73725152/3d892de2-532c-41cf-9742-7e3483a07204)

## Notes/Challenges:
- the 'web' folder is a sales page for our app
- the 'ai' folder trains an AI model mounted in Collab Notebook
- mobile and backend serves as an entry way
