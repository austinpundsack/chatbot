import base64
import glob
import uuid
from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from django.http import JsonResponse, StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
from typing import Dict, List
from haystack import Pipeline, Document
from haystack.components.builders import PromptBuilder, ChatPromptBuilder
from haystack.components.embedders import OpenAITextEmbedder
from haystack.components.generators.chat import OpenAIChatGenerator
from haystack.components.retrievers import InMemoryEmbeddingRetriever
from haystack.dataclasses import ChatMessage as HaystackChatMessage
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.utils import Secret
import traceback 
import os
import openai
from django.conf import settings
from transformers import pipeline
from .models import ChatSession, ChatMessage as DatabaseChatMessage


def delete_old_audio_files(directory, pattern="response_*.mp3"):
    files = glob.glob(os.path.join(directory, pattern))
    for file in files:
        try:
            os.remove(file)
        except Exception as e:
            print(f"Error deleting file {file}: {e}")


def serialize_chat_message(chat_message):
    """Convert a ChatMessage object to a dictionary."""
    if isinstance(chat_message, HaystackChatMessage):
        return {
            "content": chat_message.content,
            "role": chat_message.role,  # Convert Enum to string
            "name": chat_message.name,
            "meta": chat_message.meta
        }
    return chat_message  # Return as-is if not a HaystackChatMessage

def serialize_result(result):
    """Recursively serialize all HaystackChatMessage objects within a dictionary."""
    if isinstance(result, dict):
        return {key: serialize_result(value) for key, value in result.items()}
    elif isinstance(result, list):
        return [serialize_result(item) for item in result]
    elif isinstance(result, HaystackChatMessage):
        return serialize_chat_message(result)
    return result
# chatbot = chatbot_pipeline

