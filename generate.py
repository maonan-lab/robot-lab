import urllib.request, json, datetime, os, re, time

api_key = os.environ['ANTHROPIC_API_KEY']
today = datetime.date.today().strftime('%Y\u5e74%-m\u6708%-d\u65e5')

def call_claude(prompt):
    payload = json.dumps({
        "model": "claude-sonnet-4-20250514",
        "max_tokens": 4000,
        "tools": [{"type": "web_search_20250305", "name": "web_search"}],
        "messages": [{"role": "user", "content": prompt}]
    }).encode('utf-8')
    req = urllib.request.Request(
        'https://api.anthropic.com/v1/messages',
        data=payload,
        headers={
            'x-api-key': api_key,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
        }
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        data = json.loads(resp.read())
    return ''.join(b['text'] for b in data['content'] if b['type'] == 'text')

def extract_json(text):
    s = text.index('{')
    depth = 0
    e = -1
    for i, c in enumerate(text[s:], s):
        if c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                e = i
                break
    raw = text[s:e+1]
    raw = raw.replace('\u201c', '"').replace('\u201d', '"')
    raw = re.sub(r',\s*([}\]])', r'\1', raw)
    return json.loads(raw)

now = datetime.datetime.utcnow().isoformat() + 'Z'
os.makedirs('public/data', exist_ok=True)

news_prompt = (
    'Search for the latest robotics news today (' + today + ') and return as pure JSON only. '
    'Search for: humanoid robots (Figure AI, 1X, Unitree, Boston Dynamics), '
    'robot open source on GitHub, arXiv cs.RO papers, robotics industry news, RL breakthroughs. '
    'CRITICAL: Output ONLY raw JSON, no markdown. '
    'Format: {"items":[{"title":"Chinese title","summary":"Chinese 2-3 sentence summary",'
    '"reason":"Chinese reason","source":"Source name","time":"\u4eca\u65e5",'
    '"category":"hardware or software or paper or industry or opensource",'
    '"score":75,"tags":["tag"],"url":"real URL or empty string"}],"total_searched":80} '
    'Return 8-10 items with real URLs where found. JSON only.'
)

print('Searching robot news for ' + today + '...')
news_text = call_claude(news_prompt)
news = extract_json(news_text)
news['generatedAt'] = now
with open('public/data/news.json', 'w', encoding='utf-8') as f:
    json.dump(news, f, ensure_ascii=False, indent=2)
print('News done: ' + str(len(news.get('items', []))) + ' items')

time.sleep(3)

daily_prompt = (
    'Search for today (' + today + ') robotics news and create a digest. '
    'Output ONLY raw JSON: '
    '{"sections":[{"title":"section name in Chinese","items":["item1","item2","item3"]}]} '
    'Use 4 sections: \u786c\u4ef6\u53d1\u5e03, \u5f00\u6e90\u9879\u76ee, \u8bba\u6587\u901f\u9012, \u4ea7\u4e1a\u52a8\u6001. '
    'Each 3-4 items in Chinese. JSON only.'
)

print('Generating daily digest...')
daily_text = call_claude(daily_prompt)
daily = extract_json(daily_text)
daily['generatedAt'] = now
with open('public/data/daily.json', 'w', encoding='utf-8') as f:
    json.dump(daily, f, ensure_ascii=False, indent=2)
print('Daily done: ' + str(len(daily.get('sections', []))) + ' sections')
