import { KeyValue, HelperNumeric, InvalidArgumentError } from '../../ts';

describe('Classe HelperNumeric', () => {
  describe('random() deve retorna um número aleatório', () => {
    test('pode retornar comprimento maior que o range de números', () => {
      // Arrange, Given

      const bigLength = 100;

      // Act, When

      const bigNumber = HelperNumeric.random(bigLength);

      // Assert, Then

      expect(bigNumber.length).toBe(bigLength);
      for (const digit of bigNumber) {
        expect(Number.isFinite(Number.parseInt(digit))).toBe(true);
      }
    });
    test('o valor deve ser aleatório', () => {
      // Arrange, Given

      const percentAcceptableDeviation = 0.2;

      const bigLength = 10000;
      const sample: KeyValue<number> = {
        '0': 0,
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0,
        '6': 0,
        '7': 0,
        '8': 0,
        '9': 0
      };

      // Act, When

      const bigNumber = HelperNumeric.random(bigLength);

      // Assert, Then

      for (const digit of bigNumber) {
        sample[digit]++;
      }
      for (const digit in sample) {
        sample[digit] = Math.round((sample[digit] / bigNumber.length) * 100);
      }

      for (const digit in sample) {
        const deviation = sample[digit] / 10;
        expect(deviation).toBeGreaterThanOrEqual(
          1 - percentAcceptableDeviation
        );
        expect(deviation).toBeLessThanOrEqual(1 + percentAcceptableDeviation);
      }
    });
  });
  test('between deve retorna um número aleatório num intervalo', () => {
    // Arrange, Given

    const percentAcceptableDeviation = 0.4;

    const range = 100;

    const min = Math.floor(Math.random() * 10);
    const max = min + range;

    const sampleLength = range * 100;
    const sample: KeyValue<number> = {};
    for (let i = min; i <= max; i++) {
      sample[i.toString()] = 0;
    }

    // Act, When

    for (let i = 0; i < sampleLength; i++) {
      const random = HelperNumeric.between(min, max);
      sample[random.toString()]++;
    }

    // Assert, Then

    for (const digit in sample) {
      sample[digit] = Math.round((sample[digit] / range) * 100);
    }

    for (const digit in sample) {
      const deviation = sample[digit] / range;
      expect(deviation).toBeGreaterThanOrEqual(1 - percentAcceptableDeviation);
      expect(deviation).toBeLessThanOrEqual(1 + percentAcceptableDeviation);
    }
  });
  describe('sum deve somar ou subtrair números de qualquer comprimento', () => {
    describe('soma e subtração de dois números aleatórios', () => {
      const randomNumber = () =>
        HelperNumeric.between(-1000, 1000) +
        '.' +
        HelperNumeric.between(0, 1000);
      for (let i = 0; i < 100; i++) {
        let number1 = randomNumber();
        let number2 = randomNumber();
        test(`Teste ${i + 1}: ${number1} + ${number2}`, () => {
          // Arrange, Given

          const expectedResult = (
            Number.parseFloat(number1) + Number.parseFloat(number2)
          ).toString();

          // Act, When

          const result = HelperNumeric.sum(number1, number2);

          // Assert, Then
          const resultFormatted = Number.parseFloat(result).toFixed(10);
          const expectedResultFormatted =
            Number.parseFloat(expectedResult).toFixed(10);

          expect(resultFormatted).toBe(expectedResultFormatted);
        });
      }
    });
    test('deve falhar se o valor de entrada não for numérico', () => {
      // Arrange, Given

      const inputInvalidNumber = 'not a number';
      const inputEmptyValue = '';

      // Act, When

      const runWithInvalidNumber1 = () =>
        HelperNumeric.sum(inputInvalidNumber, '0');
      const runWithEmptyValue1 = () => HelperNumeric.sum(inputEmptyValue, '0');
      const runWithInvalidNumber2 = () =>
        HelperNumeric.sum('0', inputInvalidNumber);
      const runWithEmptyValue2 = () => HelperNumeric.sum('0', inputEmptyValue);

      // Assert, Then

      expect(runWithInvalidNumber1).toThrowError(InvalidArgumentError);
      expect(runWithEmptyValue1).toThrowError(InvalidArgumentError);
      expect(runWithInvalidNumber2).toThrowError(InvalidArgumentError);
      expect(runWithEmptyValue2).toThrowError(InvalidArgumentError);
    });
    test('deve conseguir incrementar um número muito grande', () => {
      // Arrange, Given

      const initialNumberLength = 500;
      const inputNumber = '9'.repeat(initialNumberLength);
      const expectedResult = '1' + '0'.repeat(inputNumber.length);

      // Act, When

      const result = HelperNumeric.sum(inputNumber, '1');

      // Assert, Then

      expect(result).toBe(expectedResult);
    });
  });
});