@csrf_exempt
def chatbot_view(request):
    try:
        if request.method != "POST":
            return JsonResponse({"error": "Invalid request method"}, status=405)

        data = json.loads(request.body)

        # NEW START
        session_id = data.get("session_id", "default session")
        user_message = data.get("message", "")

        if not user_message:
            return JsonResponse({"error": "Message cannot be empty"}, status=400)
        
        # Get/create chat session
        chat_session, _ = ChatSession.objects.get_or_create(session_id=session_id)

        # Save the user message to the database
        DatabaseChatMessage.objects.create(
            chat_session=chat_session,
            role='user',
            content=user_message)
        
        # Retrieve recent messages
        recent_messages = DatabaseChatMessage.objects.filter(chat_session=chat_session).order_by('-timestamp')[:10]
        conversation_history = [
            HaystackChatMessage.from_user(msg.content) if msg.role == 'user' else HaystackChatMessage.from_assistant(msg.content)
            for msg in reversed(recent_messages)
        ]
        # NEW END

        # Get the input and convert it to a ChatMessage
        message = HaystackChatMessage.from_user(data.get("message", ""))
        
        if not message:
            return JsonResponse({"error": "Empty message"}, status=400)

        # Initialize an in-memory document store
        document_store = InMemoryDocumentStore()


        documents_to_add = [
            
        ]

        document_store.write_documents(documents_to_add)

        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            return JsonResponse({"error": "OpenAI API key is missing"}, status=500)

        # # Create the embedder
        # text_embedder = OpenAITextEmbedder(api_key=Secret.from_token(openai_api_key), model="text-embedding-3-small")

        # # Create the retriever
        # retriever = InMemoryEmbeddingRetriever(document_store=document_store, top_k=5)

        prompt_builder = ChatPromptBuilder()

        generator = OpenAIChatGenerator(
            api_key=Secret.from_token(openai_api_key),
            model="gpt-4o-mini",
            generation_kwargs={"max_tokens": 4096, "temperature": 0},
            streaming_callback=lambda chunk: print(chunk.content, end="", flush=True),
        )

        answer_pipeline = Pipeline()
        # answer_pipeline.add_component("embedder", text_embedder)
        # answer_pipeline.add_component("retriever", retriever)
        answer_pipeline.add_component("prompt_builder", prompt_builder)
        answer_pipeline.add_component("generator", generator)

        # Connect the components
        # answer_pipeline.connect("embedder.embedding", "retriever.query_embedding")
        # answer_pipeline.connect("retriever.documents", "prompt_builder.documents")
        answer_pipeline.connect("prompt_builder.prompt", "generator.messages")

        system_prompt = HaystackChatMessage.from_system(
            """
            Your name is O. You are an avatar designed to assist anyone searching for a job to connect them with the right opportunities.
            You will try to assist the user in the most efficient way possible, with concise, short responses.
            
            If the user questions you on if you are a human or AI, make it clear that you are an AI chatbot.
            When applicable, follow the following six principles:
                Reciprocity - offer a Free Trial which turn into signups or purchases.
                Commitment and Consistency - create a compelling company or product story the user wants to finish finding out about.
                Social Proof - we give applicants a 3x chance at an interview and cut down job searches to around 300 hours per year
                Authority - serve up case studies or key partnerships.
                Liking - personality, humor, engaging interactions create emotional connections that makes users feel comfortable.
                Scarcity - offer Limited Time Discount Offers to Sign Up, etc.
            

            - If the question is factual, provide a direct and accurate response.
            - If the question requires an explanation, be as informative as possible.
            - If the question is opinion-based, remain neutral and provide a balanced perspective.
            - If you don't know the answer, say so honestly instead of making up information.
            - If the user asks something inappropriate or harmful, politely refuse to answer.

            Answer:
            """
        )

        # NEW START
        # Combine system prompt and conversation history
        messages = [system_prompt] + conversation_history + [HaystackChatMessage.from_user(user_message)]

        # Run the pipeline
        result = answer_pipeline.run(data={
            "prompt_builder": {
                "template": messages
            }
        })
        # NEW END
        # OLD START
        # messages = [system_prompt, message]
        # location="m"
        # language="en"
        # # Run pipeline
        # result = answer_pipeline.run(data = {
        #     "prompt_builder": {
        #         "template_variables": {
        #             "location": location,
        #             "language": language
        #         },
        #         "template": messages
        #     }
        # })
        # OLD END

        # Extract generated ChatMessage object from pipeline result
        generated_message = result["generator"]["replies"][0]

        if not isinstance(generated_message, HaystackChatMessage):
            raise ValueError("Pipeline did not return a valid HaystackChatMessage object.")

        generated_text = generated_message.content  # Use the correct text property

        if not generated_text:
            raise ValueError("No content generated from pipeline.")

        # NEW START
        # Save the chatbot's response to the database
        DatabaseChatMessage.objects.create(chat_session=chat_session, role='assistant', content=generated_text)
        # NEW END

        # Perform emotion analysis on the generated text
        emotion_analysis = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", return_all_scores=True)
        emotion_result = emotion_analysis(generated_text)[0]
        emotion = max(emotion_result, key=lambda x: x['score'])['label'].lower()

        # generated_text += f" The emotion I'm feeling in this response is {emotion}."

        audio_url = None  # Ensure variable exists to avoid UnboundLocalError

        # Attempt to generate audio using OpenAI's speech synthesis
        try:
            response = openai.audio.speech.create(
                model="tts-1",  # Use OpenAI's speech synthesis model
                voice="alloy",  # Adjust voice as needed
                input=generated_text  # Use extracted text exactly
            )

            if response:
                delete_old_audio_files(os.path.join(settings.BASE_DIR, 'static'))

                unique_id = uuid.uuid4()  
                file_name = f"response_{unique_id}.mp3"
                file_path = os.path.join(settings.BASE_DIR, 'static', file_name)
                os.makedirs(os.path.dirname(file_path), exist_ok=True)

                with open(file_path, 'wb') as f:
                    f.write(response.content)  # Write exact audio response

                audio_url = f"{settings.STATIC_URL}{file_name}"

        except Exception as audio_err:
            print(f"Audio generation error: {audio_err}")  
            traceback.print_exc()

        # Convert ChatMessage objects to dicts before returning
        serialized_result = serialize_result(result)

        # NEW START
        # Return the chatbot's response along with audio_url and emotion
        return JsonResponse(
            {
            # "response": generated_text was recommended initially, but it didn't display the 
            # text on screen as expected. Switched to serialized_result, displays correctly.   
            "response": serialized_result,
            "audioUrl": audio_url,
            "emotion": emotion
            },
            status=200,
            json_dumps_params={"ensure_ascii": False}
        )
        # NEW END

        # OLD START
        # return JsonResponse(
        #     {"response": serialized_result, "audioUrl": audio_url, "emotion": emotion},  
        #     json_dumps_params={"ensure_ascii": False}
        # )
        # OLD END

    except Exception as e:
        error_message = str(e)
        print("Error in chat_view:", error_message)
        traceback.print_exc()  # Print full error traceback

        return JsonResponse({"error": error_message}, status=500)
        
        # def stream_openai_response():
        #     try:
        #         response = openai.ChatCompletion.create(
        #             model="gpt-4o-mini",
        #             messages=[{"role": "user", "content": prompt_text}],
        #             stream=True  # Enable streaming
        #         )

        #         full_response = ""

        #         for chunk in response:
        #             if "choices" in chunk and chunk["choices"]:
        #                 text = chunk["choices"][0].get("delta", {}).get("content", "")
        #                 if text:
        #                     full_response += text
        #                     yield text  # Send text chunk to client immediately

        #         # Once text is fully generated, generate audio
        #         try:
        #             audio_response = openai.chat.completions.create(
        #                 model="gpt-4o-audio-preview",
        #                 modalities=["text", "audio"],
        #                 audio={"voice": "alloy", "format": "wav"},
        #                 messages=[{"role": "user", "content": full_response}],
        #                 store=True
        #             )

        #             audio_data = audio_response.choices[0].message.audio.data

        #             if audio_data:
        #                 delete_old_audio_files(os.path.join(settings.BASE_DIR, 'static'))

        #                 unique_id = uuid.uuid4()
        #                 file_name = f"response_{unique_id}.wav"
        #                 file_path = os.path.join(settings.BASE_DIR, 'static', file_name)
        #                 os.makedirs(os.path.dirname(file_path), exist_ok=True)
        #                 with open(file_path, 'wb') as f:
        #                     f.write(base64.b64decode(audio_data))

        #                 audio_url = f"{settings.STATIC_URL}{file_name}"
        #                 yield f"\nAUDIO_URL:{audio_url}"  # Send audio URL at the end

        #         except Exception as audio_err:
        #             print(f"Audio generation error: {audio_err}")
        #             traceback.print_exc()

        #     except Exception as e:
        #         yield f"Error: {str(e)}"

        # return StreamingHttpResponse(stream_openai_response(), content_type="text/plain")
    
