# SpendLens
A simple expense tracker for college students. CPSC 349, Milestone 2.

Milestone 1 was a static HTML/CSS prototype. In Milestone 2, plain **JavaScript and DOM programming** make it work. It uses no frameworks or libraries.

## Features

- **Dashboard** (`index.html`): the total spent, the number of expenses, the biggest category, spending-by-category bars that resize to fit the data, and the 3 most recent expenses. All of it is worked out from the saved data.
- **Expenses** (`expenses.html`): a table built from the saved data.
  - The list filters as you type, by search text (description or note) and by category.
  - **Delete** asks for confirmation, then removes the expense.
  - **Edit** opens the form with that expense filled in.
  - The total updates for whatever the filter shows.
  - **Reset sample data** restores the starting data.
- **Add / Edit Expense** (`add-expense.html`): one form for adding and editing (`add-expense.html?id=...`). Each field shows its own error message if it's invalid, and the date starts as today.
- **Persistence**: expenses are saved in the browser's `localStorage`, so they're still there after a refresh.

## JavaScript concepts used

- DOM selection and creation: `getElementById`, `querySelectorAll`, `createElement`, `appendChild`
- Event handling: `submit`, `input`, `change`, `click`, `DOMContentLoaded`
- Event delegation: one click listener handles every Delete button
- Array methods: `filter`, `map`, `reduce`, `sort`, `find`, `findIndex`
- `localStorage` with `JSON.stringify` / `JSON.parse`
- `URLSearchParams`, to read the expense id for editing
- `textContent` is used for user input, so typed text can never be injected as HTML

## Running it

Open `index.html` in a browser. Or serve the folder:

```
python -m http.server 5500
```

then go to http://localhost:5500.

## Files
| File | Purpose |
| `index.html` | Dashboard |
| `expenses.html` | Expense list with filter, edit, and delete |
| `add-expense.html` | Add / edit form |
| `styles.css` | Shared styles |
| `app.js` | All the app logic |
