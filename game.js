(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const money = n => n.toLocaleString('en-US', {style:'currency', currency:'USD'});
  const storageKey = 'phoenixs-cookie-shop-v1';
  const conditions = [
    {name:'A lovely neighborhood day',icon:'☀️',factor:1,tip:'Steady foot traffic. A good day to find your rhythm.'},
    {name:'Rain in the forecast',icon:'🌧️',factor:.7,tip:'Fewer people out walking. Consider a smaller batch.'},
    {name:'The weekend market is in town',icon:'🌻',factor:1.35,tip:'More hungry visitors are expected today.'},
    {name:'A cool, cozy afternoon',icon:'☕',factor:1.1,tip:'A warm cookie sounds especially good today.'}
  ];
  let state;
  try { state = JSON.parse(localStorage.getItem(storageKey)); } catch {}
  if (!state || !Array.isArray(state.history) || !Number.isFinite(state.cash) || state.history.length > 30) state = fresh();
  // Recompute from the ledger so existing saves receive the same scoring rules.
  let satisfaction = 75;
  for (const day of state.history) {
    Object.assign(day, satisfactionResult(satisfaction, day.price, day.demand, day.sold));
    satisfaction = day.satisfaction;
  }
  state.satisfaction = satisfaction;
  function fresh(){return {cash:100,history:[],satisfaction:75,seed:Math.floor(Math.random()*1000000)}}
  function satisfactionResult(previous, price, demand, sold){
    const priceChange = price < 2 ? 4 : price <= 3 ? 0 : -Math.min(10, Math.ceil((price-3)*2));
    const missed = Math.max(0, demand-sold);
    const inventoryChange = demand === 0 ? 0 : missed === 0 ? 3 : -Math.ceil(missed/demand*15);
    const satisfaction = Math.max(0, Math.min(100, previous+priceChange+inventoryChange));
    const signed = n => n > 0 ? `+${n}` : String(n);
    const priceReason = price < 2 ? 'Customers loved the bargain price' : price <= 3 ? 'Customers considered the price fair' : 'Customers felt the price was high';
    const inventoryReason = demand === 0 ? 'No customers arrived; inventory had no effect' : missed === 0 ? 'Every customer could buy a cookie' : `${missed} of ${demand} customers could not buy a cookie`;
    const limit = satisfaction !== previous+priceChange+inventoryChange ? ' The score is limited to 0–100.' : '';
    return {satisfaction, satisfactionChange:satisfaction-previous,
      satisfactionReason:`${priceReason} (${signed(priceChange)} points). ${inventoryReason} (${signed(inventoryChange)} points).${limit}`};
  }
  function satisfactionSummary(day){
    const change = day.satisfactionChange;
    return `${day.satisfaction}/100 (${change > 0 ? '+' : ''}${change} points)`;
  }
  function save(){try{localStorage.setItem(storageKey,JSON.stringify(state))}catch{}}
  function weather(day){return conditions[day===0?0:(state.seed+day*7)%conditions.length]}
  function finished(){return state.history.length>=30 || state.cash<5}
  function cost(){return Number($('bake').value)*.5 + Number($('ads').value)+5}
  function updateCost(){const valid=$('plan').checkValidity();$('cost').textContent=money(cost());$('run').disabled=finished()||!valid||cost()>state.cash;$('error').textContent=!finished()&&valid&&cost()>state.cash?'This plan costs more than your available cash. Try a smaller batch or less advertising.':''}
  function render(){
    const count=state.history.length, total=state.history.reduce((a,d)=>a+d.profit,0), last=state.history[count-1];
    $('satisfaction').textContent=`${state.satisfaction}/100`;
    $('cash').textContent=money(state.cash);$('day').innerHTML=`Day ${Math.min(count+1,30)} <small>/ 30</small>`;$('progress').style.width=`${count/30*100}%`;
    $('totalProfit').textContent=money(total);$('totalProfit').className=total<0?'negative':'';$('totalSold').innerHTML=`${state.history.reduce((a,d)=>a+d.sold,0)} <small>happy bites</small>`;
    $('planDay').textContent=`DAY ${String(Math.min(count+1,30)).padStart(2,'0')} · YOUR GAME PLAN`;
    const w=weather(count);$('forecast').textContent=`${w.icon} ${w.name}. ${w.tip}`;
    document.querySelector('.pill').textContent=count===0?'Fresh start':finished()?'Shop closed':'Let’s bake';
    $('ledgerCount').textContent=`${count} ${count===1?'day':'days'} in the books`;
    if(count) $('ledger').innerHTML=[...state.history].reverse().map(d=>`<tr><td>${String(d.day).padStart(2,'0')}</td><td>${d.baked} / ${d.sold}</td><td>${money(d.price)}</td><td>${money(d.revenue)}</td><td>${money(d.expenses)}</td><td class="${d.profit<0?'negative':'positive'}">${money(d.profit)}</td><td>${money(d.cash)}</td><td><details><summary>${satisfactionSummary(d)}</summary>${d.satisfactionReason}</details></td></tr>`).join('');
    if(last){
      $('resultTitle').textContent=finished()?(count>=30?'Thirty days. Your own little empire.':'Every baker starts somewhere.'):`Day ${last.day}, fresh from the oven.`;
      $('resultBody').innerHTML=`<div class="result-banner">${finished()?'YOUR FINAL CASH':'TODAY’S PROFIT'}<strong class="${(finished()?state.cash:last.profit)<0?'negative':''}">${money(finished()?state.cash:last.profit)}</strong>${finished()?(count>=30?'Your 30-day journey is complete.':'Your cash fell below the $5 needed to open.'):last.profit>=0?'A little more dough in your pocket.':'A learning day for your little shop.'}</div><div class="result-metrics"><div><span>Cookies sold</span><strong>${last.sold} <small>/ ${last.baked}</small></strong></div><div><span>Revenue</span><strong>${money(last.revenue)}</strong></div><div><span>Expenses</span><strong>${money(last.expenses)}</strong></div><div><span>Remaining cash</span><strong>${money(last.cash)}</strong></div></div><div class="satisfaction-report"><strong>Customer satisfaction: ${satisfactionSummary(last)}</strong><p>${last.satisfactionReason}</p></div><p class="result-note">${last.baked-last.sold} cookies left over · ${last.demand} customers wanted a cookie<br>Ingredients ${money(last.baked*.5)} + ads ${money(last.ads)} + overhead $5.00${finished()?`<br>Total profit: ${money(total)} · ${state.history.reduce((a,d)=>a+d.sold,0)} cookies sold` : ''}</p><button class="primary" id="next">${finished()?'Start a new shop':'Plan the next batch'} <span>→</span></button>`;
      $('next').onclick=()=>{if(finished()){reset()}else{$('bake').focus();$('plan').scrollIntoView({behavior:'smooth',block:'center'})}};
    }
    for(const id of ['bake','price','ads']) $(id).disabled=finished();
    $('run').innerHTML=finished()?'Journey complete':'Open the shop <span>→</span>'; updateCost();
  }
  function reset(){state=fresh();save();location.reload()}
  $('restart').onclick=()=>{if(!state.history.length||confirm('Start again with $100? Your current shop progress will be replaced.'))reset()};
  $('plan').addEventListener('input',updateCost);
  $('plan').addEventListener('submit',e=>{
    e.preventDefault();if(finished()||!$('plan').reportValidity()||cost()>state.cash)return;
    const baked=Number($('bake').value),price=Number($('price').value),ads=Number($('ads').value),day=state.history.length;
    const luck=.85+Math.random()*.3;
    const demand=Math.max(0,Math.round((42+Math.sqrt(ads)*10+Math.min(day,20)*.8)*weather(day).factor*Math.pow(2/price,1.35)*luck));
    const sold=Math.min(baked,demand),revenue=Math.round(sold*price*100)/100,expenses=cost(),profit=Math.round((revenue-expenses)*100)/100;
    state.cash=Math.round((state.cash+profit)*100)/100;
    const feedback=satisfactionResult(state.satisfaction,price,demand,sold);
    state.satisfaction=feedback.satisfaction;
    state.history.push({day:day+1,baked,price,ads,demand,sold,revenue,expenses,profit,cash:state.cash,...feedback});save();render();
    if(!finished()&&cost()>state.cash){$('bake').value=Math.max(0,Math.min(baked,Math.floor((state.cash-5)/.5)));$('ads').value=0;updateCost()}
  });
  render();
})();
