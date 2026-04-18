const form = document.getElementById("shippingForm");
const successMessage = document.getElementById("successMessage");

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

function getFormData() {
  return {
    firstName: document.getElementById("firstName").value.trim(),
    lastName: document.getElementById("lastName").value.trim(),
    dni: document.getElementById("dni").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    address: document.getElementById("address").value.trim(),
    apartment: document.getElementById("apartment").value.trim(),
    city: document.getElementById("city").value.trim(),
    province: document.getElementById("province").value.trim(),
    postalCode: document.getElementById("postalCode").value.trim(),
    notes: document.getElementById("notes").value.trim(),
  };
}

function validate(data) {
  let isValid = true;

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

  if (!data.address) {
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

  if (!data.postalCode) {
    setError("postalCode", "Ingresá tu código postal");
    isValid = false;
  }

  return isValid;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearErrors();
  successMessage.classList.add("hidden");

  const data = getFormData();
  const isValid = validate(data);

  if (!isValid) return;

  console.log("Datos del formulario:", data);

  successMessage.classList.remove("hidden");

  // más adelante:
  // await fetch("/api/shipping", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(data),
  // });
  //
  // window.location.href = "/gracias.html";
});
