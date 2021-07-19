const http = require('http');
const hostname = 'localhost';
const port = 8080;
const person = JSON.stringify({ name: 'Bob', age: 92, hair: false });
http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(person);
  })
  .listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  })

// Get data from menu.json

// Based on query, return all menu items with price, total price

// randomize and choose first however many

// 1 person 9 pieces, no restrictions
// Example: 1 steamed pork bun (2), 1 chinese broccoli w/ oyster sauce (3), 1 taro crescent (2), 1 roast pork bun (2)

// 2 people 18 pieces

// 3 people 27 pieces

// 1 person, no restrictions

// considerations -- everyone should get to try everything? give weight to certain popular items or weight to items with only 2 pieces

const fs = require('fs');
let menuData = {};
fs.readFile('menu.json', 'utf-8', (err, data) => {
  if (err) throw err;

  menuData = JSON.parse(data);
  console.log(menuData);
});

/* create array of arrays of all possible order combinations where the total number of pieces doesn't surpass 9
    how? recursion
*/
// assign id to each order
// of those ided arrays, randomly select a number to represent the order array to send
// provide total cost - using reduce
// return line items of order plus total cost
// todo -- how to loop back through if the sum is less than the

/**
 * @function curateOrder
 * @param {integer} numOfPeople
 * @param {boolean} noDuplicates
 * @returns {array}
 */
const curateOrder = (numOfPeople, noDuplicates) => {
  // var for constructing order.
  let order = [];

  // const 9 pieces per person.
  const maxPieces = numOfPeople * 9;

  // Get all combinations of orders (not exceeding maxPieces);
  const options = generatePossibleOptions(maxPieces, noDuplicates);

  // Randomly select an order from the options.
  const randomOrderIndex = Math.floor(Math.random() * (options.length + 1));
  const chosenOrder = options[randomOrderIndex];

  // Calculate total price of order.
  let initialValue = 0;
  const chosenOrderTotalPrice = chosenOrder.reduce((acc, cur) => {
    return acc + cur.price;
  }, initialValue);

  const chosenOrderTotalPieces = chosenOrder.reduce((acc, cur) => {
    return acc + cur.amountPerOrder;
  }, initialValue);

  // Construct order text.
  // TODO: reduce if a menuItem is a duplicate (ex:2 orders of chinese broccoli)
  order['items'] = chosenOrder.map(menuItem => ({
    item: menuItem.item,
    price: menuItem.price,
  }));

  // const why = order['items'].reduce((prev, cur) => {
  //   prev[cur] = (prev[cur] || 0) + 1;
  //   return prev;
  // }, {});
  // console.log('why', why);

  // Add total.
  order['total'] = `$${chosenOrderTotalPrice}`;

  // Add total pieces to double check work.
  order['pieces'] = chosenOrderTotalPieces;

  return order;
}

/**
 * @function possibleOptions
 * @param {integer} maxPieces
 * @param {boolean} noDuplicates
 * @returns {array}
 */
function generatePossibleOptions(maxPieces, noDuplicates) {
  /**
   * @const orderCombinationsRecursive
   * @param {array} menu
   * @param {integer} maxPieces
   * @param {array} currentOptions
   * @param {array} finalOptions
   * @returns {array}
   */
  const orderCombinationsRecursive = (
    menu,
    maxPieces,
    currentOptions = [],
    sumPieces = 0,
    finalOptions = []
  ) => (
    sumPieces < maxPieces
      ? menu.forEach((menuItem, i) =>
          orderCombinationsRecursive(
            // i + 1 prevented duplicates, i includes duplicates
            menu.slice(noDuplicates ? i + 1 : i),
            maxPieces,
            [...currentOptions, menuItem],
            sumPieces + menuItem.amountPerOrder,
            finalOptions
          )
        )
      : sumPieces == maxPieces
      ? finalOptions.push(currentOptions)
      : 0,
    finalOptions
  );

  return orderCombinationsRecursive(menu, maxPieces);
}

console.log('order for 1 person', curateOrder(1));
console.log('order for 2 people', curateOrder(2));
console.log('order for 3 people', curateOrder(3));
