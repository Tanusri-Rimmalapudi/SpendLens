/* SpendLens - app.js
   Plain JavaScript + DOM programming. Expenses are saved in localStorage,
   so they stay after the page is refreshed or the browser is closed. */

const STORAGE_KEY = "spendlens-expenses";
const CATEGORIES = ["Food", "Transport", "Rent", "Fun", "School"];

// Sample data used the first time the app is opened (same as Milestone 1)
const SAMPLE_EXPENSES = [
  { id: "1", description: "Trader Joe's groceries", amount: 46.8, date: "2026-10-10", category: "Food", note: "" },
  { id: "2", description: "Metrolink pass", amount: 32, date: "2026-10-09", category: "Transport", note: "" },
  { id: "3", description: "Movie night", amount: 15.5, date: "2026-10-08", category: "Fun", note: "" },
  { id: "4", description: "Textbook rental", amount: 68, date: "2026-10-06", category: "School", note: "" },
  { id: "5", description: "Chipotle", amount: 13.25, date: "2026-10-04", category: "Food", note: "" },
  { id: "6", description: "October rent", amount: 450, date: "2026-10-01", category: "Rent", note: "" }
];

/*  Data (localStorage)  */
function loadExpenses() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === null) {
    saveExpenses(SAMPLE_EXPENSES);
    return SAMPLE_EXPENSES.slice();
  }
  try {
    return JSON.parse(saved);
  } catch (error) {
    return [];
  }
}

function saveExpenses(expenses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function findExpense(id) {
  return loadExpenses().find(function (expense) {
    return expense.id === id;
  });
}

function addOrUpdateExpense(expense) {
  const expenses = loadExpenses();
  const index = expenses.findIndex(function (e) { return e.id === expense.id; });
  if (index === -1) {
    expenses.push(expense);
  } else {
    expenses[index] = expense;
  }
  saveExpenses(expenses);
}

function deleteExpense(id) {
  const expenses = loadExpenses().filter(function (expense) {
    return expense.id !== id;
  });
  saveExpenses(expenses);
}

/* ---------- Helpers ---------- */

function formatMoney(amount) {
  return "$" + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// "2026-10-10" -> "Oct 10, 2026" (built by hand to avoid time zone shifts)
function formatDate(isoDate) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const parts = isoDate.split("-");
  return months[Number(parts[1]) - 1] + " " + Number(parts[2]) + ", " + parts[0];
}

function todayISO() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}

// Newest first
function sortByDate(expenses) {
  return expenses.slice().sort(function (a, b) {
    return b.date.localeCompare(a.date);
  });
}

function totalOf(expenses) {
  return expenses.reduce(function (sum, expense) {
    return sum + expense.amount;
  }, 0);
}

function totalsByCategory(expenses) {
  const totals = {};
  expenses.forEach(function (expense) {
    totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
  });
  return totals;
}

// Creates an element with text (textContent keeps user input from becoming HTML)
function makeElement(tag, text, className) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
}

function makeEmptyRow(columns, message) {
  const row = document.createElement("tr");
  const cell = makeElement("td", message, "empty");
  cell.colSpan = columns;
  row.appendChild(cell);
  return row;
}

/*  Dashboard (index.html)  */
function renderDashboard() {
  const expenses = loadExpenses();
  const total = totalOf(expenses);
  const byCategory = totalsByCategory(expenses);

  // Categories sorted from biggest to smallest
  const categories = Object.keys(byCategory).sort(function (a, b) {
    return byCategory[b] - byCategory[a];
  });

  document.getElementById("total-spent").textContent = formatMoney(total);
  document.getElementById("expense-count").textContent = expenses.length;
  document.getElementById("top-category").textContent = categories.length ? categories[0] : "-";

  // Spending by category bars
  const bars = document.getElementById("category-bars");
  bars.innerHTML = "";
  if (categories.length === 0) {
    bars.appendChild(makeElement("p", "No expenses yet. Add one to see your spending by category.", "empty"));
  }
  const biggest = categories.length ? byCategory[categories[0]] : 0;
  categories.forEach(function (category) {
    const row = makeElement("div", undefined, "bar-row");
    const bar = makeElement("div", undefined, "bar");
    // Width is relative to the biggest category; keep a tiny sliver visible
    bar.style.width = Math.max(2, (byCategory[category] / biggest) * 100) + "%";
    row.appendChild(makeElement("span", category, "bar-label"));
    const track = makeElement("div", undefined, "bar-track");
    track.appendChild(bar);
    row.appendChild(track);
    row.appendChild(makeElement("span", formatMoney(byCategory[category]), "bar-amount"));
    bars.appendChild(row);
  });

  // 3 most recent expenses
  const recentBody = document.getElementById("recent-body");
  recentBody.innerHTML = "";
  const recent = sortByDate(expenses).slice(0, 3);
  if (recent.length === 0) {
    recentBody.appendChild(makeEmptyRow(4, "No expenses yet."));
  }
  recent.forEach(function (expense) {
    const row = document.createElement("tr");
    row.appendChild(makeElement("td", formatDate(expense.date)));
    row.appendChild(makeElement("td", expense.description));
    row.appendChild(makeElement("td", expense.category));
    row.appendChild(makeElement("td", formatMoney(expense.amount)));
    recentBody.appendChild(row);
  });
}

