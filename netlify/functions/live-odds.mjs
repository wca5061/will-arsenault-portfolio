const SUPPORTED = new Set(['basketball_nba','icehockey_nhl','americanfootball_nfl','baseball_mlb','basketball_ncaab','basketball_wnba']);
const cache = new Map();
const TTL = 120000;
function json(status, value) {return {statusCode:status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=0, s-maxage=120'},body:JSON.stringify(value)}}
export async function handler(event) {
  if(event.httpMethod!=='GET')return json(405,{error:'Method not allowed.'});
  const league=event.queryStringParameters?.league||'basketball_nba';
  if(!SUPPORTED.has(league))return json(400,{error:'Unsupported league.'});
  const apiKey=process.env.ODDS_API_KEY;
  if(!apiKey)return json(503,{error:'Live odds are not configured yet. Add ODDS_API_KEY to Netlify Environment variables and redeploy.'});
  const existing=cache.get(league);
  if(existing&&Date.now()-existing.at<TTL)return json(200,existing.value);
  const url=new URL(`https://api.the-odds-api.com/v4/sports/${league}/odds/`);
  url.search=new URLSearchParams({apiKey,regions:'us',markets:'h2h',oddsFormat:'decimal',dateFormat:'iso'}).toString();
  try {
    const result=await fetch(url,{signal:AbortSignal.timeout(10000)});
    if(!result.ok){const raw=(await result.text()).slice(0,300);return json(result.status===429?429:502,{error:result.status===429?'Odds provider rate limit reached. Please try again later.':`Odds provider returned ${result.status}. Verify your API key, subscription, or league coverage.`})}
    const games=await result.json();
    if(!Array.isArray(games))return json(502,{error:'Unexpected odds provider response.'});
    const value={league,fetchedAt:new Date().toISOString(),games:games.map(g=>({id:g.id,commence_time:g.commence_time,home_team:g.home_team,away_team:g.away_team,bookmakers:(g.bookmakers||[]).map(b=>({key:b.key,title:b.title,last_update:b.last_update,markets:(b.markets||[]).filter(m=>m.key==='h2h').map(m=>({key:m.key,outcomes:(m.outcomes||[]).map(o=>({name:o.name,price:o.price}))}))}))}))};
    cache.set(league,{at:Date.now(),value});
    return json(200,value);
  }catch(e){return json(502,{error:'Odds provider is temporarily unavailable. Please retry shortly.'})}
}
