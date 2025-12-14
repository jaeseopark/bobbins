import os
from typing import Literal, Tuple, TypedDict, List
from pydantic import BaseModel

from openai import OpenAI
from prompts import CS_MESSAGE_GENERATION_SYSTEM_INSTRUCTION


class ChatMessage(TypedDict):
    role: Literal['user', 'assistant']
    content: str


class CsMessageResponse(BaseModel):
    """Structured response for customer service messages"""
    options: List[str]


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


def generate_cs_responses(message_text: str) -> List[str]:
    """Generate customer service response options using structured output"""
    assert message_text, "message_text cannot be blank"
    
    # First API call: Generate initial responses
    response = client.responses.parse(
        model="gpt-4o",
        input=[
            {
                "role": "system",
                "content": CS_MESSAGE_GENERATION_SYSTEM_INSTRUCTION,
            },
            {
                "role": "user",
                "content": message_text
            }
        ],
        text_format=CsMessageResponse,
    )

    responseOptions = response.output_parsed.options
    
    if not responseOptions:
        return []
    
    return responseOptions
