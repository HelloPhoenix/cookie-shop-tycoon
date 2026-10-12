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
  const varieties = [
    {id:'classic', name:'Chocolate chip', icon:'🍪', cost:.5, price:2, quantity:40, share:.5},
    {id:'oatmeal', name:'Oatmeal raisin', icon:'🌾', cost:.4, price:1.75, quantity:10, share:.25},
    {id:'double', name:'Double chocolate', icon:'🍫', cost:.8, price:3, quantity:10, share:.25}
  ];
  $('varieties').innerHTML=varieties.map(v=>`<fieldset class="variety"><legend>${v.icon} ${v.name}</legend><p class="variety-cost">Ingredients ${money(v.cost)} each · suggested price ${money(v.price)}</p><div class="variety-inputs"><div><label for="bake-${v.id}">Cookies to bake</label><div class="input-wrap"><input id="bake-${v.id}" type="number" min="0" max="10000" step="1" value="${v.quantity}" required><span>cookies</span></div></div><div><label for="price-${v.id}">Price per cookie</label><div class="input-wrap"><span>$</span><input id="price-${v.id}" type="number" min="0.25" max="20" step="0.25" value="${v.price}" required></div></div></div></fieldset>`).join('');
  const planItems=()=>varieties.map(v=>({...v,baked:Number($(`bake-${v.id}`).value),price:Number($(`price-${v.id}`).value)}));
  let state;
  try { state = JSON.parse(localStorage.getItem(storageKey)); } catch {}
  if (!state || !Array.isArray(state.history) || !Number.isFinite(state.cash) || state.history.length > 30) state = fresh();
  function fresh(){return {cash:100,history:[],seed:Math.floor(Math.random()*1000000)}}
  function save(){try{localStorage.setItem(storageKey,JSON.stringify(state))}catch{}}
  function weather(day){return conditions[day===0?0:(state.seed+day*7)%conditions.length]}
  function finished(){return state.history.length>=30 || state.cash<5}
  function cost(){return Math.round((planItems().reduce((sum,v)=>sum+v.baked*v.cost,0)+Number($('ads').value)+5)*100)/100}
  function updateCost(){const valid=$('plan').checkValidity();$('cost').textContent=money(cost());$('run').disabled=finished()||!valid||cost()>state.cash;$('error').textContent=!finished()&&valid&&cost()>state.cash?'This plan costs more than your available cash. Try a smaller batch or less advertising.':''}
  function render(){
    const count=state.history.length, total=state.history.reduce((a,d)=>a+d.profit,0), last=state.history[count-1];
    $('cash').textContent=money(state.cash);$('day').innerHTML=`Day ${Math.min(count+1,30)} <small>/ 30</small>`;$('progress').style.width=`${count/30*100}%`;
    $('totalProfit').textContent=money(total);$('totalProfit').className=total<0?'negative':'';$('totalSold').innerHTML=`${state.history.reduce((a,d)=>a+d.sold,0)} <small>happy bites</small>`;
    $('planDay').textContent=`DAY ${String(Math.min(count+1,30)).padStart(2,'0')} · YOUR GAME PLAN`;
    const w=weather(count);$('forecast').textContent=`${w.icon} ${w.name}. ${w.tip}`;
    document.querySelector('.pill').textContent=count===0?'Fresh start':finished()?'Shop closed':'Let’s bake';
    $('ledgerCount').textContent=`${count} ${count===1?'day':'days'} in the books`;
    if(count) $('ledger').innerHTML=[...state.history].reverse().map(d=>`<tr><td>${String(d.day).padStart(2,'0')}</td><td>${d.baked} / ${d.sold}</td><td>${d.items?d.items.map(v=>`${v.name}: ${money(v.price)}`).join('<br>'):money(d.price)}</td><td>${money(d.revenue)}</td><td>${money(d.expenses)}</td><td class="${d.profit<0?'negative':'positive'}">${money(d.profit)}</td><td>${money(d.cash)}</td></tr>`).join('');
    if(last){
      $('resultTitle').textContent=finished()?(count>=30?'Thirty days. Your own little empire.':'Every baker starts somewhere.'):`Day ${last.day}, fresh from the oven.`;
      $('resultBody').innerHTML=`<div class="result-banner">${finished()?'YOUR FINAL CASH':'TODAY’S PROFIT'}<strong class="${(finished()?state.cash:last.profit)<0?'negative':''}">${money(finished()?state.cash:last.profit)}</strong>${finished()?(count>=30?'Your 30-day journey is complete.':'Your cash fell below the $5 needed to open.'):last.profit>=0?'A little more dough in your pocket.':'A learning day for your little shop.'}</div><div class="result-metrics"><div><span>Cookies sold</span><strong>${last.sold} <small>/ ${last.baked}</small></strong></div><div><span>Revenue</span><strong>${money(last.revenue)}</strong></div><div><span>Expenses</span><strong>${money(last.expenses)}</strong></div><div><span>Remaining cash</span><strong>${money(last.cash)}</strong></div></div>${last.items?`<div class="table-scroll"><table class="variety-results"><caption>Today's cookies</caption><thead><tr><th>Variety</th><th>Sold / baked</th><th>Price</th><th>Revenue</th></tr></thead><tbody>${last.items.map(v=>`<tr><td>${v.name}</td><td>${v.sold} / ${v.baked}</td><td>${money(v.price)}</td><td>${money(v.revenue)}</td></tr>`).join('')}</tbody></table></div>`:''}<p class="result-note">${last.baked-last.sold} cookies left over · ${last.demand} customers wanted a cookie<br>Ingredients ${money(last.items?last.items.reduce((sum,v)=>sum+v.baked*v.cost,0):last.baked*.5)} + ads ${money(last.ads)} + overhead $5.00${finished()?`<br>Total profit: ${money(total)} · ${state.history.reduce((a,d)=>a+d.sold,0)} cookies sold` : ''}</p><button class="primary" id="next">${finished()?'Start a new shop':'Plan the next batch'} <span>→</span></button>`;
      $('next').onclick=()=>{if(finished()){reset()}else{$(`bake-${varieties[0].id}`).focus();$('plan').scrollIntoView({behavior:'smooth',block:'center'})}};
    }
    for(const id of [...varieties.flatMap(v=>[`bake-${v.id}`,`price-${v.id}`]),'ads']) $(id).disabled=finished();
    $('run').innerHTML=finished()?'Journey complete':'Open the shop <span>→</span>'; updateCost();
  }
  function reset(){state=fresh();save();location.reload()}
  $('restart').onclick=()=>{if(!state.history.length||confirm('Start again with $100? Your current shop progress will be replaced.'))reset()};
  $('plan').addEventListener('input',updateCost);
  $('plan').addEventListener('submit',e=>{
    e.preventDefault();if(finished()||!$('plan').reportValidity()||cost()>state.cash)return;
    const ads=Number($('ads').value),day=state.history.length,luck=.85+Math.random()*.3;
    const baseDemand=(42+Math.sqrt(ads)*10+Math.min(day,20)*.8)*weather(day).factor*luck;
    // Split neighborhood demand across tastes so adding varieties does not multiply traffic.
    const items=planItems().map(v=>{
      const demand=Math.max(0,Math.round(baseDemand*v.share*Math.pow(varieties.find(t=>t.id===v.id).price/v.price,1.35)));
      const sold=Math.min(v.baked,demand),revenue=Math.round(sold*v.price*100)/100;
      return {id:v.id,name:v.name,cost:v.cost,baked:v.baked,price:v.price,demand,sold,revenue};
    });
    const baked=items.reduce((sum,v)=>sum+v.baked,0),demand=items.reduce((sum,v)=>sum+v.demand,0),sold=items.reduce((sum,v)=>sum+v.sold,0);
    const revenue=Math.round(items.reduce((sum,v)=>sum+v.revenue,0)*100)/100,expenses=cost(),profit=Math.round((revenue-expenses)*100)/100;
    state.cash=Math.round((state.cash+profit)*100)/100;
    state.history.push({day:day+1,items,baked,ads,demand,sold,revenue,expenses,profit,cash:state.cash});save();render();
    if(!finished()&&cost()>state.cash){
      $('ads').value=0;
      let budget=Math.max(0,state.cash-5);
      for(const v of varieties){const input=$(`bake-${v.id}`),quantity=Math.min(Number(input.value),Math.floor((budget+1e-8)/v.cost));input.value=quantity;budget=Math.round((budget-quantity*v.cost)*100)/100}
      updateCost();
    }
  });
  render();
})();
