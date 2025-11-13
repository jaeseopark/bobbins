import os
from typing import Literal, Tuple, TypedDict, List

from openai import OpenAI


class ChatMessage(TypedDict):
    role: Literal['user', 'assistant']
    content: str


client = OpenAI(
    # This is the default and can be omitted
    api_key=os.environ.get("OPENAI_API_KEY"),
)


def askgpt(question: str, chat_log: List[ChatMessage]) -> Tuple[str, list]:
    assert question, "question cannot be blank"
    chat_log = chat_log or list()
    chat_log.append({'role': 'user', 'content': question})
    completion = client.chat.completions.create(
        messages=chat_log,
        model="gpt-4o",
    )
    answer = completion.choices[0].message.content
    chat_log.append({'role': 'assistant', 'content': answer})
    return answer, chat_log
