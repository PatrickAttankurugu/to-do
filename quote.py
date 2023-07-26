import requests
import json
import random

response = requests.get("https://type.fit/api/quotes")
quotes = json.loads(response.text)
quote = random.choice(quotes)

print(quote['text'])