/*  Expenses list (expenses.html)  */
function renderExpenseList() {
  const search = document.getElementById("search").value.trim().toLowerCase();
  const category = document.getElementById("category").value;

  const matches = sortByDate(loadExpenses()).filter(function (expense) {
    const matchesText = expense.description.toLowerCase().includes(search) ||
      expense.note.toLowerCase().includes(search);
    const matchesCategory = category === "All" || expense.category === category;
    return matchesText && matchesCategory;
  });

  const body = document.getElementById("expense-body");
  body.innerHTML = "";

  if (matches.length === 0) {
    body.appendChild(makeEmptyRow(5, "No expenses match your filter."));
  }

  matches.forEach(function (expense) {
    const row = document.createElement("tr");
    row.appendChild(makeElement("td", formatDate(expense.date)));

    const descriptionCell = makeElement("td", expense.description);
    if (expense.note) {
      descriptionCell.appendChild(makeElement("div", expense.note, "note-text"));
    }
    row.appendChild(descriptionCell);

    row.appendChild(makeElement("td", expense.category));
    row.appendChild(makeElement("td", formatMoney(expense.amount)));

    const actions = makeElement("td", undefined, "actions");
    const editLink = makeElement("a", "Edit", "button small");
    editLink.href = "add-expense.html?id=" + encodeURIComponent(expense.id);
    const deleteButton = makeElement("button", "Delete", "delete small");
    deleteButton.type = "button";
    deleteButton.dataset.id = expense.id;
    actions.appendChild(editLink);
    actions.appendChild(document.createTextNode(" "));
    actions.appendChild(deleteButton);
    row.appendChild(actions);

    body.appendChild(row);
  });

  const label = matches.length === 1 ? " expense" : " expenses";
  document.getElementById("list-total").textContent =
    "Total: " + formatMoney(totalOf(matches)) + " (" + matches.length + label + ")";
}

function setUpExpenseList() {
  const filterForm = document.getElementById("filter-form");

  // Filter as the user types / picks a category
  document.getElementById("search").addEventListener("input", renderExpenseList);
  document.getElementById("category").addEventListener("change", renderExpenseList);
  filterForm.addEventListener("submit", function (event) {
    event.preventDefault();
    renderExpenseList();
  });

  // One listener on the table handles every Delete button (event delegation)
  document.getElementById("expense-body").addEventListener("click", function (event) {
    const button = event.target.closest("button.delete");
    if (!button) return;
    const expense = findExpense(button.dataset.id);
    if (expense && confirm('Delete "' + expense.description + '"?')) {
      deleteExpense(expense.id);
      renderExpenseList();
    }
  });

  document.getElementById("reset-data").addEventListener("click", function () {
    if (confirm("Replace all expenses with the sample data?")) {
      saveExpenses(SAMPLE_EXPENSES);
      renderExpenseList();
    }
  });

  renderExpenseList();
}

/*  Add / Edit form (add-expense.html)  */

function showError(fieldId, message) {
  document.getElementById(fieldId + "-error").textContent = message;
  document.getElementById(fieldId).classList.toggle("invalid", message !== "");
}

function setUpExpenseForm() {
  const form = document.getElementById("expense-form");
  const fields = {
    description: document.getElementById("description"),
    amount: document.getElementById("amount"),
    date: document.getElementById("date"),
    category: document.getElementById("category"),
    note: document.getElementById("note")
  };

  // ?id=... in the URL means we are editing an existing expense
  const editId = new URLSearchParams(window.location.search).get("id");
  const existing = editId ? findExpense(editId) : null;

  if (existing) {
    document.getElementById("form-title").textContent = "Edit Expense";
    document.title = "SpendLens - Edit Expense";
    document.getElementById("save-button").textContent = "Update Expense";
    fields.description.value = existing.description;
    fields.amount.value = existing.amount.toFixed(2);
    fields.date.value = existing.date;
    fields.category.value = existing.category;
    fields.note.value = existing.note;
  } else {
    fields.date.value = todayISO();
    if (editId) {
      document.getElementById("form-message").textContent =
        "That expense no longer exists, so a new one will be created.";
    }
  }

  // Validating it so we can show friendly messages under each field
  form.noValidate = true;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const description = fields.description.value.trim();
    const amount = Number(fields.amount.value);
    const date = fields.date.value;
    const category = fields.category.value;
    let valid = true;

    showError("description", "");
    showError("amount", "");
    showError("date", "");
    showError("category", "");

    if (description === "") {
      showError("description", "Please enter a description.");
      valid = false;
    }
    if (fields.amount.value === "" || isNaN(amount) || amount <= 0) {
      showError("amount", "Please enter an amount greater than $0.");
      valid = false;
    }
    if (date === "") {
      showError("date", "Please pick a date.");
      valid = false;
    }
    if (!CATEGORIES.includes(category)) {
      showError("category", "Please choose a category.");
      valid = false;
    }
    if (!valid) return;

    addOrUpdateExpense({
      id: existing ? existing.id : String(Date.now()),
      description: description,
      amount: Math.round(amount * 100) / 100,
      date: date,
      category: category,
      note: fields.note.value.trim()
    });

    window.location.href = "expenses.html";
  });
}

/* Start up  */
function highlightCurrentNavLink() {
  const page = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav a").forEach(function (link) {
    if (link.getAttribute("href") === page) link.classList.add("active");
  });
}

document.addEventListener("DOMContentLoaded", function () {
  highlightCurrentNavLink();
  const page = document.body.dataset.page;
  if (page === "dashboard") renderDashboard();
  if (page === "expenses") setUpExpenseList();
  if (page === "add-expense") setUpExpenseForm();
});
