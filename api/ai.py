import os
from typing import Literal, Tuple, TypedDict, List
from pydantic import BaseModel

from openai import OpenAI
from prompts import CS_MESSAGE_GENERATION_PROMPT, CS_MESSAGE_REFINEMENT_INSTRUCTION


class ChatMessage(TypedDict):
    role: Literal['user', 'assistant']
    content: str


class CsMessageResponse(BaseModel):
    """Structured response for customer service messages"""
    responses: List[str]


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
    
    prompt = CS_MESSAGE_GENERATION_PROMPT.format(message_text=message_text)
    
    # First API call: Generate initial responses
    completion = client.beta.chat.completions.parse(
        model="gpt-4o",
        messages=[
            {"role": "user", "content": prompt}
        ],
        response_format=CsMessageResponse,
    )
    
    parsed = completion.choices[0].message.parsed
    initial_responses = parsed.responses if parsed else []
    
    if not initial_responses:
        return []
    
    refine_completion = client.beta.chat.completions.parse(
        model="gpt-4o",
        messages=[
            {'role': 'assistant', 'content': initial_responses},
            {
                "role": "user", 
                "content": CS_MESSAGE_REFINEMENT_INSTRUCTION
            }
        ],
        response_format=CsMessageResponse,
    )
    
    refined_parsed = refine_completion.choices[0].message.parsed
    return refined_parsed.responses if refined_parsed else initial_responses
