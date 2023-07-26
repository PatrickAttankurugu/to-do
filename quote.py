import requests
import json
import random
import sys

try:
    response = requests.get("https://type.fit/api/quotes")
    response.raise_for_status()
except requests.exceptions.RequestException as err:
    print ("Something went wrong: ",err)
    sys.exit()

quotes = json.loads(response.text)
quote = random.choice(quotes)
print(quote['text'])
