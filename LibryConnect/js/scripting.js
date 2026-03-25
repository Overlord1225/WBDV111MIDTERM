(function () {
  const BOOKS_STORAGE_KEY = "libryBooksStateV3";

  function readJson(key, fallbackValue) {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallbackValue;
    }
    try {
      return JSON.parse(raw);
    } catch (error) {
      return fallbackValue;
    }
  }

  function clearLibraryStorage() {
    localStorage.removeItem("libryBooksState");
    localStorage.removeItem("libryBooksStateV2");
    localStorage.removeItem("libryBooksStateV3");
    localStorage.removeItem("libryUser");
  }

  function wireLogoutLinks() {
    document.querySelectorAll(".logout-link").forEach((link) => {
      link.addEventListener("click", () => {
        clearLibraryStorage();
      });
    });
  }

  function initSearchPage() {
    const defaultBooks = [
      { id: 1, title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", year: 1997, isbn: "9780590353427", cover: "img/harrypotterandsorcerstone.jpg", copies: 120, queue: 0, estimatedReturn: null, userDueDate: null, myHolds: 0 },
      { id: 2, title: "The Lord of the Rings", author: "J.R.R. Tolkien", year: 1954, isbn: "9780618640157", cover: "img/thelordoftherings.jpeg", copies: 120, queue: 0, estimatedReturn: null, userDueDate: null, myHolds: 0 },
      { id: 3, title: "To Kill a Mockingbird", author: "Harper Lee", year: 1960, isbn: "9780061120084", cover: "img/tokillamockingbird.jpg", copies: 120, queue: 0, estimatedReturn: null, userDueDate: null, myHolds: 0 },
      { id: 4, title: "Pride and Prejudice", author: "Jane Austen", year: 1813, isbn: "9780141439518", cover: "img/prideprejudice.jpg", copies: 120, queue: 0, estimatedReturn: null, userDueDate: null, myHolds: 0 },
      { id: 5, title: "The Hunger Games", author: "Suzanne Collins", year: 2008, isbn: "9780439023481", cover: "img/thehungergames.jpg", copies: 120, queue: 0, estimatedReturn: null, userDueDate: null, myHolds: 0 },
      { id: 6, title: "The Great Gatsby", author: "F. Scott Fitzgerald", year: 1925, isbn: "9780743273565", cover: "img/greatgatsby.jpg", copies: 120, queue: 0, estimatedReturn: null, userDueDate: null, myHolds: 0 },
      { id: 7, title: "Leviathan (Project Moon Webcomic)", author: "Project Moon", year: 2023, isbn: "WEBCOMIC-LEVIATHAN", cover: "img/LeviathanCover.jpg", copies: 120, queue: 0, estimatedReturn: null, userDueDate: null, myHolds: 0 }
    ];

    function loadBooks() {
      const stored = localStorage.getItem(BOOKS_STORAGE_KEY);
      if (!stored) {
        return defaultBooks.map((book) => ({ ...book }));
      }
      try {
        const parsed = JSON.parse(stored);
        return defaultBooks.map((book) => {
          const match = parsed.find((item) => item.id === book.id) || {};
          return { ...book, ...match, myHolds: Number(match.myHolds || 0) };
        });
      } catch (error) {
        return defaultBooks.map((book) => ({ ...book }));
      }
    }

    const books = loadBooks();
    const resultsEl = document.getElementById("results");
    const searchInput = document.getElementById("book-search");
    const searchBtn = document.getElementById("search-btn");
    const loanNotice = document.getElementById("loan-notice");
    const coverModal = document.getElementById("cover-modal");
    const coverPreview = document.getElementById("cover-preview");
    const coverClose = document.getElementById("cover-close");
    const MAX_ACTIVE_LOANS = 3;
    const MAX_ACTIVE_HOLDS = 5;

    function saveBooks() {
      localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
    }

    function activeHoldCount() {
      return books.reduce((sum, book) => sum + Number(book.myHolds || 0), 0);
    }

    function activeLoanCount() {
      return books.filter((book) => book.userDueDate).length;
    }

    function showNotice(message) {
      loanNotice.textContent = message;
    }

    function formatDate(date) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    }

    function dueDateFromToday(daysToAdd) {
      const date = new Date();
      date.setDate(date.getDate() + daysToAdd);
      return formatDate(date);
    }

    function getStatus(book) {
      if (book.copies > 1) {
        return { label: "Available", className: "available", meta: book.copies + " copies ready for loan" };
      }
      if (book.copies === 1) {
        return { label: "1 Copy Left", className: "limited", meta: "Borrow soon before it is checked out." };
      }
      return {
        label: "Checked Out",
        className: "unavailable",
        meta: "Queue: " + book.queue + " holds"
      };
    }

    function getDueText(book) {
      if (book.userDueDate) {
        return "Your due date: " + book.userDueDate;
      }
      if (book.copies === 0 && book.estimatedReturn) {
        return "Next expected return: " + book.estimatedReturn;
      }
      return "Due date tracking starts after checkout.";
    }

    function getUserCardStatus(book) {
      const hasLoan = Boolean(book.userDueDate);
      const hasHold = Number(book.myHolds || 0) > 0;

      if (hasLoan && hasHold) {
        return { text: "You are currently loaning and holding this title.", className: "active" };
      }
      if (hasLoan) {
        return { text: "You are currently loaning this title.", className: "active" };
      }
      if (hasHold) {
        return { text: "You are currently holding this title.", className: "hold" };
      }
      return { text: "No active loan or hold for this title.", className: "idle" };
    }

    function renderBooks(filterText) {
      const query = filterText.trim().toLowerCase();
      const filtered = books.filter((book) => {
        if (!query) {
          return true;
        }
        const source = (book.title + " " + book.author + " " + book.isbn).toLowerCase();
        return source.includes(query);
      });

      if (filtered.length === 0) {
        resultsEl.innerHTML = '<p class="empty-results">No books found. Try another title, author, or ISBN.</p>';
        return;
      }

      resultsEl.innerHTML = filtered.map((book) => {
        const status = getStatus(book);
        const canLoan = book.copies > 0;
        const hasLoan = Boolean(book.userDueDate);
        const hasHold = Number(book.myHolds || 0) > 0;
        const userStatus = getUserCardStatus(book);

        return `
          <article class="result-card" data-id="${book.id}">
            <div class="book-head">
              <img class="book-cover" src="${book.cover}" alt="${book.title} cover" loading="lazy" />
              <div>
                <h2 class="book-title">${book.title}</h2>
                <p class="book-meta">${book.author} • ${book.year} • ISBN ${book.isbn}</p>
              </div>
            </div>
            <div class="status-row">
              <span class="pill ${status.className}">${status.label}</span>
              <span class="book-meta">${status.meta}</span>
            </div>
            <div class="actions">
              <button class="primary" type="button" data-action="loan" ${canLoan ? "" : "disabled"}>Loan Now</button>
              <button type="button" data-action="cancel-loan" ${hasLoan ? "" : "disabled"}>Cancel Loan</button>
              <button type="button" data-action="hold" ${hasHold ? "disabled" : ""}>Place Hold</button>
              <button type="button" data-action="cancel-hold" ${hasHold ? "" : "disabled"}>Cancel Hold</button>
            </div>
            <div class="user-status ${userStatus.className}">${userStatus.text}</div>
            <div class="due-date">${getDueText(book)}</div>
          </article>
        `;
      }).join("");
    }

    function runSearch() {
      renderBooks(searchInput.value);
    }

    searchBtn.addEventListener("click", runSearch);
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        runSearch();
      }
    });

    resultsEl.addEventListener("click", (event) => {
      const cover = event.target.closest(".book-cover");
      if (cover) {
        coverPreview.src = cover.src;
        coverPreview.alt = cover.alt;
        coverModal.classList.add("open");
        coverModal.setAttribute("aria-hidden", "false");
        return;
      }

      const button = event.target.closest("button[data-action]");
      if (!button) {
        return;
      }

      const card = event.target.closest(".result-card");
      const bookId = Number(card.dataset.id);
      const book = books.find((item) => item.id === bookId);
      if (!book) {
        return;
      }

      if (button.dataset.action === "loan") {
        if (book.copies < 1) {
          showNotice("This book is currently unavailable for loan.");
          return;
        }
        if (book.userDueDate) {
          showNotice("You already borrowed this title.");
          return;
        }
        if (activeLoanCount() >= MAX_ACTIVE_LOANS) {
          showNotice("Loan limit reached: 3 active books maximum.");
          return;
        }
        book.copies -= 1;
        book.userDueDate = dueDateFromToday(14);
        if (book.copies === 0) {
          book.estimatedReturn = book.userDueDate;
        }
        showNotice("Loan successful. Active loans: " + activeLoanCount() + "/" + MAX_ACTIVE_LOANS + ".");
      }

      if (button.dataset.action === "cancel-loan") {
        if (!book.userDueDate) {
          showNotice("No active loan to cancel for this title.");
          return;
        }
        book.userDueDate = null;
        book.copies += 1;
        if (book.copies > 0) {
          book.estimatedReturn = null;
        }
        showNotice("Loan canceled. Book returned successfully.");
      }

      if (button.dataset.action === "hold") {
        if (Number(book.myHolds || 0) > 0) {
          showNotice("You can only place one hold per book. Cancel current hold first.");
          return;
        }
        if (activeHoldCount() >= MAX_ACTIVE_HOLDS) {
          showNotice("Hold limit reached: 5 active holds maximum.");
          return;
        }
        book.queue += 1;
        book.myHolds = 1;
        if (book.copies === 0 && !book.estimatedReturn) {
          book.estimatedReturn = dueDateFromToday(10);
        }
        showNotice("Hold placed successfully. Active holds: " + activeHoldCount() + "/" + MAX_ACTIVE_HOLDS + ".");
      }

      if (button.dataset.action === "cancel-hold") {
        if (Number(book.myHolds || 0) < 1) {
          showNotice("No active hold to cancel for this title.");
          return;
        }
        book.myHolds = 0;
        if (book.queue > 0) {
          book.queue -= 1;
        }
        showNotice("Hold canceled successfully.");
      }

      saveBooks();
      renderBooks(searchInput.value);
    });

    saveBooks();
    renderBooks("");

    coverClose.addEventListener("click", () => {
      coverModal.classList.remove("open");
      coverModal.setAttribute("aria-hidden", "true");
      coverPreview.src = "";
    });

    coverModal.addEventListener("click", (event) => {
      if (event.target === coverModal) {
        coverClose.click();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && coverModal.classList.contains("open")) {
        coverClose.click();
      }
    });
  }

  function initProfilePage() {
    function initials(name) {
      const parts = name.trim().split(/\s+/).filter(Boolean);
      return (parts[0]?.[0] || "") + (parts[1]?.[0] || parts[0]?.[1] || "");
    }

    localStorage.removeItem("libryUser");
    const books = readJson("libryBooksStateV3", readJson("libryBooksStateV2", readJson("libryBooksState", [])));

    const profileName = document.getElementById("profile-name");
    const profileRole = document.getElementById("profile-role");
    const avatar = document.getElementById("avatar");
    const details = document.getElementById("profile-details");
    const borrowedCount = document.getElementById("stats-borrowed");
    const holdCount = document.getElementById("stats-holds");
    const loanList = document.getElementById("loan-list");
    const holdList = document.getElementById("hold-list");

    profileName.textContent = "Library Member";
    profileRole.textContent = "Profile is no longer stored locally.";
    avatar.textContent = initials("Library Member").toUpperCase();
    details.innerHTML = `
      <li><strong>Member ID:</strong> Session only</li>
      <li><strong>Email:</strong> Not stored</li>
      <li><strong>Status:</strong> Active</li>
    `;

    const activeLoans = books.filter((book) => book.userDueDate);
    const activeHolds = books.filter((book) => Number(book.myHolds || 0) > 0);
    borrowedCount.textContent = String(activeLoans.length);
    holdCount.textContent = String(activeHolds.reduce((sum, book) => sum + Number(book.myHolds || 0), 0));

    loanList.innerHTML = activeLoans.length
      ? activeLoans.map((book) => `
          <div class="loan-item">
            <div>
              <p class="book">${book.title}</p>
              <p class="meta">${book.author} • ISBN ${book.isbn}</p>
            </div>
            <span class="pill limited">Due ${book.userDueDate}</span>
          </div>
        `).join("")
      : '<p class="empty-state">No active loans yet. Borrow books from the search page.</p>';

    holdList.innerHTML = activeHolds.length
      ? activeHolds.map((book) => `
          <div class="loan-item">
            <div>
              <p class="book">${book.title}</p>
              <p class="meta">${book.author}</p>
            </div>
            <span class="pill unavailable">Your holds: ${book.myHolds}</span>
          </div>
        `).join("")
      : '<p class="empty-state">No holds yet. Place a hold from the search page.</p>';
  }

  document.addEventListener("DOMContentLoaded", () => {
    wireLogoutLinks();

    if (document.body.classList.contains("page-search")) {
      initSearchPage();
    }

    if (document.body.classList.contains("page-profile")) {
      initProfilePage();
    }
  });
})();
