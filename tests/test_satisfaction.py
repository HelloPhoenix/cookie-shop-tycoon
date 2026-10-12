from playwright.sync_api import sync_playwright
import threading
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(Path(__file__).resolve().parents[1])))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}'
checks=0
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=browser.new_page()
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.route('https://fonts.googleapis.com/**',lambda r:r.abort())
    page.add_init_script('Math.random = () => 0.5')
    page.goto(url)
    def load(history):
        page.evaluate('(s)=>localStorage.setItem("phoenixs-cookie-shop-v1",JSON.stringify(s))',dict(cash=100,seed=0,history=history))
        page.reload()
    def day(price,demand,sold):
        return dict(day=1,baked=sold,price=price,ads=0,demand=demand,sold=sold,revenue=sold*price,expenses=5+sold*.5,profit=0,cash=100)
    cases=[(1,10,10,82,'bargain'),(2,10,10,78,'fair'),(3,10,10,78,'fair'),(3.25,10,10,77,'high'),(20,10,10,68,'high'),(2,10,5,67,'5 of 10'),(2,10,0,60,'10 of 10'),(2,0,0,75,'No customers')]
    for price,demand,sold,score,reason in cases:
        load([day(price,demand,sold)])
        assert page.locator('#satisfaction').inner_text()==f'{score}/100'
        assert reason in page.locator('.satisfaction-report').inner_text()
        assert page.locator('#ledger details').count()==1
        assert reason in page.locator('#ledger details').text_content()
        checks+=1
    for history,score in [([day(1,10,10)]*5,100),([day(20,10,0)]*5,0)]:
        load(history)
        assert page.locator('#satisfaction').inner_text()==f'{score}/100'
        assert '(0 points)' in page.locator('.satisfaction-report').inner_text()
        assert 'limited to 0–100' in page.locator('.satisfaction-report').inner_text()
        checks+=1
    load([])
    assert page.locator('#satisfaction').inner_text()=='75/100'
    page.locator('#bake').fill('10000')
    assert page.locator('#run').is_disabled()
    assert page.locator('#satisfaction').inner_text()=='75/100'
    for field,value in [('bake','100'),('price','1.75'),('ads','0')]:page.locator('#'+field).fill(value)
    page.locator('#run').click()
    assert page.locator('#satisfaction').inner_text()=='82/100'
    assert 'Day 2' in page.locator('#day').inner_text()
    saved=page.evaluate('JSON.parse(localStorage.getItem("phoenixs-cookie-shop-v1"))')
    assert saved['satisfaction']==82 and saved['history'][0]['satisfactionChange']==7
    page.reload()
    assert page.locator('#satisfaction').inner_text()=='82/100'
    page.locator('#bake').fill('0');page.locator('#price').fill('20');page.locator('#ads').fill('0')
    page.locator('#run').click()
    assert page.locator('#satisfaction').inner_text()=='57/100'
    assert page.locator('#ledger details').count()==2
    checks+=4
    page.on('dialog',lambda d:d.accept())
    page.locator('#restart').click()
    assert page.locator('#satisfaction').inner_text()=='75/100'
    assert page.locator('#cash').inner_text()=='$100.00'
    assert page.locator('#ledger details').count()==0
    checks+=1
    # Complete a full journey with sufficient seeded cash to exercise the ending.
    page.evaluate('localStorage.setItem("phoenixs-cookie-shop-v1",JSON.stringify({cash:10000,history:[],seed:0}))')
    page.reload()
    for _ in range(30):
        page.locator('#bake').fill('100');page.locator('#price').fill('2');page.locator('#ads').fill('0');page.locator('#run').click()
    assert page.locator('#run').is_disabled()
    assert page.locator('#ledger details').count()==30
    assert page.locator('#satisfaction').inner_text()=='100/100'
    assert page.locator('.satisfaction-report').is_visible()
    page.locator('#next').click()
    assert page.locator('#satisfaction').inner_text()=='75/100'
    checks+=1
    page.set_viewport_size(dict(width=375,height=812))
    assert page.locator('#satisfaction').is_visible()
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    checks+=1
    assert not errors,errors
    browser.close()
server.shutdown()
print(f'PASS: {checks} scenarios; scoring, bounds, migration, gameplay, affordability, persistence, both resets, 30-day completion, mobile layout; no browser errors')
