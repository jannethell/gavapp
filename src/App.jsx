
import React, { useEffect, useState } from "react";

export default function App() {
  const [currentGav, setCurrentGav] = useState("");
  const [marketPrice, setMarketPrice] = useState("");
  const [btcAmount, setBtcAmount] = useState("");
  const [leverage, setLeverage] = useState("");
  const [targetGav, setTargetGav] = useState("");
  const [result, setResult] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [maxBtcToAdd, setMaxBtcToAdd] = useState("");

  const fetchBTC = async () => {
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
      const data = await res.json();
      setMarketPrice(data.bitcoin.usd);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      alert("Kunde inte hämta pris.");
    }
  };

  useEffect(() => {
    fetchBTC();
  }, []);

  const calculate = () => {
    const numericGav = parseFloat(currentGav);
    const numericTarget = parseFloat(targetGav);
    const numericPrice = parseFloat(marketPrice);
    const numericLeverage = parseFloat(leverage);
    const numericBtc = parseFloat(btcAmount);
    const numericMaxBtc = parseFloat(maxBtcToAdd);

    if (
      numericPrice >= numericGav ||
      numericTarget >= numericGav ||
      numericPrice >= numericTarget
    ) {
      setResult(
        "För att sänka ditt GAV måste marknadspriset vara lägre än både nuvarande och önskat GAV."
      );
      return;
    }

    const positionUsd = numericBtc * numericPrice;
    const totalInvestment =
      (positionUsd * (numericGav - numericTarget)) /
      (numericTarget - numericPrice);
    const actualCapital = totalInvestment / numericLeverage;
    const btcOrder = actualCapital / numericPrice * numericLeverage;

    let output = `Du behöver öppna en position på totalt ${totalInvestment.toFixed(2)} USD vid ${numericPrice} USD\n` +
                 `vilket innebär att du faktiskt måste lägga in: ${actualCapital.toFixed(2)} USD med ${numericLeverage}x hävstång.\n` +
                 `<span style="background-color: #1e3a8a; color: white; padding: 2px 6px; border-radius: 4px;">Det motsvarar cirka ${btcOrder.toFixed(4)} BTC i faktiskt köp.</span>`;

    if (!isNaN(numericMaxBtc) && numericMaxBtc > 0) {
      const newGav = ((numericGav * numericBtc) + (numericMaxBtc * numericPrice)) / (numericBtc + numericMaxBtc);
      output += `\n\nOm du istället bara har ${numericMaxBtc} BTC att lägga in, får du ett nytt GAV på cirka ${newGav.toFixed(2)} USD.`;
    }

    setResult(output);
  };

  return (
    <div style={{ backgroundColor: "#0a0a0a", color: "white", padding: "2rem", fontFamily: "sans-serif", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "2.2rem", fontWeight: "bold" }}>GAV Kalkylator</h1>

      <div style={{ maxWidth: "400px", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label>Nuvarande GAV (BTC):
          <input type="number" placeholder="t.ex 92000" value={currentGav} onChange={e => setCurrentGav(e.target.value)} />
        </label>

        <label>Marknadspris just nu (BTC):
          <input type="number" value={marketPrice} onChange={e => setMarketPrice(e.target.value)} style={{ background: "#222", color: "gold" }} />
          <button onClick={fetchBTC}>Uppdatera pris</button>
          {lastUpdated && <div style={{ fontSize: "0.8rem", color: "#ccc" }}>Senast uppdaterad: {lastUpdated}</div>}
        </label>

        <label>Nuvarande position (BTC):
          <input type="number" placeholder="0.5" value={btcAmount} onChange={e => setBtcAmount(e.target.value)} />
        </label>

        <label>Hävstång:
          <input type="number" placeholder="t.ex 5" value={leverage} onChange={e => setLeverage(e.target.value)} />
        </label>

        <label>Önskat nytt GAV (BTC):
          <input type="number" placeholder="t.ex 87000" value={targetGav} onChange={e => setTargetGav(e.target.value)} />
        </label>

        <label>Omvänd beräkning (Jag har max BTC att lägga in):
          <input type="number" placeholder="t.ex 0.3" value={maxBtcToAdd} onChange={e => setMaxBtcToAdd(e.target.value)} />
        </label>

        <button onClick={calculate}>Beräkna hur mycket du behöver köpa</button>

        {result && (
          <pre style={{ background: "#111", padding: "1rem", borderRadius: "8px", whiteSpace: "pre-wrap" }} dangerouslySetInnerHTML={{ __html: result }} />
        )}
      </div>
    </div>
  );
}
