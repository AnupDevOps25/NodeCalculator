const currentOperandElement = document.querySelector("#current-operand");
const previousOperandElement = document.querySelector("#previous-operand");
const errorMessageElement = document.querySelector("#error-message");

let currentOperand = "0";
let previousOperand = "";
let operator = null;
let shouldStartNewOperand = false;
let isCalculating = false;

function render() {
  currentOperandElement.textContent = currentOperand;
  previousOperandElement.textContent = operator
    ? `${previousOperand} ${operator}`
    : "";
}

function clearError() {
  errorMessageElement.textContent = "";
}

function inputDigit(digit) {
  clearError();
  if (shouldStartNewOperand) {
    currentOperand = digit;
    shouldStartNewOperand = false;
  } else if (currentOperand === "0") {
    currentOperand = digit;
  } else if (currentOperand.length < 16) {
    currentOperand += digit;
  }
  render();
}

function inputDecimal() {
  clearError();
  if (shouldStartNewOperand) {
    currentOperand = "0";
    shouldStartNewOperand = false;
  }
  if (!currentOperand.includes(".")) {
    currentOperand += ".";
  }
  render();
}

async function chooseOperator(nextOperator) {
  clearError();
  if (operator && !shouldStartNewOperand) {
    await calculate();
    if (errorMessageElement.textContent) return;
  }
  previousOperand = currentOperand;
  operator = nextOperator;
  shouldStartNewOperand = true;
  render();
}

async function calculate() {
  if (!operator || shouldStartNewOperand || isCalculating) return;

  const left = Number(previousOperand);
  const right = Number(currentOperand);
  const activeOperator = operator;
  isCalculating = true;
  document.querySelectorAll(".keys button").forEach((button) => {
    button.disabled = true;
  });
  try {
    const response = await fetch("/api/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ left, operator: activeOperator, right }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Calculation failed.");
    }
    currentOperand = String(Number(result.result.toPrecision(12)));
    previousOperand = "";
    operator = null;
    shouldStartNewOperand = true;
    clearError();
    render();
  } catch (error) {
    errorMessageElement.textContent = error.message;
  } finally {
    isCalculating = false;
    document.querySelectorAll(".keys button").forEach((button) => {
      button.disabled = false;
    });
  }
}

function clearCalculator() {
  currentOperand = "0";
  previousOperand = "";
  operator = null;
  shouldStartNewOperand = false;
  clearError();
  render();
}

function deleteDigit() {
  clearError();
  if (shouldStartNewOperand) return;
  currentOperand = currentOperand.length > 1 ? currentOperand.slice(0, -1) : "0";
  if (currentOperand === "-") currentOperand = "0";
  render();
}

function changeSign() {
  clearError();
  if (currentOperand !== "0") {
    currentOperand = String(Number(currentOperand) * -1);
    render();
  }
}

document.querySelector(".keys").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.digit !== undefined) inputDigit(button.dataset.digit);
  if (button.dataset.operator) chooseOperator(button.dataset.operator);
  if (button.dataset.action === "decimal") inputDecimal();
  if (button.dataset.action === "equals") calculate();
  if (button.dataset.action === "clear") clearCalculator();
  if (button.dataset.action === "delete") deleteDigit();
  if (button.dataset.action === "sign") changeSign();
});

document.addEventListener("keydown", (event) => {
  if (isCalculating) return;
  if (/^\d$/.test(event.key)) inputDigit(event.key);
  if (event.key === ".") inputDecimal();
  if (["+", "-", "*", "/"].includes(event.key)) chooseOperator(event.key);
  if (event.key === "Enter" || event.key === "=") calculate();
  if (event.key === "Backspace") deleteDigit();
  if (event.key === "Escape") clearCalculator();
});

render();
