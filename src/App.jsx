import React, { useState } from "react";

export default function App() {
  const [currentGav, setCurrentGav] = useState(92140);
  const [marketPrice, setMarketPrice] = useState("");
  const [btcAmount, setBtcAmount] = useState(0.5);
  const [leverage, setLeverage] = useState(5);
  const [targetGav, setTargetGav] = useState(90000);
  const [result, setResult] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchBTC = async () => {
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
      const data = await res.json();
      const price = data.bitcoin.usd;
      setMarketPrice(price);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      alert("Kunde inte hämta pris.");
    }
  };

  const calculate = () => {
    const positionUsd = btcAmount * marketPrice;

    if (marketPrice >= currentGav || targetGav >= currentGav || marketPrice >= targetGav) {
      setResult("För att sänka ditt GAV måste marknadspriset vara lägre än både nuvarande och önskat GAV.");
      return;
    }

    const totalInvestment = (positionUsd * (currentGav - targetGav)) / (targetGav - marketPrice);
    const actualCapital = totalInvestment / leverage;
    const btcCapital = actualCapital / marketPrice;
    const btcOrder = totalInvestment / marketPrice;

    setResult(
      `Du behöver öppna en position på totalt ${totalInvestment.toFixed(2)} USD vid ${marketPrice} USD\n` +
      `vilket innebär att du faktiskt måste lägga in: ${actualCapital.toFixed(2)} USD med ${leverage}x hävstång.\n` +
      `Det motsvarar cirka ${btcOrder.toFixed(4)} BTC i faktisk beställning.`
    );
  };

  return (
    <div style={{ backgroundColor: "#0f0f0f", color: "white", padding: "2rem", fontFamily: "sans-serif", minHeight: "100vh" }}>
      <h1>Likvidationspris & GAV Kalkylator</h1>
      <div style={{ maxWidth: "400px", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label>Nuvarande GAV (BTC): <input type="number" value={currentGav} onChange={e => setCurrentGav(+e.target.value)} /></label>

        <label>Marknadspris just nu (BTC):
          <input type="number" value={marketPrice} readOnly style={{ background: "#222", color: "white" }} />
          <button onClick={fetchBTC}>Uppdatera pris</button>
          {lastUpdated && <div style={{ fontSize: "0.8rem", color: "#ccc" }}>Senast uppdaterad: {lastUpdated}</div>}
        </label>

        <label>Nuvarande position (BTC): <input type="number" value={btcAmount} onChange={e => setBtcAmount(+e.target.value)} /></label>
        <label>Hävstång: <input type="number" value={leverage} onChange={e => setLeverage(+e.target.value)} /></label>
        <label>Önskat nytt GAV (BTC): <input type="number" value={targetGav} onChange={e => setTargetGav(+e.target.value)} /></label>

        <button onClick={calculate}>Beräkna hur mycket du behöver köpa</button>
        {result && <pre style={{ background: "#111", padding: "1rem", borderRadius: "8px", whiteSpace: "pre-wrap" }}>{result}</pre>}
      </div>
    </div>
  );
}