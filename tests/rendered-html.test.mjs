import assert from "node:assert/strict";
import test from "node:test";

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker;
}

async function render(pathname) {
  const worker = await loadWorker();
  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("protects the TeamRoute administration dashboard with an access gate", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /TeamRoute/);
  assert.match(html, /Intelligent meeting routing/);
  assert.match(html, /Verificando acceso seguro/);
  assert.doesNotMatch(html, /vinext-starter|Your site is taking shape/i);
});

test("renders login and registration access", async () => {
  const response = await render("/login");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Iniciar sesión/);
  assert.match(html, /Registrarme/);
  assert.match(html, /Mínimo 12 caracteres/);
});

test("renders the phased public booking experience", async () => {
  const response = await render("/book/consulta-inicial-llc");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Sesión Estratégica/);
  assert.match(html, /Selecciona una fecha/);
  assert.match(html, /TeamRoute/);
});
