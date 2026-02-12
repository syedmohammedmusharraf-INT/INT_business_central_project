from pydantic import BaseModel


class Post(BaseModel):
    index : int
    content : str
    summary : str

class Posts(BaseModel):
    posts : list[Post] 


class content(BaseModel):
    name: str
    bio : str
    profile_summary : str
    posts : list[Post]
    experience : str
    skills : str

