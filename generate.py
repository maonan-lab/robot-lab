import urllib.request, urllib.error, json, datetime, os, re, time

api_key = os.environ['ANTHROPIC_API_KEY']
today_date = datetime.date.today()
today = today_date.strftime('%Y\u5e74%-m\u6708%-d\u65e5')
today_iso = today_date.isoformat()

def call_claude(prompt, retries=3):
    for attempt in range(retries):
        try:
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
            text = ''.join(b['text'] for b in data['content'] if b['type'] == 'text')
            if '{' in text:
                return text
            print('Attempt ' + str(attempt+1) + ': no JSON in response, retrying...')
            print('Response preview: ' + text[:200])
        except Exception as e:
            print('Attempt ' + str(attempt+1) + ' failed: ' + str(e))
        if attempt < retries - 1:
            time.sleep(5)
    raise Exception('All retries failed')

def extract_json(text):
    s = text.index('{')
    depth = 0
    e = -1
    for i, c in enumerate(text[s:], s):
        if c == '{': depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0: e = i; break
    raw = text[s:e+1]
    raw = raw.replace('\u201c', '"').replace('\u201d', '"')
    raw = re.sub(r',\s*([}\]])', r'\1', raw)
    try:
        return json.loads(raw)
    except Exception as e:
        # Try to salvage items array
        m = re.search(r'"items"\s*:\s*(\[.*?\])\s*[,}]', raw, re.DOTALL)
        if m:
            items = json.loads(m.group(1).replace(',]', ']'))
            return {"items": items, "total_searched": 80}
        raise e

now = datetime.datetime.now(datetime.timezone.utc).isoformat()
os.makedirs('public/data', exist_ok=True)

news_prompt = (
    'Today is ' + today_iso + ' (' + today + '). '
    'Search for robotics news published TODAY (' + today_iso + ') or in the last 24 hours. '
    'Focus on: humanoid robots (Figure AI, 1X, Unitree, Boston Dynamics, Tesla Optimus), '
    'robot open source on GitHub, arXiv cs.RO papers, robotics industry news, RL breakthroughs. '
    'Return as pure JSON only, no markdown, no explanation: '
    '{"items":[{"title":"Chinese title","summary":"Chinese summary","reason":"Chinese reason",'
    '"source":"Source","time":"\u4eca\u65e5","category":"hardware or software or paper or industry or opensource",'
    '"score":75,"tags":["tag"],"url":"real URL or empty"}],"total_searched":80} '
    'Return 8-10 items. JSON only.'
)

print('Searching news for ' + today_iso + '...')
news_text = call_claude(news_prompt)
news = extract_json(news_text)
news['generatedAt'] = now
news['date'] = today_iso

with open('public/data/news.json', 'w', encoding='utf-8') as f:
    json.dump(news, f, ensure_ascii=False, indent=2)
with open('public/data/news-' + today_iso + '.json', 'w', encoding='utf-8') as f:
    json.dump(news, f, ensure_ascii=False, indent=2)
print('News done: ' + str(len(news.get('items', []))) + ' items')

time.sleep(5)

daily_prompt = (
    'Today is ' + today_iso + '. '
    'Search for robotics news from today and create a digest. '
    'Output ONLY raw JSON: '
    '{"sections":[{"title":"section in Chinese","items":["item1 in Chinese","item2","item3"]}]} '
    'Use 4 sections: \u786c\u4ef6\u53d1\u5e03, \u5f00\u6e90\u9879\u76ee, \u8bba\u6587\u901f\u9012, \u4ea7\u4e1a\u52a8\u6001. '
    'Each 3-4 items. JSON only.'
)

print('Generating daily digest...')
daily_text = call_claude(daily_prompt)
daily = extract_json(daily_text)
daily['generatedAt'] = now
daily['date'] = today_iso

with open('public/data/daily.json', 'w', encoding='utf-8') as f:
    json.dump(daily, f, ensure_ascii=False, indent=2)
with open('public/data/daily-' + today_iso + '.json', 'w', encoding='utf-8') as f:
    json.dump(daily, f, ensure_ascii=False, indent=2)
print('Daily done: ' + str(len(daily.get('sections', []))) + ' sections')

# Update index
index_file = 'public/data/index.json'
if os.path.exists(index_file):
    with open(index_file) as f:
        idx = json.load(f)
else:
    idx = {"dates": []}
if today_iso not in idx["dates"]:
    idx["dates"].insert(0, today_iso)
    idx["dates"] = idx["dates"][:30]
with open(index_file, 'w') as f:
    json.dump(idx, f, indent=2)
print('Done! Index has ' + str(len(idx["dates"])) + ' dates')
