import { HelperList } from '../../ts';
import { InvalidExecutionError } from '../../ts/Error/InvalidExecutionError';

describe('Classe HelperList', () => {
  test('Não deve permitir instanciar', () => {
    // Arrange, Given
    // Act, When

    const instantiate = () => new HelperList();

    // Assert, Then

    expect(instantiate).toThrowError(InvalidExecutionError);
  });

  test('getRandom deve retornar um elemento aleatório da lista', () => {
    // Arrange, Given

    const sampleLength = 1000;
    const sample = [];

    const item1 = 'qualquer coisa';
    const item2 = 'outra coisa';
    const list = [item1, item2];

    // Act, When

    for (let i = 0; i < sampleLength; i++) {
      sample.push(HelperList.getRandom(list));
    }

    // Assert, Then

    const sampleOfItem1 = sample.filter(item => item === item1).length / sampleLength;
    const sampleOfItem2 = sample.filter(item => item === item2).length / sampleLength;
    const reason = Math.round(sampleOfItem1 / sampleOfItem2);

    expect(reason).toBe(1);
  });
});