from api import get_api
from models.gpt import GPT
import json

def main():
    api = get_api()

    text_data = api.receive()
    data = json.loads(text_data)

    agent = GPT()
    finalResponse = agent.sendPrompt(data)

    api.send({"type": "exit", "message": finalResponse})


if __name__ == "__main__":
    main()