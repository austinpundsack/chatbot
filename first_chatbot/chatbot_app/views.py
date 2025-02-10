import base64
import glob
import uuid
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
import openai
from django.conf import settings


def delete_old_audio_files(directory, pattern="response_*.wav"):
    files = glob.glob(os.path.join(directory, pattern))
    for file in files:
        try:
            os.remove(file)
        except Exception as e:
            print(f"Error deleting file {file}: {e}")


def chatbot_pipeline(document_store: InMemoryDocumentStore,
                    openai_api_key: str) -> Pipeline:
    
    # Create the embedder
    text_embedder = OpenAITextEmbedder(api_key=Secret.from_token(openai_api_key), model="text-embedding-3-small")

    # Create the retriever
    retriever = InMemoryEmbeddingRetriever(document_store=document_store, top_k=5)

    template = """
        Your name is O. You are an avatar designed to assist anyone searching for a job to connect them with the right opportunities.
        You will try to assist the user in the most efficient way possible, with concise, short responses.

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


        documents_to_add = [
    Document(
        content="""
        **Software Engineer - Python/Django**

        We are seeking a talented and passionate Software Engineer to join our growing team.  You will be responsible for developing and maintaining our web applications using Python and the Django framework.

        **Responsibilities:**
        * Design, develop, and test web applications
        * Write clean, efficient, and well-documented code
        * Collaborate with other engineers and product managers
        * Participate in code reviews
        * Troubleshoot and debug applications

        **Qualifications:**
        * Strong understanding of Python and Django
        * Experience with web development technologies (HTML, CSS, JavaScript)
        * Familiarity with relational databases (PostgreSQL preferred)
        * Excellent problem-solving and communication skills

        **To Apply:** [https://www.indeed.com/viewjob?jk=a1b2c3d4e5f6g7h8&from=serp&vjs=3](https://www.indeed.com/viewjob?jk=a1b2c3d4e5f6g7h8&from=serp&vjs=3) (Example Link - Replace with real link)
        """,
        meta={"title": "Software Engineer - Python/Django", "url": "https://www.indeed.com/viewjob?jk=a1b2c3d4e5f6g7h8&from=serp&vjs=3"}  # Replace with real link
    ),
    Document(
        content="""
        **Data Scientist**

        We are looking for a Data Scientist to help us extract insights from our data and build machine learning models.  You will work closely with our engineering and product teams to solve challenging problems.

        **Responsibilities:**
        * Collect, clean, and analyze data
        * Develop and deploy machine learning models
        * Communicate findings to stakeholders
        * Stay up-to-date on the latest data science techniques

        **Qualifications:**
        * Strong background in statistics and machine learning
        * Experience with Python and data science libraries (Pandas, NumPy, Scikit-learn)
        * Knowledge of cloud computing platforms (AWS, GCP) is a plus
        * Excellent communication and presentation skills

        **To Apply:** [https://www.linkedin.com/jobs/view/1234567890](https://www.linkedin.com/jobs/view/1234567890) (Example Link - Replace with real link)
        """,
        meta={"title": "Data Scientist", "url": "https://www.linkedin.com/jobs/view/1234567890"}  # Replace with real link
    ),
    Document(
        content="""
        **Product Manager**

        As a Product Manager, you will be responsible for defining and executing the product roadmap for our innovative software products.  You'll work closely with engineering, design, and marketing teams.

        **Responsibilities:**
        * Conduct market research and identify customer needs
        * Define product strategy and prioritize features
        * Write user stories and product specifications
        * Collaborate with engineering to develop and launch products

        **Qualifications:**
        * Proven experience in product management
        * Strong analytical and communication skills
        * Passion for building great products
        * Technical background is a plus

        **To Apply:** [https://www.glassdoor.com/job/product-manager-XYZ-Corp-jobs-E1234567.11,26.htm](https://www.glassdoor.com/job/product-manager-XYZ-Corp-jobs-E1234567.11,26.htm) (Example Link - Replace with real link)
        """,
        meta={"title": "Product Manager", "url": "https://www.glassdoor.com/job/product-manager-XYZ-Corp-jobs-E1234567.11,26.htm"}  # Replace with real link
    ),

    # Add more documents here...

]

        document_store.write_documents(documents_to_add)

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

        try:  # Audio generation block
            audio_response = openai.chat.completions.create(
                model="gpt-4o-audio-preview",  # Or your preferred model
                modalities=["text", "audio"],
                audio={"voice": "alloy", "format": "wav"},  # Adjust as needed
                messages=[{"role": "user", "content": response_text}],  # Use the generated text
                store=True
            )

            audio_data = audio_response.choices[0].message.audio.data

            if audio_data:
                # Delete old audio files
                delete_old_audio_files(os.path.join(settings.BASE_DIR, 'static'))

                unique_id = uuid.uuid4()  # Generate a unique identifier
                file_name = f"response_{unique_id}.wav"
                file_path = os.path.join(settings.BASE_DIR, 'static', file_name)
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                with open(file_path, 'wb') as f:
                    f.write(base64.b64decode(audio_data))

                audio_url = f"{settings.STATIC_URL}{file_name}"

                return JsonResponse({"response": response_text, "audioUrl": audio_url})  # Include audio URL

        except Exception as audio_err:
            print(f"Audio generation error: {audio_err}")  # Log the audio error
            traceback.print_exc()
            # Still return the text response even if audio fails
            return JsonResponse({"response": response_text}) # Return text response even if audio fails

    except Exception as e:
        error_message = str(e)
        print("Error in chat_view:", error_message)
        traceback.print_exc()  # Print full error traceback

        return JsonResponse({"error": error_message}, status=500)