// Example data for the table (you can replace this with your actual data)
const books = [
  {
    name: "Book 1",
    author: "Author 1",
    isbn: "1234567890",
    availability: "√",
  },
  {
    name: "Book 2",
    author: "Author 2",
    isbn: "0987654321",
    availability: "Χ",
  },
  // Add more book objects as needed
];

// Function to populate the table with book data
function populateTable() {
  const tableBody = document.querySelector("tbody");

  books.forEach((book) => {
    const row = document.createElement("tr");
    row.innerHTML = `
          <td>${book.name}</td>
          <td>${book.author}</td>
          <td>${book.isbn}</td>
          <td>${book.availability}</td>
      `;
    tableBody.appendChild(row);
  });
}

// Call the function to populate the table when the page loads
document.addEventListener("DOMContentLoaded", populateTable);
