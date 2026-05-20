const subscriptions = [
  {
    name: "Netflix",
    oldPrice: 14.99,
    newPrice: 16.49
  }
];

const table = document.getElementById("subscription-table");

const totalIncreaseElement =
  document.getElementById("total-increase");

function renderSubscriptions() {

  table.innerHTML = "";

  let totalIncrease = 0;

  subscriptions.forEach(sub => {

    const increase = sub.newPrice - sub.oldPrice;

    totalIncrease += increase;

    const percentIncrease =
      ((increase / sub.oldPrice) * 100).toFixed(1);

    let warningClass = "";

    if (percentIncrease >= 25) {
      warningClass = "warning";
    }

    const row = `
      <tr class="${warningClass}">
        <td>${sub.name}</td>
        <td>$${sub.oldPrice.toFixed(2)}</td>
        <td>$${sub.newPrice.toFixed(2)}</td>
        <td>${percentIncrease}%</td>
      </tr>
    `;

    table.innerHTML += row;
  });

  totalIncreaseElement.innerText =
    `Monthly Cost Increase: $${totalIncrease.toFixed(2)}`;
}

renderSubscriptions();

document
  .getElementById("add-btn")
  .addEventListener("click", () => {

    const name =
      document.getElementById("name").value;

    const oldPrice =
      parseFloat(document.getElementById("old-price").value);

    const newPrice =
      parseFloat(document.getElementById("new-price").value);

    if (!name || !oldPrice || !newPrice) {
      alert("Please fill out all fields.");
      return;
    }

    subscriptions.push({
      name,
      oldPrice,
      newPrice
    });

    renderSubscriptions();

    document.getElementById("name").value = "";
    document.getElementById("old-price").value = "";
    document.getElementById("new-price").value = "";
  });