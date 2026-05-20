const subscriptions = [
  {
    name: "Netflix",
    oldPrice: 14.99,
    newPrice: 18.99
  },
  {
    name: "Spotify",
    oldPrice: 9.99,
    newPrice: 12.99
  },
  {
    name: "Disney+",
    oldPrice: 11.99,
    newPrice: 15.99
  }
];

const table = document.getElementById("subscription-table");

subscriptions.forEach(sub => {

  const percentIncrease =
    (((sub.newPrice - sub.oldPrice) / sub.oldPrice) * 100).toFixed(1);

  const row = `
    <tr>
      <td>${sub.name}</td>
      <td>$${sub.oldPrice}</td>
      <td>$${sub.newPrice}</td>
      <td>${percentIncrease}%</td>
    </tr>
  `;

  table.innerHTML += row;
});