const params = new URLSearchParams(window.location.search);
let orderId = params.get("order_id");


async function waitForRealOrder() {
  if (!orderId) return false;

  // Si por error llega un DraftOrder, no seguimos.
  if (orderId.includes("/DraftOrder/")) {
    return false;
  }

  let attempts = 0;

  while (attempts < 6) {
    attempts++;

    try {
      const res = await fetch(
        `https://paydangotools.gonzamansilla0149.workers.dev/shipping-status?order_id=${encodeURIComponent(orderId)}`
      );

      const result = await res.json();

      if (res.ok && result.ok) {
        return true;
      }
    } catch (err) {
      console.error("Error esperando orden:", err);
    }

    await new Promise((r) => setTimeout(r, 1000));
  }

  return false;
}

const form = document.getElementById("shippingForm");
const successMessage = document.getElementById("successMessage");
const billingOptions = document.querySelectorAll('input[name="billingOption"]');
const billingFields = document.getElementById("billingFields");

console.log("order_id:", orderId);

async function redirectIfShippingAlreadyCompleted() {
  if (!orderId) return;

  try {
    const res = await fetch(
      `https://paydangotools.gonzamansilla0149.workers.dev/shipping-status?order_id=${encodeURIComponent(orderId)}`
    );

    const result = await res.json();

    if (res.ok && result.ok && result.completed) {
      window.location.href = `/gracias.html?order_id=${encodeURIComponent(orderId)}`;
    }
  } catch (err) {
    console.error("No se pudo consultar el estado del envío:", err);
  }
}

(async () => {
  if (!orderId || orderId.includes("/DraftOrder/")) {
    window.location.replace("https://dangotools.com");
    return;
  }

  try {
    const res = await fetch(
      `https://paydangotools.gonzamansilla0149.workers.dev/shipping-status?order_id=${encodeURIComponent(orderId)}`
    );

    const result = await res.json();

    // URL falsa / order inexistente / error Shopify
    if (!res.ok || !result.ok) {
      window.location.replace("https://dangotools.com");
      return;
    }

    // Ya completó envío antes
    if (result.completed) {
      window.location.replace(`/gracias.html?order_id=${encodeURIComponent(orderId)}`);
      return;
    }

    // Pedido válido y envío pendiente
    document.body.classList.add("shipping-ready");
  } catch (err) {
    console.error("Order inválido:", err);
    window.location.replace("https://dangotools.com");
  }
})();

function clearErrors() {
  const errorElements = document.querySelectorAll(".error");
  errorElements.forEach((el) => {
    el.textContent = "";
  });
}

function setError(field, message) {
  const errorElement = document.getElementById(`error-${field}`);
  if (errorElement) {
    errorElement.textContent = message;
  }
}

function getSelectedBillingOption() {
  const selected = document.querySelector('input[name="billingOption"]:checked');
  return selected ? selected.value : "same";
}

function toggleBillingFields() {
  const billingOption = getSelectedBillingOption();

  if (billingOption === "different") {
    billingFields.classList.remove("hidden");
  } else {
    billingFields.classList.add("hidden");
  }
}

function getFormData() {
  const billingOption = getSelectedBillingOption();

  return {
    orderId,
    firstName: document.getElementById("firstName").value.trim(),
    lastName: document.getElementById("lastName").value.trim(),
    dni: document.getElementById("dni").value.trim(),
    phone: document.getElementById("phone").value.trim(),

    address1: document.getElementById("address").value.trim(),
    address2: document.getElementById("apartment").value.trim(),
    city: document.getElementById("city").value.trim(),
    province: document.getElementById("province").value.trim(),
    zip: document.getElementById("postalCode").value.trim(),
    country: "Argentina",
    company: "",

    billingOption,
    billingAddress: document.getElementById("billingAddress")?.value.trim() || "",
    billingApartment: document.getElementById("billingApartment")?.value.trim() || "",
    billingCity: document.getElementById("billingCity")?.value.trim() || "",
    billingProvince: document.getElementById("billingProvince")?.value.trim() || "",
    billingPostalCode: document.getElementById("billingPostalCode")?.value.trim() || "",

    notes: document.getElementById("notes").value.trim(),
  };
}

function validate(data) {
  let isValid = true;

if (!data.orderId) {
  alert("Estamos procesando tu pago. Esperá unos segundos y volvé a intentar.");
  return false;
}
  
  if (!data.firstName) {
    setError("firstName", "Ingresá tu nombre");
    isValid = false;
  }

  if (!data.lastName) {
    setError("lastName", "Ingresá tu apellido");
    isValid = false;
  }

  if (!data.dni) {
    setError("dni", "Ingresá tu DNI");
    isValid = false;
  }

  if (!data.phone) {
    setError("phone", "Ingresá tu teléfono");
    isValid = false;
  }

if (!data.address1) {
  setError("address", "Ingresá tu dirección");
  isValid = false;
}

  if (!data.city) {
    setError("city", "Ingresá tu ciudad");
    isValid = false;
  }

  if (!data.province) {
    setError("province", "Ingresá tu provincia");
    isValid = false;
  }

if (!data.zip) {
  setError("postalCode", "Ingresá tu código postal");
  isValid = false;
}

  if (data.billingOption === "different") {
    if (!data.billingAddress) {
      alert("Ingresá la dirección de facturación");
      isValid = false;
    }

    if (!data.billingCity) {
      alert("Ingresá la ciudad de facturación");
      isValid = false;
    }

    if (!data.billingProvince) {
      alert("Ingresá la provincia de facturación");
      isValid = false;
    }

    if (!data.billingPostalCode) {
      alert("Ingresá el código postal de facturación");
      isValid = false;
    }
  }

  return isValid;
}

billingOptions.forEach((option) => {
  option.addEventListener("change", toggleBillingFields);
});

toggleBillingFields();

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  clearErrors();
  successMessage.classList.add("hidden");

  const data = getFormData();

  if (!validate(data)) return;

  console.log("Datos del formulario:", data);

  let lastResult = null;
  let lastStatus = null;

  try {
    for (let attempts = 1; attempts <= 3; attempts++) {
      const response = await fetch(
        "https://paydangotools.gonzamansilla0149.workers.dev/shipping-completed",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      lastStatus = response.status;

      try {
        lastResult = await response.json();
      } catch {
        lastResult = {
          ok: false,
          error: "Respuesta inválida del servidor",
        };
      }

      if (response.ok && lastResult.ok) {
        successMessage.classList.remove("hidden");

        setTimeout(() => {
          window.location.href = `/gracias.html?order_id=${encodeURIComponent(orderId)}`;
        }, 500);

        return;
      }

      if (lastResult.alreadyCompleted) {
        window.location.href = `/gracias.html?order_id=${encodeURIComponent(orderId)}`;
        return;
      }

      if (lastStatus === 409) {
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }

      break;
    }

    throw new Error(
      lastResult?.error ||
        "No se pudo enviar la información de envío"
    );
  } catch (err) {
    console.error("Error enviando datos de envío:", err);
    alert(
      lastStatus === 409
        ? "Tu pago se está procesando. Probá nuevamente en unos segundos."
        : "Hubo un problema al guardar los datos de envío. Probá de nuevo."
    );
  }
});
