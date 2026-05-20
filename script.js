const subscriptions = [
  {
    name: "Netflix",
    oldPrice: 14.99,
    newPrice: 16.49
  },
  {
    name: "Spotify",
    oldPrice: 9.99,
    newPrice: 10.99
  },
  {
    name: "Disney+",
    oldPrice: 11.99,
    newPrice: 15.99
  }
];

const table = document.getElementById("subscription-table");

let totalIncrease = 0;

subscriptions.forEach(sub => {

  const increase = sub.newPrice - sub.oldPrice;

  totalIncrease += increase;

  const percentIncrease =
    (((increase) / sub.oldPrice) * 100).toFixed(1);

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

document.getElementById("total-increase").innerText =
  `Monthly Cost Increase: $${totalIncrease.toFixed(2)}`;