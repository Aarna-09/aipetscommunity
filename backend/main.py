
# from fastapi import FastAPI, File, UploadFile, Form
# from typing import List, Optional
# import json
# from fastapi import FastAPI, File, UploadFile
# from fastapi.middleware.cors import CORSMiddleware
# from dotenv import load_dotenv
# from ai_engine import analyze_pet, analyze_pet_video,analyze_pet_text
# import uvicorn
# from fastapi.staticfiles import StaticFiles


# load_dotenv()

# app = FastAPI()


# app.mount("/static", StaticFiles(directory="static"), name="static")
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# @app.get("/")
# def root():
#     return {"status": "PawCare API running!"}

# @app.post("/analyze-text")
# async def analyze_text(request: dict):
#     from ai_engine import analyze_pet_text
#     description = request.get("description", "")
#     return analyze_pet_text(description)

# @app.post("/analyze")
# async def analyze(
#     file: UploadFile = File(None), 
#     description: str = Form(None)
# ):
#     if not file and not description:
#         return {"error": "No input provided"}
    
#     # If there is a file, analyze it
#     if file:
#         contents = await file.read()
#         mime_type = file.content_type
#         if mime_type.startswith("video/"):
#             result = analyze_pet_video(contents)
#         else:
#             result = analyze_pet(contents, mime_type)
#         return result
    
#     # If only text is provided
#     return analyze_pet_text(description)

# if __name__ == "__main__":
#     uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

# from fastapi import FastAPI, File, UploadFile, Form
# from typing import List, Optional
# import json
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import FileResponse
# from dotenv import load_dotenv
# from ai_engine import analyze_pet, analyze_pet_video, analyze_pet_text
# import uvicorn
# from fastapi.staticfiles import StaticFiles
# import os

# load_dotenv()

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Serve static assets (logo, etc.)
# app.mount("/static", StaticFiles(directory="static"), name="static")

# # Serve frontend files (index.html, script.js, style.css)
# FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")

# @app.get("/")
# def root():
#     return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

# @app.get("/script.js")
# def serve_script():
#     return FileResponse(os.path.join(FRONTEND_DIR, "script.js"))

# @app.get("/style.css")
# def serve_style():
#     return FileResponse(os.path.join(FRONTEND_DIR, "style.css"))

# @app.post("/analyze-text")
# async def analyze_text(request: dict):
#     description = request.get("description", "")
#     return analyze_pet_text(description)

# @app.post("/analyze")
# async def analyze(
#     file: UploadFile = File(None),
#     description: str = Form(None)
# ):
#     if not file and not description:
#         return {"error": "No input provided"}

#     if file:
#         contents = await file.read()
#         mime_type = file.content_type
#         if mime_type.startswith("video/"):
#             result = analyze_pet_video(contents)
#         else:
#             result = analyze_pet(contents, mime_type)
#         return result

from fastapi import FastAPI, File, UploadFile, Form
from typing import List, Optional
import json
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from ai_engine import analyze_pet, analyze_pet_video, analyze_pet_text
import uvicorn
from fastapi.staticfiles import StaticFiles
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Frontend folder ka path
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")

# Static files (logo) ab frontend/static se serve hongi
app.mount("/static", StaticFiles(directory=os.path.join(FRONTEND_DIR, "static")), name="static")

@app.get("/")
def root():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

@app.get("/script.js")
def serve_script():
    return FileResponse(os.path.join(FRONTEND_DIR, "script.js"))

@app.get("/style.css")
def serve_style():
    return FileResponse(os.path.join(FRONTEND_DIR, "style.css"))
@app.post("/analyze-text")
async def analyze_text(request: dict):
    description = request.get("description", "")
    return analyze_pet_text(description)

@app.post("/analyze")
async def analyze(
    file: UploadFile = File(None),
    description: str = Form(None)
):
    if not file and not description:
        return {"error": "No input provided"}

    if file:
        contents = await file.read()
        mime_type = file.content_type
        if mime_type.startswith("video/"):
            result = analyze_pet_video(contents)
        else:
            result = analyze_pet(contents, mime_type)
        return result

    return analyze_pet_text(description)

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
#     return analyze_pet_text(description)

# if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
