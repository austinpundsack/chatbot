from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from haystack import Pipeline, Document
from haystack.utils import Secret
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.components.retrievers.in_memory import InMemoryBM25Retriever
from haystack.components.generators import OpenAIGenerator
from haystack.components.builders.prompt_builder import PromptBuilder

def chatbot_app(request):
    template = loader.get_template('homepage.html')
    return HttpResponse(template.render())
