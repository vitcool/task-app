const { calculateTotalWithTip, fahrenheitToCelsius, celsiusToFahrenheit } = require('../src/math');

test('Should calculate total with tips', () => {
  const total = calculateTotalWithTip(10, 0.3);

  expect(total).toBe(13);
});

test('Should calculate tip with default value', () => {
  const total = calculateTotalWithTip(10);
  expect(total).toBe(11);
});

test('Should convert 32F to 0C', () => {
  const celsius = fahrenheitToCelsius(32);

  expect(celsius).toBe(0);
});

test('Should convert 0C to 32F', () => {
  const fahrenheit = celsiusToFahrenheit(0);

  expect(fahrenheit).toBe(32);
});

test('Async test code', (done) => {
  setTimeout(() => {
    expect(2).toBe(2);
    done();
  }, 2000);
});
