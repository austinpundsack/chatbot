from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from typing import Dict, List
from haystack import Pipeline, Document
from haystack.components.builders import PromptBuilder
from haystack.components.embedders import OpenAITextEmbedder
from haystack.components.generators import OpenAIGenerator
from haystack.components.retrievers import InMemoryEmbeddingRetriever
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.utils import Secret
import traceback 
import os

def chatbot_pipeline(document_store: InMemoryDocumentStore,
                    openai_api_key: str) -> Pipeline:
    # Create the embedder
    text_embedder = OpenAITextEmbedder(api_key=Secret.from_token(openai_api_key), model="text-embedding-3-small")

    # Create the retriever
    retriever = InMemoryEmbeddingRetriever(document_store=document_store, top_k=5)

    template = """
        You are a helpful and knowledgeable AI assistant. Your goal is to provide clear and concise answers to user questions.

        - If the question is factual, provide a direct and accurate response.
        - If the question requires an explanation, be as informative as possible.
        - If the question is opinion-based, remain neutral and provide a balanced perspective.
        - If you don't know the answer, say so honestly instead of making up information.
        - If the user asks something inappropriate or harmful, politely refuse to answer.

        You may also reference the provided documents when relevant.

        Documents:
        {% for doc in documents %}
        Title: {{ doc.meta.get('title', 'No Title') }}
        Content: {{ doc.content }}
        URL: {{ doc.meta.get('url', 'No URL') }}
        {% endfor %}

        User's question: {{ question }}

        <FORMAT>
        Respond in JSON format:
        {
            "answer": "Your answer here",
            "recommended_urls": ["List of relevant URLs from the documents above, if applicable"]
        }

        Answer:
        """
    
    prompt_builder = PromptBuilder(template=template)

    generator = OpenAIGenerator(
        api_key=Secret.from_token(openai_api_key),
        model="gpt-4o-mini",
        generation_kwargs={"max_tokens": 4096, "temperature": 0}
    )

    answer_pipeline = Pipeline()
    answer_pipeline.add_component("embedder", text_embedder)
    answer_pipeline.add_component("retriever", retriever)
    answer_pipeline.add_component("prompt_builder", prompt_builder)
    answer_pipeline.add_component("generator", generator)

    # Connect the components
    answer_pipeline.connect("embedder.embedding", "retriever.query_embedding")
    answer_pipeline.connect("retriever.documents", "prompt_builder.documents")
    answer_pipeline.connect("prompt_builder.prompt", "generator.prompt")

    return answer_pipeline

chatbot = chatbot_pipeline

@csrf_exempt
def chatbot_view(request):
    try:
        if request.method != "POST":
            return JsonResponse({"error": "Invalid request method"}, status=405)

        data = json.loads(request.body)
        message = data.get("message", "")

        if not message:
            return JsonResponse({"error": "Empty message"}, status=400)

        # Initialize an in-memory document store
        document_store = InMemoryDocumentStore()

        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            return JsonResponse({"error": "OpenAI API key is missing"}, status=500)

        chatbot_instance = chatbot_pipeline(document_store, openai_api_key)

        # Run pipeline
        result = chatbot_instance.run({
            "embedder": {"text": message},
            "prompt_builder": {"question": message}
        })

        response_text = result["generator"]["replies"][0]

        return JsonResponse({"response": response_text})

    except Exception as e:
        error_message = str(e)
        print("Error in chat_view:", error_message)
        traceback.print_exc()  # Print full error traceback

        return JsonResponse({"error": error_message}, status=500)