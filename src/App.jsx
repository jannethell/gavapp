import React, { useState } from "react";

export default function App() {
  const [currentGav, setCurrentGav] = useState("");
  const [marketPrice, setMarketPrice] = useState("");
  const [btcAmount, setBtcAmount] = useState("");
  const [leverage, setLeverage] = useState("");
  const [targetGav, setTargetGav] = useState("");
  const [result, setResult] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchBTC = async () => {
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
      const data = await response.json();
      setMarketPrice(data.bitcoin.usd);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      alert("Kunde inte hämta pris.");
    }
  };

  const calculate = () => {
    const price = parseFloat(marketPrice);
    const current = parseFloat(currentGav);
    const target = parseFloat(targetGav);
    const btc = parseFloat(btcAmount);
    const lev = parseFloat(leverage);

    if (price >= current || target >= current || price >= target) {
      setResult("För att sänka ditt GAV måste marknadspriset vara lägre än både nuvarande och önskat GAV.");
      return;
    }

    const currentUsd = btc * price;
    const totalInvestment = (currentUsd * (current - target)) / (target - price);
    const actualCapital = totalInvestment / lev;
    const btcOrder = actualCapital / price * lev;

    setResult(
      `Du behöver öppna en position på totalt ${totalInvestment.toFixed(2)} USD vid ${price} USD\n` +
      `vilket innebär att du faktiskt måste lägga in: ${actualCapital.toFixed(2)} USD med ${lev}x hävstång.\n` +
      `\x1b[1mDet motsvarar cirka ${btcOrder.toFixed(4)} BTC i faktisk beställning.\x1b[0m`
    );
  };

  return (
    <div style={{ backgroundColor: "#111", color: "white", padding: "2rem", fontFamily: "sans-serif", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "2.2rem", fontWeight: "bold" }}>GAV Kalkylator</h1>

      <div style={{ maxWidth: "400px", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label>Nuvarande GAV (BTC):
          <input type="number" placeholder="ex 92000" value={currentGav} onChange={e => setCurrentGav(e.target.value)} />
        </label>

        <label>Marknadspris just nu (BTC):
          <input type="number" value={marketPrice} onChange={e => setMarketPrice(e.target.value)} style={{ background: "#222", color: "gold" }} />
          <button onClick={fetchBTC}>Uppdatera pris</button>
          {lastUpdated && <div style={{ fontSize: "0.8rem", color: "#ccc" }}>Senast uppdaterad: {lastUpdated}</div>}
        </label>

        <label>Nuvarande position (BTC):
          <input type="number" placeholder="0,5" value={btcAmount} onChange={e => setBtcAmount(e.target.value)} />
        </label>

        <label>Hävstång:
          <input type="number" placeholder="5" value={leverage} onChange={e => setLeverage(e.target.value)} />
        </label>

        <label>Önskat nytt GAV (BTC):
          <input type="number" placeholder="87000" value={targetGav} onChange={e => setTargetGav(e.target.value)} />
        </label>

        <button onClick={calculate}>Beräkna hur mycket du behöver köpa</button>

        {result && <pre style={{ background: "#111", padding: "1rem", borderRadius: "8px", whiteSpace: "pre-wrap", fontFamily: "monospace" }}>{result}</pre>}
      </div>
    </div>
  );
}
