const TOKEN = "$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjcyMTc0MDRiLTgxOTUtNGU1Zi04ZTRkLWNiYWE0OGQxNjY5ODo6JGFhY2hfMTdlNTNiZDgtOWE3Ny00YTM0LWFjNzEtMWFlMjk0NTNlNWJk";
const URL = "https://sandbox.asaas.com/api/v3";

async function testAsaas() {
  console.log("=== Testando criação de PaymentLink Recorrente ===");
  const linkRes = await fetch(`${URL}/paymentLinks`, {
    method: 'POST',
    headers: { 'access_token': TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: "Plano Pro",
      description: "Assinatura Mensal - Plano Pro",
      endDate: "2035-12-31",
      value: 19.90,
      billingType: "UNDEFINED",
      chargeType: "RECURRENT",
      dueDateLimitDays: 5
    })
  });
  const link = await linkRes.json();
  console.log("Payment Link:", link);
}

testAsaas().catch(console.error);
